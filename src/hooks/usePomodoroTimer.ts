import { useState, useEffect, useRef, useCallback } from 'react';
import { AudioService } from '../services/AudioService';

export type Mode = 'Lock In' | 'Break';

export interface UsePomodoroTimerReturn {
  mode: Mode;
  isActive: boolean;
  secondsLeft: number;
  isTimerUp: boolean;
  toggleActivity: () => void;
  resetTimer: () => void;
  changeMode: (newMode: Mode) => void;
  proceedToNextPhase: () => void;
  setSecondsLeft: (seconds: number) => void;
  skipBreak: () => void;
}

const getStoredDefault = (mode: Mode, fallback: number) => {
  const item = localStorage.getItem(`${mode}_default`);
  return item ? parseInt(item, 10) : fallback;
};

const setStoredDefault = (mode: Mode, val: number) => {
  localStorage.setItem(`${mode}_default`, val.toString());
};

export function usePomodoroTimer(): UsePomodoroTimerReturn {
  const [mode, setMode] = useState<Mode>('Lock In');
  const [isActive, setIsActive] = useState(false);
  const [secondsLeft, setSecondsLeftState] = useState(() => getStoredDefault('Lock In', 3600));
  const [isTimerUp, setIsTimerUp] = useState(false);
  
  // Track the actual end time in absolute epoch ms
  const endTimeRef = useRef<number | null>(null);
  
  // Track the duration the session was started with, to save it as default
  const sessionDurationRef = useRef<number>(secondsLeft);

  const setSecondsLeft = useCallback((seconds: number) => {
    // Hard cap at 7200 sec (120 mins)
    const capped = Math.min(Math.max(0, seconds), 7200);
    setSecondsLeftState(capped);
    
    if (isActive) {
      if (capped === 0) {
        // Technically they scrolled to 0 while active, which finishes it
        setIsActive(false);
        finishSession(mode);
      } else {
        // Shift the end time
        endTimeRef.current = Date.now() + capped * 1000;
      }
    }
  }, [isActive, mode]);

  const changeMode = useCallback((newMode: Mode) => {
    setMode(newMode);
    setIsActive(false);
    setIsTimerUp(false);
    endTimeRef.current = null;
    const defaultSecs = getStoredDefault(newMode, newMode === 'Lock In' ? 3600 : 300);
    setSecondsLeftState(defaultSecs);
  }, []);

  const finishSession = useCallback((finishedMode: Mode) => {
    AudioService.playBeep(finishedMode);
    AudioService.showBrowserNotification(
      `${finishedMode} Complete!`,
      finishedMode === 'Lock In' ? 'Time for a break.' : 'Time to lock in.'
    );
    
    // Save duration
    setStoredDefault(finishedMode, sessionDurationRef.current);
    
    // Manual transition state
    setIsTimerUp(true);
  }, []);

  const proceedToNextPhase = useCallback(() => {
    setIsTimerUp(false);
    const nextMode = mode === 'Lock In' ? 'Break' : 'Lock In';
    changeMode(nextMode);
  }, [mode, changeMode]);

  const toggleActivity = useCallback(() => {
    if (isActive) {
      // Pausing
      setIsActive(false);
      endTimeRef.current = null;
      // We also consider pausing a "stop", so let's save default here as well
      setStoredDefault(mode, sessionDurationRef.current);
    } else {
      // Starting
      if (secondsLeft === 0) return;
      setIsActive(true);
      endTimeRef.current = Date.now() + secondsLeft * 1000;
      sessionDurationRef.current = secondsLeft;
      // Request audio context permission on first interaction
      AudioService.init();
    }
  }, [isActive, secondsLeft, mode]);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    endTimeRef.current = null;
    const defaultSecs = getStoredDefault(mode, mode === 'Lock In' ? 3600 : 300);
    setSecondsLeftState(defaultSecs);
  }, [mode]);

  const skipBreak = useCallback(() => {
    if (mode === 'Break') {
      setIsActive(false);
      changeMode('Lock In');
    }
  }, [mode, changeMode]);

  // Main timer loop using `requestAnimationFrame` for high precision UI updates,
  // falling back nicely since `Date.now()` is absolute.
  useEffect(() => {
    let frameId: number;
    let fallbackTimeout: ReturnType<typeof setTimeout> | undefined;

    const tick = () => {
      if (isActive && endTimeRef.current) {
        const now = Date.now();
        const left = Math.ceil((endTimeRef.current - now) / 1000);
        
        if (left <= 0) {
          setSecondsLeftState(0);
          setIsActive(false);
          finishSession(mode);
          return;
        } else {
          // Only update state if it changed to avoid excessive re-renders
          setSecondsLeftState(prev => prev !== left ? left : prev);
        }
      }
      frameId = requestAnimationFrame(tick);
    };

    if (isActive) {
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(frameId);
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
    };
  }, [isActive, mode, finishSession]);

  // Page Visibility API trick: when tab is invisible, requestAnimationFrame might throttle.
  // We use visibilitychange to force an immediate tick when returning.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isActive && endTimeRef.current) {
        const now = Date.now();
        const left = Math.max(0, Math.ceil((endTimeRef.current - now) / 1000));
        if (left <= 0) {
          setSecondsLeftState(0);
          setIsActive(false);
          finishSession(mode);
        } else {
          setSecondsLeftState(left);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isActive, mode, finishSession]);

  return {
    mode,
    isActive,
    isTimerUp,
    secondsLeft,
    toggleActivity,
    resetTimer,
    changeMode,
    setSecondsLeft,
    skipBreak,
    proceedToNextPhase
  };
}
