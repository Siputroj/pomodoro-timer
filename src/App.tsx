import { useEffect } from 'react';
import { useState } from 'react';
import { usePomodoroTimer } from './hooks/usePomodoroTimer';
import { TimerDisplay } from './components/TimerDisplay';
import { Controls } from './components/Controls';
import FaultyTerminal from './components/FaultyTerminal';
import { Monitor, MonitorOff } from 'lucide-react';

function App() {
  const [showBg, setShowBg] = useState(true);
  const {
    mode,
    isActive,
    isTimerUp,
    secondsLeft,
    toggleActivity,
    resetTimer,
    setSecondsLeft,
    skipBreak,
    proceedToNextPhase
  } = usePomodoroTimer();

  useEffect(() => {
    document.body.className = mode === 'Lock In' ? 'theme-lockin' : 'theme-break';
  }, [mode]);

  return (
    <>
      {showBg && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}>
          <FaultyTerminal 
            tint={mode === 'Lock In' ? '#b050ff' : '#00ff66'}
            className=""
            style={{}}
          />
        </div>
      )}
      <div className="app-container">
      
      {/* Background Toggle */}
      <button 
        className="bg-toggle-btn" 
        onClick={() => setShowBg(!showBg)}
        title="Toggle Background"
      >
        {showBg ? <Monitor size={20} /> : <MonitorOff size={20} />}
        <span>BG {showBg ? 'ON' : 'OFF'}</span>
      </button>

      <div className="powered-by pixel-text">
        Powered by Gemini
      </div>
      {/* Corner UI Accents */}
      <div className="corner-accent corner-tl"></div>
      <div className="corner-accent corner-tr"></div>
      <div className="corner-accent corner-bl"></div>
      <div className="corner-accent corner-br"></div>

      <div className="absolute top-0 left-0 p-8">
        <div className="font-bold pixel-text text-2xl tracking-widest uppercase transition-colors duration-500" 
             style={{ color: mode === 'Lock In' ? 'var(--lockin-primary)' : 'var(--break-primary)' }}>
          POMODORO
        </div>
      </div>

      <div className="main-content">
        <div className="header-box">
          <h1 className="pixel-text phase-title">
            {mode === 'Lock In' ? 'Lock In Phase' : 'Recovery Phase'}
          </h1>
        </div>
        
        <p className="phase-subtitle">
          {mode === 'Lock In' ? 'Target: Deep Work' : 'Target: Mental Refreshment'}
        </p>

        <TimerDisplay 
          secondsLeft={secondsLeft} 
          isActive={isActive} 
          onTimeChange={setSecondsLeft} 
        />

        <Controls 
          mode={mode}
          isActive={isActive}
          toggleActivity={toggleActivity}
          resetTimer={resetTimer}
          skipBreak={skipBreak}
          setSecondsLeft={setSecondsLeft}
        />

      </div>

      {/* Timer Completion Modal */}
      {isTimerUp && (
        <div className="completion-modal-overlay">
          <div className="completion-modal">
            <h2 className="pixel-text neon-text">Phase Complete!</h2>
            <p className="pixel-text">Great job. Please prepare for the next phase.</p>
            <button 
              className="btn-start pixel-text neon-bg" 
              style={{ marginTop: '2rem', fontSize: '2rem', width: '100%', padding: '1rem' }}
              onClick={proceedToNextPhase}
            >
              Start {mode === 'Lock In' ? 'Recovery' : 'Lock In'}
            </button>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

export default App;
