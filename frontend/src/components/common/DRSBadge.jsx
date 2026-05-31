import React from 'react';
import { useTranslation } from 'react-i18next';

export const getBadgeInfo = (score) => {
  if (score >= 90) {
    return {
      labelKey: 'trustedLifesaver',
      defaultLabel: 'Trusted Lifesaver',
      emoji: '🥇',
      bgClass: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: '👑',
      tier: 'gold'
    };
  }
  if (score >= 70) {
    return {
      labelKey: 'reliableDonor',
      defaultLabel: 'Reliable Donor',
      emoji: '🥈',
      bgClass: 'bg-slate-100 text-slate-800 border-slate-300',
      icon: '🎖️',
      tier: 'silver'
    };
  }
  if (score >= 50) {
    return {
      labelKey: 'activeDonor',
      defaultLabel: 'Active Donor',
      emoji: '🥉',
      bgClass: 'bg-orange-100 text-orange-800 border-orange-300',
      icon: '⭐',
      tier: 'bronze'
    };
  }
  return {
    labelKey: 'needsImprovement',
    defaultLabel: 'Needs Improvement',
    emoji: '⚠️',
    bgClass: 'bg-red-100 text-red-800 border-red-300',
    icon: '⚠️',
    tier: 'warning'
  };
};

const DRSBadge = ({ score, showScore = true }) => {
  const { t } = useTranslation();
  const info = getBadgeInfo(score);

  return (
    <div className="flex flex-col items-center sm:items-start gap-1">
      <span
        className={`px-3 py-1 rounded-full border text-xs font-semibold flex items-center gap-1.5 shadow-sm ${info.bgClass}`}
      >
        <span>{info.icon}</span>
        {t(`drs.${info.labelKey}`, info.defaultLabel)}
      </span>
      {showScore && (
        <span className="text-xs text-muted mt-0.5">
          {t('donor.drsScore', 'DRS Score')}: <strong className="text-secondary font-bold">{score}</strong>/100
        </span>
      )}
    </div>
  );
};

export default DRSBadge;
