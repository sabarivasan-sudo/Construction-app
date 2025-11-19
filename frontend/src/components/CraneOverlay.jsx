import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

/**
 * CraneOverlay - Tower Crane Animation (like lottery machines)
 * Full tower crane with vertical tower, horizontal jib, and hook
 * Props:
 *  - dropTimes: array of seconds at which to call onDrop(index)
 *  - onDrop(index): called when animation reaches dropTimes[index]
 *  - onComplete(): called when animation completes
 */
const CraneOverlay = ({ 
  dropTimes = [1.8, 3.8, 5.8, 7.8], 
  onDrop = () => {}, 
  onComplete = () => {} 
}) => {
  const [started, setStarted] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const firedRef = useRef(new Set());

  // Card positions (percentage from left for 4 cards in grid)
  const cardPositions = [12.5, 37.5, 62.5, 87.5];

  // Start animation after 180ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setStarted(true);
    }, 180);

    return () => clearTimeout(timer);
  }, []);

  // Trigger drop events and update position
  useEffect(() => {
    if (!started) return;

    const totalDuration = Math.max(...dropTimes) + 1;
    
    const timers = dropTimes.map((sec, idx) => {
      return setTimeout(() => {
        if (!firedRef.current.has(idx)) {
          firedRef.current.add(idx);
          setCurrentCardIndex(idx);
          setTimeout(() => onDrop(idx), 50);
        }
      }, sec * 1000);
    });

    // Call onComplete after all drops
    const completeTimer = setTimeout(() => {
      onComplete();
    }, totalDuration * 1000);

    return () => {
      timers.forEach(timer => clearTimeout(timer));
      clearTimeout(completeTimer);
    };
  }, [started, dropTimes, onDrop, onComplete]);

  // Calculate current X position based on card index
  const currentX = cardPositions[currentCardIndex] || cardPositions[0];

  return (
    <div className="absolute inset-x-0 top-0 h-[50vh] md:h-[35vh] pointer-events-none z-30 overflow-hidden">
      {/* Tower Crane - Moves horizontally like lottery machine */}
      <motion.div
        initial={{ x: '50%', y: -150 }}
        animate={started ? {
          x: [
            '50%', // Start center
            `${currentX}%`, // Move to current card position
          ],
          y: [0, 0], // Stay at top
        } : {}}
        transition={{
          x: {
            duration: 0.8,
            ease: [0.4, 0, 0.2, 1], // Smooth mechanical movement
          },
        }}
        className="relative"
        style={{
          willChange: 'transform',
          transform: 'translateZ(0)',
          left: 0,
        }}
      >
        {/* Vertical Tower - Main structure */}
        <motion.div
          className="absolute"
          style={{
            width: '40px',
            height: '200px',
            backgroundColor: '#9CA3AF',
            borderRadius: '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            top: '0px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            border: '3px solid #4B5563',
          }}
        >
          {/* Tower diagonal supports */}
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: '2px',
                height: '30px',
                backgroundColor: '#6B7280',
                left: `${10 + i * 15}px`,
                top: `${20 + i * 50}px`,
                transform: 'rotate(45deg)',
              }}
            />
          ))}
        </motion.div>

        {/* Horizontal Jib - Extending arm */}
        <motion.div
          className="absolute"
          style={{
            width: '180px',
            height: '12px',
            backgroundColor: '#9CA3AF',
            borderRadius: '6px',
            left: '50%',
            transform: 'translateX(-50%)',
            top: '0px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            border: '3px solid #4B5563',
          }}
        >
          {/* Jib diagonal supports */}
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: '2px',
                height: '20px',
                backgroundColor: '#6B7280',
                left: `${20 + i * 40}px`,
                top: '6px',
                transform: 'rotate(90deg)',
              }}
            />
          ))}
        </motion.div>

        {/* Crane Cable - Extends when dropping */}
        <motion.div
          key={currentCardIndex}
          initial={{ height: 60 }}
          animate={started ? {
            height: [60, 60, 160, 60, 60], // Lower, drop, lift
          } : {
            height: 60,
          }}
          transition={{
            duration: 1.2,
            ease: [0.4, 0, 0.2, 1],
            times: [0, 0.3, 0.5, 0.7, 1],
          }}
          className="absolute left-1/2 transform -translate-x-1/2"
          style={{
            width: "6px",
            background: 'linear-gradient(180deg, #4F46E5, #6366F1)',
            willChange: 'height',
            top: '12px',
            borderRadius: '3px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        />
        
        {/* Crane Hook - Drops and bounces */}
        <motion.div
          key={`hook-${currentCardIndex}`}
          className="absolute left-1/2 transform -translate-x-1/2"
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: 'linear-gradient(135deg, #F97316, #FB923C)',
            boxShadow: "0px 4px 16px rgba(249, 115, 22, 0.6)",
            top: '72px',
            willChange: 'transform',
            border: '4px solid #EA580C',
          }}
          initial={{ scale: 1, y: 0, rotate: 0 }}
          animate={started ? {
            scale: [1, 1.2, 1.5, 1, 1],
            y: [0, 0, 100, 0, 0],
            rotate: [0, 10, 0, -10, 0],
          } : {}}
          transition={{
            duration: 1.2,
            ease: [0.34, 1.56, 0.64, 1], // Bounce effect
            times: [0, 0.3, 0.5, 0.7, 1],
          }}
        >
          {/* Hook opening */}
          <div
            style={{
              position: 'absolute',
              width: '20px',
              height: '12px',
              border: '3px solid #EA580C',
              borderTop: 'none',
              borderRadius: '0 0 10px 10px',
              bottom: '-8px',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          />
        </motion.div>

        {/* Hook Chain Links - Visual detail */}
        {[0, 1, 2, 3].map((link) => (
          <motion.div
            key={`link-${currentCardIndex}-${link}`}
            className="absolute left-1/2 transform -translate-x-1/2"
            style={{
              width: "10px",
              height: "12px",
              backgroundColor: "#6366F1",
              borderRadius: "3px",
              top: `${72 + link * 18}px`,
              border: '2px solid #4F46E5',
            }}
            initial={{ y: 0 }}
            animate={started ? {
              y: [0, 0, 100, 0, 0],
            } : {}}
            transition={{
              duration: 1.2,
              ease: "easeInOut",
              times: [0, 0.3, 0.5, 0.7, 1],
              delay: link * 0.03,
            }}
          />
        ))}

        {/* Crane Base - Foundation */}
        <motion.div
          className="absolute"
          style={{
            width: '60px',
            height: '20px',
            backgroundColor: '#6B7280',
            borderRadius: '4px',
            left: '50%',
            transform: 'translateX(-50%)',
            top: '200px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            border: '3px solid #4B5563',
          }}
        />
      </motion.div>

      {/* Crane Track - Visual guide showing movement path */}
      <motion.div
        className="absolute top-[220px] left-0 right-0"
        style={{
          height: '3px',
          background: 'linear-gradient(90deg, transparent, rgba(79, 70, 229, 0.2), transparent)',
          opacity: started ? 0.4 : 0,
        }}
      />
    </div>
  );
};

export default CraneOverlay;
