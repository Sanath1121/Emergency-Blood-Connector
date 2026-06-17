import React from 'react';
import { motion } from 'framer-motion';

const BloodLoader3D = ({ size = 120, fullPage = false, text = 'Connecting Lives...' }) => {
  const waveVariants = {
    animate1: {
      x: ['0%', '-50%'],
      transition: {
        repeat: Infinity,
        duration: 4,
        ease: 'linear',
      },
    },
    animate2: {
      x: ['-50%', '0%'],
      transition: {
        repeat: Infinity,
        duration: 3,
        ease: 'linear',
      },
    },
  };

  const loaderContent = (
    <div className="flex flex-col items-center justify-center gap-6">
      {/* 3D Blood Drop Container */}
      <motion.div
        className="relative flex items-center justify-center animate-float"
        style={{ width: size, height: size }}
        whileHover={{ scale: 1.05 }}
      >
        {/* Glowing aura under the droplet */}
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl filter opacity-80 animate-pulse" />

        {/* Droplet SVG Wrapper */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-[0_10px_25px_rgba(255,59,48,0.4)]"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Liquid Clipping Mask shaped like a drop */}
            <clipPath id="drop-clip">
              <path d="M50,4 C50,4 90,44 90,68 A40,40 0 0,1 10,68 C10,44 50,4" />
            </clipPath>

            {/* Red Linear Gradients for Waves */}
            <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FF5E5B" />
              <stop offset="100%" stopColor="#C026D3" />
            </linearGradient>
            <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FF3B30" />
              <stop offset="100%" stopColor="#7F1D1D" />
            </linearGradient>

            {/* Glass Shadow & Highlights */}
            <radialGradient id="glassShine" cx="30%" cy="30%" r="40%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.4)" />
              <stop offset="50%" stopColor="rgba(255, 255, 255, 0.05)" />
              <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
            </radialGradient>
          </defs>

          {/* Outer Glass Border (3D feel) */}
          <path
            d="M50,4 C50,4 90,44 90,68 A40,40 0 0,1 10,68 C10,44 50,4"
            fill="rgba(18, 19, 26, 0.4)"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="1.5"
          />

          {/* Masked Liquid Waves */}
          <g clipPath="url(#drop-clip)">
            {/* Wave 1 (Back wave, slightly lighter) */}
            <motion.path
              d="M 0,55 Q 25,48 50,55 T 100,55 T 150,55 T 200,55 L 200,100 L 0,100 Z"
              fill="url(#waveGrad1)"
              opacity="0.6"
              variants={waveVariants}
              animate="animate1"
              style={{ width: '200%' }}
            />

            {/* Wave 2 (Front wave, deeper color) */}
            <motion.path
              d="M 0,58 Q 25,64 50,58 T 100,58 T 150,58 T 200,58 L 200,100 L 0,100 Z"
              fill="url(#waveGrad2)"
              variants={waveVariants}
              animate="animate2"
              style={{ width: '200%' }}
            />
          </g>

          {/* Glass Overlay Highlights (adds 3D reflection) */}
          {/* Top-Left Reflection Oval */}
          <path
            d="M50,4 C50,4 90,44 90,68 A40,40 0 0,1 10,68 C10,44 50,4"
            fill="url(#glassShine)"
            pointerEvents="none"
          />

          {/* Inner Highlight crescent */}
          <path
            d="M 22,65 A 32,32 0 0,1 42,32 A 36,36 0 0,0 28,62 Z"
            fill="rgba(255, 255, 255, 0.25)"
            pointerEvents="none"
          />
        </svg>
      </motion.div>

      {/* Loading Text */}
      {text && (
        <motion.p
          className="text-xs uppercase tracking-[0.25em] font-extrabold text-primary-light glow-text-primary animate-pulse"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-background/95 backdrop-blur-md z-[9999] flex items-center justify-center">
        {loaderContent}
      </div>
    );
  }

  return loaderContent;
};

export default BloodLoader3D;
