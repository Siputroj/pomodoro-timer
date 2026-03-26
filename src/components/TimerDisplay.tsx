import { VerticalDrum } from './VerticalDrum';

interface TimerDisplayProps {
  secondsLeft: number;
  isActive: boolean;
  onTimeChange: (newSeconds: number) => void;
}

export function TimerDisplay({ secondsLeft, isActive, onTimeChange }: TimerDisplayProps) {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const handleMinutesChange = (m: number) => {
    onTimeChange(m * 60 + seconds);
  };

  const handleSecondsChange = (s: number) => {
    onTimeChange(minutes * 60 + s);
  };

  if (isActive) {
    return (
      <div className="active-timer-display pixel-text neon-text">
        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </div>
    );
  }

  return (
    <div className="timer-display">
      <VerticalDrum 
        value={minutes} 
        max={120} 
        onChange={handleMinutesChange} 
        disabled={isActive} 
      />
      
      <div className="timer-separator pixel-text neon-text">
        :
      </div>

      <VerticalDrum 
        value={seconds} 
        max={59} 
        onChange={handleSecondsChange} 
        disabled={isActive} 
      />
      
      {/* Label under the drums */}
      <div className="timer-label min-label">
        MIN
      </div>
      <div className="timer-label sec-label">
        SEC
      </div>
    </div>
  );
}
