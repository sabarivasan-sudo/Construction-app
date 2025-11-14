import { motion } from 'framer-motion'

const Particles = () => {
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: 20 + Math.random() * 15,
    delay: Math.random() * 3,
    size: 2 + Math.random() * 2,
  }))

  return (
    <div 
      className="absolute inset-0 overflow-hidden pointer-events-none" 
      style={{ zIndex: 0 }}
    >
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-gray-400"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: 0.08,
            willChange: 'transform',
            transform: 'translateZ(0)', // GPU acceleration
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, Math.random() * 15 - 7.5, 0],
            opacity: [0.08, 0.15, 0.08],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

export default Particles
