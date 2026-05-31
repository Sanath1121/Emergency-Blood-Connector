const DRS_RULES = {
  DONATED_AFTER_ACCEPTING:     10,   // Confirmed donation
  RESPONDED_WITHIN_30_MIN:     5,    // Responded within 30 min
  COOLDOWN_RESPECTED:          3,    // Respected 90 days cooldown before next donation
  PROFILE_COMPLETE:            2,    // Profile complete (one-time bonus)
  CANCELLED_AFTER_ACCEPTING:   -8,   // Responded then cancelled
  IGNORED_3_CONSECUTIVE:       -5,   // Ignored 3+ consecutive requests
  NO_SHOW_AFTER_CONFIRM:       -10   // Confirmed but didn't show
};

function getDRSBadge(score) {
  if (score >= 90) return { label: 'Trusted Lifesaver', tier: 'gold', emoji: '🥇' };
  if (score >= 70) return { label: 'Reliable Donor', tier: 'silver', emoji: '🥈' };
  if (score >= 50) return { label: 'Active Donor', tier: 'bronze', emoji: '🥉' };
  return { label: 'Needs Improvement', tier: 'warning', emoji: '⚠️' };
}

function updateDRS(currentScore, change) {
  return Math.max(0, Math.min(100, currentScore + change));
}

module.exports = {
  DRS_RULES,
  getDRSBadge,
  updateDRS
};
