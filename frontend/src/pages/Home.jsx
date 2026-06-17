import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { LuHeart, LuActivity, LuShieldCheck, LuSparkles } from 'react-icons/lu';
import BloodLoader3D from '../components/common/BloodLoader3D';

const Home = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useContext(AuthContext);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  return (
    <motion.div
      className="flex-1 bg-background min-h-[calc(100vh-4rem)] text-white relative overflow-hidden flex flex-col"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Background neon blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary-light/5 blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative py-20 px-6 max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-16 z-10 w-full flex-1">
        <motion.div className="flex-1 text-center lg:text-left" variants={itemVariants}>
          <motion.div
            className="inline-flex items-center gap-1.5 bg-primary/10 text-primary-light border border-primary/20 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6"
            whileHover={{ scale: 1.05, border: '1px solid rgba(255,59,48,0.4)' }}
          >
            <LuSparkles className="animate-spin-slow" />
            {t('home.heroTag')}
          </motion.div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
            {t('home.heroTitlePre')} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-light to-amber-500 font-extrabold glow-text-primary">
              {t('home.heroTitleHighlight')}
            </span>{' '}
            {t('home.heroTitlePost')}
          </h1>
          <p className="text-sm text-muted max-w-lg mt-6 leading-relaxed font-medium">
            {t('home.heroDescription')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-10">
            {isAuthenticated ? (
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/dashboard"
                  className="block bg-primary hover:bg-primary-light text-white text-xs font-black uppercase tracking-widest px-8 py-4 rounded-2xl shadow-lg shadow-primary/30 transition-colors border border-primary/20"
                >
                  {t('home.goToDashboard', { role: user?.role })}
                </Link>
              </motion.div>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/register"
                    className="block bg-primary hover:bg-primary-light text-white text-xs font-black uppercase tracking-widest px-8 py-4 rounded-2xl shadow-lg shadow-primary/30 transition-colors border border-primary/20"
                  >
                    {t('home.registerAs')}
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/login"
                    className="block bg-surface/80 hover:bg-surface border border-white/10 hover:border-white/20 text-white text-xs font-black uppercase tracking-widest px-8 py-4 rounded-2xl backdrop-blur-md transition-colors"
                  >
                    {t('home.signIn')}
                  </Link>
                </motion.div>
              </>
            )}
          </div>
        </motion.div>

        {/* Elegant 3D conceptual animation area */}
        <motion.div className="flex-1 flex justify-center relative" variants={itemVariants}>
          {/* Pulsing glow background */}
          <div className="w-80 h-80 rounded-full bg-primary/10 absolute -z-10 blur-3xl" />

          <motion.div 
            className="border border-white/5 rounded-[32px] p-8 bg-surface/50 backdrop-blur-xl shadow-2xl flex flex-col gap-6 max-w-sm w-full border-t-4 border-t-primary relative"
            whileHover={{ y: -5, borderColor: 'rgba(255,59,48,0.2)' }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {/* 3D Blood Loader inside Hero Card */}
            <div className="flex justify-center py-4">
              <BloodLoader3D size={130} text="" />
            </div>

            <div className="flex gap-4 items-center border-t border-white/5 pt-4">
              <div className="h-10 w-10 bg-primary/10 text-primary flex items-center justify-center rounded-2xl text-lg font-bold border border-primary/25">
                🥇
              </div>
              <div>
                <h4 className="font-black text-white text-xs uppercase tracking-wide">{t('home.drsTitle')}</h4>
                <p className="text-[9px] text-primary-light font-black uppercase tracking-widest mt-0.5">{t('home.drsSubtitle')}</p>
              </div>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              {t('home.drsDescription')}
            </p>
            <div className="bg-background/80 p-3 rounded-2xl border border-white/5 flex items-center justify-between text-[11px] font-black tracking-wide">
              <span className="text-muted">🏆 {t('home.startScore')}</span>
              <span className="text-primary-light glow-text-primary">50 Points</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Trust Badges section */}
      <section className="py-20 border-t border-white/5 max-w-5xl mx-auto px-6 z-10 w-full">
        <motion.h3 
          className="text-center text-xs font-black uppercase tracking-[0.25em] text-primary-light mb-16 glow-text-primary"
          variants={itemVariants}
        >
          {t('home.howItWorks')}
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            className="p-8 rounded-[24px] bg-surface/40 border border-white/5 hover:border-primary/20 transition-all hover:bg-surface/60 flex flex-col items-center text-center shadow-lg"
            variants={itemVariants}
            whileHover={{ y: -6, boxShadow: '0 10px 30px rgba(255,59,48,0.1)' }}
          >
            <div className="h-14 w-14 bg-primary/10 rounded-2xl text-primary flex items-center justify-center text-2xl mb-6 shadow-inner border border-primary/20">
              <LuHeart />
            </div>
            <h4 className="font-extrabold text-white text-base tracking-tight">{t('home.instantDonorMatchingTitle')}</h4>
            <p className="text-xs text-muted mt-3 leading-relaxed font-medium">
              {t('home.instantDonorMatchingDescription')}
            </p>
          </motion.div>

          <motion.div 
            className="p-8 rounded-[24px] bg-surface/40 border border-white/5 hover:border-primary/20 transition-all hover:bg-surface/60 flex flex-col items-center text-center shadow-lg"
            variants={itemVariants}
            whileHover={{ y: -6, boxShadow: '0 10px 30px rgba(255,59,48,0.1)' }}
          >
            <div className="h-14 w-14 bg-primary/10 rounded-2xl text-primary-light flex items-center justify-center text-2xl mb-6 shadow-inner border border-primary/20">
              <LuActivity />
            </div>
            <h4 className="font-extrabold text-white text-base tracking-tight">{t('home.realtimeSocketsTitle')}</h4>
            <p className="text-xs text-muted mt-3 leading-relaxed font-medium">
              {t('home.realtimeSocketsDescription')}
            </p>
          </motion.div>

          <motion.div 
            className="p-8 rounded-[24px] bg-surface/40 border border-white/5 hover:border-primary/20 transition-all hover:bg-surface/60 flex flex-col items-center text-center shadow-lg"
            variants={itemVariants}
            whileHover={{ y: -6, boxShadow: '0 10px 30px rgba(255,59,48,0.1)' }}
          >
            <div className="h-14 w-14 bg-primary/10 rounded-2xl text-primary flex items-center justify-center text-2xl mb-6 shadow-inner border border-primary/20">
              <LuShieldCheck />
            </div>
            <h4 className="font-extrabold text-white text-base tracking-tight">{t('home.securityBadgesTitle')}</h4>
            <p className="text-xs text-muted mt-3 leading-relaxed font-medium">
              {t('home.securityBadgesDescription')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer Info */}
      <footer className="bg-surface/80 backdrop-blur-md text-white py-12 px-6 border-t border-white/5 mt-auto z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-pulse">🩸</span>
            <span className="font-black tracking-wider text-sm uppercase">{t('home.footerTitle')}</span>
          </div>
          <p className="text-xs text-muted font-medium">
            {t('home.footerText')}
          </p>
        </div>
      </footer>
    </motion.div>
  );
};

export default Home;
