import { motion } from "framer-motion";

const CraneAnimation = ({ onCraneComplete }) => {
  return (
    <div className="absolute top-0 left-0 w-full h-40 flex justify-center pointer-events-none z-20">
      <motion.div
        initial={{ y: -100 }}
        animate={{
          y: [ -100, 0, 20, 20 ],
        }}
        transition={{
          duration: 1.8,
          ease: "easeInOut",
          delay: 0.5,
          onComplete: onCraneComplete
        }}
        className="relative"
      >
        {/* Crane line */}
        <div
          className="absolute left-1/2 transform -translate-x-1/2"
          style={{
            width: "4px",
            height: "60px",
            backgroundColor: "#4F46E5",
          }}
        />
        {/* Crane hook */}
        <div
          className="absolute top-[60px] left-1/2 transform -translate-x-1/2"
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            backgroundColor: "#F97316",
            boxShadow: "0px 2px 8px rgba(0,0,0,0.35)",
          }}
        />
      </motion.div>
    </div>
  );
};

export default CraneAnimation;
