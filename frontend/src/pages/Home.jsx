import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Spline from '@splinetool/react-spline';
import { AuthContext } from '../context/AuthContext';
import { LuHeart, LuActivity, LuShieldCheck, LuSparkles, LuArrowRight } from 'react-icons/lu';

// Animation Variants
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const Home = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useContext(AuthContext);

  return (
    <div className="flex-1 bg-white min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center py-20 px-6 bg-gradient-to-br from-red-50/80 via-white to-red-50/30">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 w-full relative z-10">
          
          {/* Left Text Content */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="flex-1 text-center lg:text-left z-20"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-red-50/80 backdrop-blur-sm text-primary border border-red-100 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-8 shadow-sm">
              <LuSparkles className="animate-pulse" />
              {t('home.heroTag')}
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="text-5xl sm:text-6xl lg:text-7xl font-black text-secondary tracking-tighter leading-[1.1]">
              {t('home.heroTitlePre')} <br />
              <span className="relative inline-block mt-2">
                <span className="relative z-10 bg-gradient-to-r from-primary via-red-500 to-orange-500 bg-clip-text text-transparent drop-shadow-sm">
                  {t('home.heroTitleHighlight')}
                </span>
                <span className="absolute -inset-1 bg-red-100/50 blur-xl -z-10 rounded-full"></span>
              </span>{' '}
              <br className="hidden lg:block" />
              {t('home.heroTitlePost')}
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-lg text-gray-500 max-w-xl mx-auto lg:mx-0 mt-8 leading-relaxed font-medium">
              {t('home.heroDescription')}
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start mt-10">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(239, 68, 68, 0.3)" }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto bg-gradient-to-r from-primary to-red-600 text-white text-sm font-extrabold uppercase tracking-widest px-10 py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    {t('home.goToDashboard', { role: user?.role })}
                    <LuArrowRight className="text-lg" />
                  </motion.button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(239, 68, 68, 0.3)" }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full sm:w-auto bg-gradient-to-r from-primary to-red-600 text-white text-sm font-extrabold uppercase tracking-widest px-10 py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      {t('home.registerAs')}
                      <LuArrowRight className="text-lg" />
                    </motion.button>
                  </Link>
                  <Link to="/login">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full sm:w-auto bg-white/80 backdrop-blur-md border-2 border-border hover:border-red-200 hover:bg-red-50 text-secondary text-sm font-extrabold uppercase tracking-widest px-10 py-4 rounded-2xl shadow-sm transition-all"
                    >
                      {t('home.signIn')}
                    </motion.button>
                  </Link>
                </>
              )}
            </motion.div>
          </motion.div>

          {/* Right Spline 3D Scene */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="flex-1 w-full h-[400px] lg:h-[600px] relative flex justify-center items-center"
          >
            {/* Glowing background behind the 3D model */}
            <div className="absolute inset-0 bg-gradient-to-tr from-red-200/40 to-orange-100/40 blur-3xl rounded-full scale-150 -z-10 animate-pulse"></div>
            
            <div className="w-full h-full relative z-10">
              <Spline scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode" />
            </div>

            {/* Floating Glassy Badge Overlay */}
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, type: "spring", stiffness: 100 }}
              className="absolute bottom-4 left-4 lg:-left-12 border border-white/40 rounded-3xl p-6 bg-white/60 backdrop-blur-xl shadow-2xl flex flex-col gap-5 max-w-[260px]"
            >
              <div className="absolute -top-4 -right-4 h-12 w-12 bg-gradient-to-br from-primary to-red-600 text-white flex items-center justify-center rounded-2xl shadow-xl text-2xl">
                🩸
              </div>
              <div className="flex gap-4 items-center">
                <div className="h-12 w-12 bg-red-50 text-primary flex items-center justify-center rounded-2xl text-xl font-bold shadow-inner">
                  🥇
                </div>
                <div>
                  <h4 className="font-extrabold text-secondary text-sm">{t('home.drsTitle')}</h4>
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">{t('home.drsSubtitle')}</p>
                </div>
              </div>
              <div className="bg-white/80 p-3.5 rounded-2xl border border-white flex items-center justify-between text-xs font-bold shadow-sm">
                <span className="text-gray-500">🏆 {t('home.startScore')}</span>
                <span className="text-primary font-black text-sm">50 Points</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges section with Scroll Animations */}
      <section className="py-24 max-w-6xl mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <span className="text-xs font-black uppercase tracking-[0.3em] text-primary bg-red-50 px-4 py-2 rounded-full">
            {t('home.howItWorks')}
          </span>
        </motion.div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* Card 1 */}
          <motion.div 
            variants={fadeInUp}
            whileHover={{ y: -10 }}
            className="group p-8 rounded-[2rem] bg-white border border-border hover:border-red-200 transition-all shadow-sm hover:shadow-2xl hover:shadow-red-500/10 flex flex-col items-center text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-red-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="h-16 w-16 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl text-primary flex items-center justify-center text-2xl mb-6 shadow-inner border border-red-200 group-hover:scale-110 transition-transform duration-500">
              <LuHeart />
            </div>
            <h4 className="font-extrabold text-secondary text-lg mb-3">{t('home.instantDonorMatchingTitle')}</h4>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              {t('home.instantDonorMatchingDescription')}
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            variants={fadeInUp}
            whileHover={{ y: -10 }}
            className="group p-8 rounded-[2rem] bg-white border border-border hover:border-red-200 transition-all shadow-sm hover:shadow-2xl hover:shadow-red-500/10 flex flex-col items-center text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-red-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="h-16 w-16 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl text-primary flex items-center justify-center text-2xl mb-6 shadow-inner border border-red-200 group-hover:scale-110 transition-transform duration-500">
              <LuActivity />
            </div>
            <h4 className="font-extrabold text-secondary text-lg mb-3">{t('home.realtimeSocketsTitle')}</h4>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              {t('home.realtimeSocketsDescription')}
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            variants={fadeInUp}
            whileHover={{ y: -10 }}
            className="group p-8 rounded-[2rem] bg-white border border-border hover:border-red-200 transition-all shadow-sm hover:shadow-2xl hover:shadow-red-500/10 flex flex-col items-center text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-red-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="h-16 w-16 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl text-primary flex items-center justify-center text-2xl mb-6 shadow-inner border border-red-200 group-hover:scale-110 transition-transform duration-500">
              <LuShieldCheck />
            </div>
            <h4 className="font-extrabold text-secondary text-lg mb-3">{t('home.securityBadgesTitle')}</h4>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              {t('home.securityBadgesDescription')}
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer Info */}
      <footer className="bg-secondary text-white py-12 px-6 border-t border-gray-800 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center text-xl">
              🩸
            </div>
            <span className="font-extrabold tracking-widest uppercase text-sm">{t('home.footerTitle')}</span>
          </div>
          <p className="text-xs font-semibold tracking-wider text-gray-400">
            {t('home.footerText')}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
