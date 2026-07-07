import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import DRSBadge from '../../components/common/DRSBadge';
import api from '../../services/api';
import useGuide from '../../hooks/useGuide';
import { LuHeartPulse, LuCalendar, LuTrophy, LuActivity, LuAward } from 'react-icons/lu';

const DonorDashboard = () => {
  const { t } = useTranslation();
  const { user, updateUserProfile } = useContext(AuthContext);
  const { addToast } = useContext(NotificationContext);
  const { autoStart } = useGuide('donor');

  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [recentResponses, setRecentResponses] = useState([]);
  const [loadingResponses, setLoadingResponses] = useState(false);

  const fetchLeaderboard = async () => {
    if (!user || !user.showOnLeaderboard) return;
    setLoadingLeaderboard(true);
    try {
      const res = await api.get('/donors/leaderboard');
      if (res.data.success) {
        setLeaderboard(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
    setLoadingLeaderboard(false);
  };

  const fetchResponses = async () => {
    setLoadingResponses(true);
    try {
      const res = await api.get('/donors/my/requests');
      if (res.data.success) {
        setRecentResponses(res.data.data.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching responses:', error);
    }
    setLoadingResponses(false);
  };

  useEffect(() => {
    fetchLeaderboard();
    fetchResponses();
  }, [user?.showOnLeaderboard, user?.city]);

  useEffect(() => {
    autoStart();
  }, []);

  const handleOptIn = async () => {
    try {
      const res = await api.put('/donors/profile', { showOnLeaderboard: true });
      if (res.data.success) {
        updateUserProfile(res.data.data);
        addToast('🏆 Opted In!', 'You are now visible on the city leaderboard.', 'general');
      }
    } catch (error) {
      console.error('Error opting in:', error);
    }
  };

  // Cooldown calculation
  const getCooldownDays = () => {
    if (!user?.cooldownUntil) return 0;
    const diff = new Date(user.cooldownUntil).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const cooldownDays = getCooldownDays();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  };

  return (
    <div className="min-h-screen bg-background text-white">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 max-w-6xl mx-auto flex flex-col gap-6">
          {/* Header */}
          <motion.div 
            id="guide-welcome" 
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface/50 border border-white/5 p-6 rounded-3xl backdrop-blur-xl shadow-xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <h2 className="text-xl font-black tracking-tight">{t('donor.welcomeBack', { name: user?.name })}</h2>
              <p className="text-xs text-muted mt-1 font-semibold">{t('donor.registeredAs', { bloodType: user?.bloodType, city: user?.city })}</p>
            </div>
            <div id="guide-drs">
              <DRSBadge score={user?.drsScore || 50} />
            </div>
          </motion.div>

          {/* Cooldown Active Banner */}
          {user?.availability === 'on_cooldown' && cooldownDays > 0 && (
            <motion.div 
              className="bg-orange-500/10 border border-orange-500/20 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-4 border-l-4 border-l-orange-500 shadow-lg"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring' }}
            >
              <span className="text-3xl">⏳</span>
              <div className="flex-1">
                <h4 className="font-extrabold text-orange-400 text-sm">{t('donor.cooldownTitle')}</h4>
                <p className="text-xs text-orange-200/80 mt-1 leading-relaxed font-medium">{t('donor.cooldownDescription')}</p>
              </div>
              <span className="px-4 py-2.5 bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-black rounded-xl whitespace-nowrap self-start sm:self-center uppercase tracking-wider">
                {t('donor.daysRemaining', { count: cooldownDays })}
              </span>
            </motion.div>
          )}

          {/* Quick Metrics grid */}
          <motion.div 
            id="guide-stats" 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              className="p-5 rounded-2xl bg-surface/40 border border-white/5 shadow-lg flex items-center gap-4"
              variants={cardVariants}
              whileHover={{ scale: 1.02, borderColor: 'rgba(255,255,255,0.1)' }}
            >
              <div className="h-12 w-12 bg-primary/10 rounded-2xl text-primary flex items-center justify-center text-xl border border-primary/20 shadow-inner">
                <LuHeartPulse />
              </div>
              <div>
                <span className="text-[9px] font-black text-muted uppercase tracking-widest block">
                  {t('donor.totalDonations')}
                </span>
                <h3 className="text-2xl font-black mt-0.5 glow-text-primary">
                  {user?.totalDonations || 0}
                </h3>
              </div>
            </motion.div>

            <motion.div 
              className="p-5 rounded-2xl bg-surface/40 border border-white/5 shadow-lg flex items-center gap-4"
              variants={cardVariants}
              whileHover={{ scale: 1.02, borderColor: 'rgba(255,255,255,0.1)' }}
            >
              <div className="h-12 w-12 bg-orange-500/10 rounded-2xl text-orange-400 flex items-center justify-center text-xl border border-orange-500/20 shadow-inner">
                <LuCalendar />
              </div>
              <div>
                <span className="text-[9px] font-black text-muted uppercase tracking-widest block">
                  {t('donor.availabilityLabel')}
                </span>
                <h3 className="text-xs font-black uppercase tracking-wider mt-1.5">
                  {user?.availability === 'available' ? (
                    <span className="text-success flex items-center gap-1.5">Available <span className="h-2 w-2 rounded-full bg-success animate-ping" /></span>
                  ) : user?.availability === 'on_cooldown' ? (
                    <span className="text-orange-400">On Cooldown ⏳</span>
                  ) : (
                    <span className="text-muted">Unavailable 🔴</span>
                  )}
                </h3>
              </div>
            </motion.div>

            <motion.div 
              className="p-5 rounded-2xl bg-surface/40 border border-white/5 shadow-lg flex items-center gap-4 col-span-1 sm:col-span-2"
              variants={cardVariants}
              whileHover={{ scale: 1.01, borderColor: 'rgba(255,255,255,0.1)' }}
            >
              <div className="h-12 w-12 bg-amber-500/10 rounded-2xl text-amber-400 flex items-center justify-center text-xl border border-amber-500/20 shadow-inner">
                <LuAward />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-black text-muted uppercase tracking-widest block">
                  {t('donor.milestoneBadges')}
                </span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {user?.badges?.length === 0 ? (
                    <span className="text-xs text-muted font-semibold">{t('donor.noBadges')}</span>
                  ) : (
                    user?.badges?.map((badge, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[10px] font-black rounded-lg uppercase tracking-wider shadow-sm"
                        title={`Awarded on ${new Date(badge.awardedAt).toLocaleDateString()}`}
                      >
                        🏅 {badge.label}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Bottom Grid: Leaderboard & Responded Requests */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* City Leaderboard */}
            <motion.div 
              className="p-6 bg-surface/40 rounded-3xl border border-white/5 shadow-lg flex flex-col min-h-[360px] backdrop-blur-md"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
                <LuTrophy className="text-primary-light text-lg" />
                <h3 className="font-black text-white text-xs uppercase tracking-widest">
                  {t('donor.leaderboardTitle')}
                </h3>
              </div>

              {!user?.showOnLeaderboard ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-background/50 border border-dashed border-white/5 rounded-2xl">
                  <span className="text-4xl mb-4">👁️</span>
                  <h4 className="font-extrabold text-white text-sm">{t('donor.leaderboardOptInRequiredTitle')}</h4>
                  <p className="text-xs text-muted max-w-xs mt-2 leading-relaxed font-semibold">{t('donor.leaderboardOptInRequiredDescription')}</p>
                  <button
                    onClick={handleOptIn}
                    className="mt-6 bg-primary hover:bg-primary-light text-white text-xs font-black uppercase tracking-widest px-6 py-3.5 rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all cursor-pointer border border-primary/20"
                  >
                    {t('donor.leaderboardOptInButton')}
                  </button>
                </div>
              ) : loadingLeaderboard ? (
                <div className="flex-1 flex items-center justify-center text-xs text-muted font-bold animate-pulse">
                  {t('donor.loadingLeaderboard')}
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-xs text-muted font-semibold">
                  {t('donor.noOtherDonors', { city: user?.city })}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {leaderboard.map((donor, idx) => (
                    <div
                      key={donor._id}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border ${
                        donor._id === user._id ? 'bg-primary/10 border-primary/30 shadow-[0_0_15px_rgba(255,59,48,0.1)]' : 'bg-background/40 border-white/5 hover:border-white/10'
                      } transition-all`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-muted w-4">{idx + 1}.</span>
                        <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 text-white font-black text-xs flex items-center justify-center">
                          {donor.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-extrabold text-white">
                            {donor.name} {donor._id === user._id && ' (You)'}
                          </span>
                          <div className="flex gap-1.5 mt-1">
                            {donor.badges.slice(0, 1).map((b, bIdx) => (
                              <span key={bIdx} className="text-[8px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1 py-0.5 rounded uppercase tracking-wider">
                                {b.label}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-primary-light block">
                          {donor.totalDonations} Donations
                        </span>
                        <span className="text-[9px] text-muted font-black block mt-0.5 uppercase tracking-wide">
                          DRS: {donor.drsScore}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Responded Requests List */}
            <motion.div 
              className="p-6 bg-surface/40 rounded-3xl border border-white/5 shadow-lg flex flex-col min-h-[360px] backdrop-blur-md"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
                <LuActivity className="text-primary-light text-lg" />
                <h3 className="font-black text-white text-xs uppercase tracking-widest">
                  {t('donor.recentResponsesTitle')}
                </h3>
              </div>

              {loadingResponses ? (
                <div className="flex-1 flex items-center justify-center text-xs text-muted font-bold animate-pulse">
                  {t('donor.loadingResponses')}
                </div>
              ) : recentResponses.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-background/50 border border-dashed border-white/5 rounded-2xl">
                  <span className="text-4xl mb-3">🩹</span>
                  <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">{t('donor.noResponsesTitle', 'No Active Commitments')}</h4>
                  <p className="text-[10px] text-muted max-w-xs mt-2 leading-relaxed font-semibold">
                    {t('donor.noResponsesDescription', 'Check the "Requests" page in your sidebar to accept open compatible blood requests in your city.')}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {recentResponses.map((req) => (
                    <div
                      key={req._id}
                      className="p-3.5 bg-background/40 border border-white/5 hover:border-white/10 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-white">
                          {t('request.patient')}: {req.patientName} ({req.bloodType})
                        </span>
                        <span className="text-[10px] text-muted font-bold mt-1">
                          🏥 {req.hospitalName}, {req.city}
                        </span>
                        <span className="text-[9px] text-muted/60 mt-1 font-semibold uppercase tracking-wider">
                          {t('request.postedOn', 'Posted on')} {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <span
                          className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider border shadow-sm ${
                            req.status === 'open'
                              ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                              : req.status === 'matched'
                              ? 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                              : req.status === 'fulfilled'
                              ? 'bg-green-500/10 border-green-500/20 text-green-400'
                              : 'bg-slate-500/10 border-slate-500/20 text-slate-400'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DonorDashboard;
