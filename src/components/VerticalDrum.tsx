import type { WheelEvent } from 'react';
import { useEffect, useRef } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';

interface VerticalDrumProps {
  value: number;
  max: number;
  onChange: (val: number) => void;
  disabled: boolean;
  pad?: number;
}

const ITEM_HEIGHT = 120; // 120px tall per digit

export function VerticalDrum({ value, max, onChange, disabled, pad = 2 }: VerticalDrumProps) {
  const y = useMotionValue(-value * ITEM_HEIGHT);
  const isDragging = useRef(false);

  useEffect(() => {
    // Only animate if we are not currently dragging
    if (!isDragging.current) {
      animate(y, -value * ITEM_HEIGHT, { 
        type: 'spring', 
        stiffness: 300, 
        damping: 30 
      });
    }
  }, [value, y]);

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    if (disabled) return;
    // Debounce or just use deltaY sign
    const delta = Math.sign(e.deltaY);
    if (delta !== 0) {
      const nextVal = Math.max(0, Math.min(value + delta, max));
      onChange(nextVal);
    }
  };

  return (
    <div 
      className="vertical-drum-container"
      onWheel={handleWheel}
      style={{ 
        height: ITEM_HEIGHT * 3, // Shows 3 items (previous, current, next)
        width: '140px'
      }}
    >
      <motion.div
        drag={disabled ? false : "y"}
        dragConstraints={{ top: -max * ITEM_HEIGHT, bottom: 0 }}
        dragElastic={0.1}
        style={{ y, paddingTop: ITEM_HEIGHT, paddingBottom: ITEM_HEIGHT }}
        onDragStart={() => {
          isDragging.current = true;
        }}
        onDragEnd={(_e, info) => {
          isDragging.current = false;
          // Calculate the nearest index based on the velocity and current position for a physical feel
          const projectedY = y.get() + info.velocity.y * 0.1;
          const targetIndex = Math.round(-projectedY / ITEM_HEIGHT);
          const clamped = Math.max(0, Math.min(targetIndex, max));
          
          onChange(clamped);
          
          // Also snap visually immediately in case the parent state hasn't propagated yet
          animate(y, -clamped * ITEM_HEIGHT, { 
            type: 'spring', 
            stiffness: 400, 
            damping: 40 
          });
        }}
        className="drum-track"
      >
        {Array.from({ length: max + 1 }).map((_, i) => {
          const isCurrent = i === value;
          return (
            <div 
              key={i} 
              className={`drum-item pixel-text ${isCurrent ? 'current neon-text' : 'faded'}`}
              style={{ 
                height: ITEM_HEIGHT,
                fontSize: isCurrent ? '8rem' : '5rem' // slightly smaller for non-active
              }}
            >
              {i.toString().padStart(pad, '0')}
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
