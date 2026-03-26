import type { Mode } from '../hooks/usePomodoroTimer';
import { Play, Pause, RotateCcw, FastForward } from 'lucide-react';

interface ControlsProps {
  mode: Mode;
  isActive: boolean;
  toggleActivity: () => void;
  resetTimer: () => void;
  skipBreak: () => void;
  setSecondsLeft: (seconds: number) => void;
}

export function Controls({
  mode,
  isActive,
  toggleActivity,
  resetTimer,
  skipBreak,
  setSecondsLeft
}: ControlsProps) {
  const quickJumps = [15, 30, 45, 60];

  return (
    <div className="controls-container">
      
      {/* Quick Jump Buttons */}
      {!isActive && (
        <div className="quick-jumps">
          {quickJumps.map(mins => (
            <button
              key={mins}
              disabled={isActive}
              onClick={() => setSecondsLeft(mins * 60)}
              className="btn-jump pixel-text"
              title={`Jump to ${mins} minutes`}
            >
              {mins}M
            </button>
          ))}
        </div>
      )}

      {/* Main Action Buttons */}
      <div className="main-actions">
        <button
          onClick={toggleActivity}
          className="btn-start neon-bg pixel-text"
        >
          {isActive ? <Pause fill="black" size={32} /> : <Play fill="black" size={32} />}
          {isActive ? 'Pause' : `Start ${mode}`}
        </button>

        <button
          onClick={resetTimer}
          className="btn-reset"
          title="Reset Session"
        >
          <RotateCcw size={24} />
          <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Reset</span>
        </button>

        {mode === 'Break' && (
          <button
            onClick={skipBreak}
            className="btn-skip pixel-text"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FastForward size={24} fill="#ff4444" />
              Skip Break
            </div>
          </button>
        )}
      </div>

    </div>
  );
}
