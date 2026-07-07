import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import api from '../../services/api';
import useGuide from '../../hooks/useGuide';
import { LuUsers, LuHeartPulse, LuFlame, LuTrophy, LuActivity, LuUserCheck } from 'react-icons/lu';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { autoStart } = useGuide('admin');

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching admin statistics:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    autoStart();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="min-h-screen bg-background text-white">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 max-w-6xl mx-auto flex flex-col gap-6">
          <motion.h2 
            id="guide-welcome" 
            className="text-xl font-black tracking-tight flex items-center gap-2 border-b border-white/5 pb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            ⚙️ {t('admin.dashboardTitle')}
          </motion.h2>

          {loading ? (
            <div className="p-12 text-center text-xs text-muted font-bold animate-pulse">
              {t('admin.loading')}
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Aggregates Card Grid */}
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
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="h-11 w-11 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl flex items-center justify-center text-xl shadow-inner">
                    <LuUsers />
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-muted uppercase tracking-widest block">
                      {t('admin.totalUsers')}
                    </span>
                    <h3 className="text-2xl font-black mt-0.5 text-white">
                      {stats?.totalUsers || 0}
                    </h3>
                  </div>
                </motion.div>

                <motion.div 
                  className="p-5 rounded-2xl bg-surface/40 border border-white/5 shadow-lg flex items-center gap-4"
                  variants={cardVariants}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="h-11 w-11 bg-primary/10 text-primary-light border border-primary/20 rounded-xl flex items-center justify-center text-xl shadow-inner pulsing-glow-red">
                    <LuHeartPulse />
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-muted uppercase tracking-widest block">
                      {t('admin.activeRequests')}
                    </span>
                    <h3 className="text-2xl font-black mt-0.5 text-primary-light glow-text-primary">
                      {stats?.activeRequests || 0}
                    </h3>
                  </div>
                </motion.div>

                <motion.div 
                  className="p-5 rounded-2xl bg-surface/40 border border-white/5 shadow-lg flex items-center gap-4"
                  variants={cardVariants}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="h-11 w-11 bg-success/10 text-success border border-success/20 rounded-xl flex items-center justify-center text-xl shadow-inner">
                    <LuUserCheck />
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-muted uppercase tracking-widest block">
                      {t('admin.verifiedDonors')}
                    </span>
                    <h3 className="text-xl font-black mt-0.5 text-white">
                      {stats?.verifiedDonors || 0} <span className="text-xs text-muted">/ {stats?.totalDonors || 0}</span>
                    </h3>
                  </div>
                </motion.div>

                <motion.div 
                  className="p-5 rounded-2xl bg-surface/40 border border-white/5 shadow-lg flex items-center gap-4"
                  variants={cardVariants}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="h-11 w-11 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl flex items-center justify-center text-xl shadow-inner">
                    <LuTrophy />
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-muted uppercase tracking-widest block">
                      {t('admin.fulfilledRequests')}
                    </span>
                    <h3 className="text-2xl font-black mt-0.5 text-white">
                      {stats?.fulfilledRequests || 0}
                    </h3>
                  </div>
                </motion.div>
              </motion.div>

              {/* Leaderboard & City stats */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Elite Top Donors list */}
                <motion.div 
                  className="bg-surface/40 p-6 rounded-3xl border border-white/5 shadow-lg flex flex-col min-h-80 backdrop-blur-md"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
                    <LuTrophy className="text-primary-light text-lg" />
                    <h3 className="font-black text-white text-xs uppercase tracking-widest">
                      {t('admin.eliteDonors')}
                    </h3>
                  </div>

                  <div className="flex flex-col gap-3">
                    {stats?.topDonors?.length === 0 ? (
                      <div className="text-xs text-muted text-center py-6 font-semibold">{t('admin.noDonors')}</div>
                    ) : (
                      stats?.topDonors?.map((donor, idx) => (
                        <div
                          key={donor._id}
                          className="flex items-center justify-between p-3.5 rounded-2xl border border-white/5 bg-background/40 hover:border-white/10 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-black text-muted w-4">{idx + 1}.</span>
                            <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 text-white font-black text-xs flex items-center justify-center">
                              {donor.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-extrabold text-white">
                                {donor.name} ({donor.bloodType})
                              </span>
                              <span className="text-[9px] text-muted font-bold uppercase tracking-wider block mt-1">
                                {t('common.city')}: {donor.city} • {t('admin.drs')}: {donor.drsScore}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs font-black text-primary-light">
                            {donor.totalDonations} {t('requester.donationsSaved')}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>

                {/* City activity distributions */}
                <motion.div 
                  className="bg-surface/40 p-6 rounded-3xl border border-white/5 shadow-lg flex flex-col min-h-80 backdrop-blur-md"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
                    <LuActivity className="text-primary-light text-lg" />
                    <h3 className="font-black text-white text-xs uppercase tracking-widest">
                      {t('admin.topCities')}
                    </h3>
                  </div>

                  <div className="flex flex-col gap-5 justify-center mt-2">
                    {stats?.cityStats?.length === 0 ? (
                      <div className="text-xs text-muted text-center py-6 font-semibold">{t('admin.noRequests')}</div>
                    ) : (
                      stats?.cityStats?.map((city, idx) => (
                        <div key={idx} className="flex flex-col gap-2 text-xs font-extrabold">
                          <div className="flex justify-between items-center">
                            <span className="text-white capitalize">{city._id}</span>
                            <span className="text-primary-light glow-text-primary">{city.count} {t('admin.activeRequests')}</span>
                          </div>
                          {/* CSS Progress bar */}
                          <div className="w-full bg-background/80 border border-white/5 rounded-full h-2">
                            <motion.div
                              className="bg-gradient-to-r from-primary to-primary-light h-full rounded-full"
                              initial={{ width: 0 }}
                              animate={{
                                width: `${Math.min(100, (city.count / (stats?.activeRequests + stats?.fulfilledRequests || 1)) * 100)}%`
                              }}
                              transition={{ duration: 1, ease: 'easeOut' }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
