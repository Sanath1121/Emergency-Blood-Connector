import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export const getBadgeInfo = (score) => {
  if (score >= 90) {
    return {
      labelKey: 'trustedLifesaver',
      defaultLabel: 'Trusted Lifesaver',
      emoji: '🥇',
      bgClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
      icon: '👑',
      tier: 'gold',
      color: '#F59E0B'
    };
  }
  if (score >= 70) {
    return {
      labelKey: 'reliableDonor',
      defaultLabel: 'Reliable Donor',
      emoji: '🥈',
      bgClass: 'bg-slate-400/10 text-slate-300 border-slate-400/30 shadow-[0_0_15px_rgba(148,163,184,0.15)]',
      icon: '🎖️',
      tier: 'silver',
      color: '#94A3B8'
    };
  }
  if (score >= 50) {
    return {
      labelKey: 'activeDonor',
      defaultLabel: 'Active Donor',
      emoji: '🥉',
      bgClass: 'bg-orange-500/10 text-orange-400 border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.15)]',
      icon: '⭐',
      tier: 'bronze',
      color: '#F97316'
    };
  }
  return {
    labelKey: 'needsImprovement',
    defaultLabel: 'Needs Improvement',
    emoji: '⚠️',
    bgClass: 'bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)] pulsing-glow-red',
    icon: '⚠️',
    tier: 'warning',
    color: '#EF4444'
  };
};

const DRSBadge = ({ score, showScore = true }) => {
  const { t } = useTranslation();
  const info = getBadgeInfo(score);

  // SVG Gauge calculations
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <motion.div 
      className="flex items-center gap-4 bg-surface/80 border border-white/5 p-3 rounded-2xl backdrop-blur-md"
      whileHover={{ scale: 1.02, border: '1px solid rgba(255,255,255,0.1)' }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Circular Progress Gauge */}
      <div className="relative h-14 w-14 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="28"
            cy="28"
            r={radius}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="3.5"
            fill="transparent"
          />
          {/* Progress circle */}
          <motion.circle
            cx="28"
            cy="28"
            r={radius}
            stroke={info.color}
            strokeWidth="3.5"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeOut' }}
            strokeLinecap="round"
          />
        </svg>
        {/* Score text in center */}
        <span className="absolute text-xs font-black text-white" style={{ textShadow: `0 0 8px ${info.color}80` }}>
          {score}
        </span>
      </div>

      {/* Info Badge Text */}
      <div className="flex flex-col gap-0.5">
        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1 ${info.bgClass}`}>
          <span>{info.icon}</span>
          {t(`drs.${info.labelKey}`, info.defaultLabel)}
        </span>
        {showScore && (
          <span className="text-[10px] text-muted font-semibold">
            {t('donor.drsScore', 'DRS Score')}: <strong className="text-white font-bold">{score}</strong>/100
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default DRSBadge;
