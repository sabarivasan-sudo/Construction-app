import { motion } from "framer-motion";
import { useEffect } from "react";

/**
 * Big centered blur -> shrink -> move-up text.
 * Calls onComplete after full sequence finishes.
 */
const BlurText = ({ text, delay = 300, duration = 1200, onComplete }) => {
  const words = text.split(" ");

  const wordDur = duration / Math.max(words.length, 1);

  const totalDurationMs = delay + duration + 700; // includes shrink/move stage

  useEffect(() => {
    const t = setTimeout(() => onComplete && onComplete(), totalDurationMs);
    return () => clearTimeout(t);
  }, [totalDurationMs, onComplete]);

  return (
    <motion.div
      initial={{ scale: 1.4, y: 80, opacity: 0 }}
      animate={{ scale: [1.4, 1, 0.85], y: [80, 0, -40], opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className="w-full text-center"
    >
      <div className="flex flex-wrap justify-center gap-3 px-4">
        {words.map((w, i) => (
          <motion.span
            key={`word-${i}-${w}`}
            initial={{ opacity: 0, filter: "blur(12px)", y: -18 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{
              duration: wordDur / 1000,
              delay: delay / 1000 + i * (wordDur / 1000),
              ease: "easeOut",
            }}
            className="inline-block text-3xl md:text-5xl font-extrabold"
            style={{
              color: '#00C9A7', // Light green for all text
              display: 'inline-block', // Ensure all words are visible
              visibility: 'visible', // Force visibility
            }}
          >
            {w}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
};

export default BlurText;
