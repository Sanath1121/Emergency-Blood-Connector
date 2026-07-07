import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import api from '../services/api';
import { LuSearch, LuHeart, LuPhone, LuMapPin } from 'react-icons/lu';

const BloodBankDirectory = () => {
  const { t } = useTranslation();
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cityFilter, setCityFilter] = useState('');

  const fetchBanks = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/bloodbanks?city=${cityFilter}`);
      if (res.data.success) {
        setBanks(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching banks:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBanks();
  }, [cityFilter]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div className="min-h-screen bg-background text-white">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 max-w-6xl mx-auto flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-6">
            <div>
              <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                <LuHeart className="text-primary animate-pulse" /> {t('directory.title')}
              </h2>
              <p className="text-xs text-muted mt-1 font-semibold">
                {t('directory.subtitle')}
              </p>
            </div>

            {/* City Search Filter */}
            <div className="relative flex items-center w-full sm:w-64">
              <LuSearch className="absolute left-3.5 text-muted" />
              <input
                type="text"
                placeholder={t('directory.searchPlaceholder')}
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full bg-surface/50 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold outline-none focus:border-primary/50 text-white placeholder-muted/60"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-muted font-bold animate-pulse">
              {t('directory.loading')}
            </div>
          ) : banks.length === 0 ? (
            <motion.div 
              className="p-8 text-center text-xs text-muted bg-surface/40 border border-white/5 rounded-3xl shadow-xl min-h-60 flex flex-col items-center justify-center backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className="text-3xl mb-2">📋</span>
              <p className="font-semibold">{t('directory.empty')}</p>
            </motion.div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence>
                {banks.map((bank) => (
                  <motion.div
                    key={bank._id}
                    className="bg-surface/30 rounded-3xl border border-white/5 p-6 shadow-xl flex flex-col justify-between gap-6 relative border-t-4 border-t-primary backdrop-blur-md"
                    variants={itemVariants}
                    whileHover={{ scale: 1.01, borderColor: 'rgba(255,255,255,0.08)' }}
                    layout
                  >
                    <div className="flex flex-col gap-2">
                      <h3 className="font-black text-white text-base leading-tight">{bank.name}</h3>
                      <div className="flex flex-col gap-1 text-[11px] text-muted font-semibold mt-1">
                        <span className="flex items-center gap-1.5">
                          <LuMapPin className="text-muted/80 text-xs" />
                          📍 {bank.address}, {bank.city}
                        </span>
                        {bank.phone && (
                          <span className="flex items-center gap-1.5 mt-0.5">
                            <LuPhone className="text-muted/80 text-xs" />
                            📞 {bank.phone}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stock inventory values with Liquid Gauges */}
                    <div className="border-t border-white/5 pt-4">
                      <span className="text-[9px] font-black text-muted uppercase tracking-widest block mb-4">
                        {t('directory.availableStock')}
                      </span>
                      <div className="grid grid-cols-4 gap-4">
                        {Object.entries(bank.availability).map(([type, units]) => {
                          const fillPercent = Math.min(100, (units / 25) * 100);
                          return (
                            <div key={type} className="flex flex-col items-center gap-2">
                              {/* 3D Glass Liquid Tube Gauge */}
                              <div className="relative h-20 w-8 bg-background/60 border border-white/10 rounded-full overflow-hidden shadow-inner flex flex-col justify-end">
                                {/* Moving wave mask */}
                                <motion.div
                                  className="w-full bg-gradient-to-t from-primary/80 to-primary-light relative overflow-hidden"
                                  initial={{ height: 0 }}
                                  animate={{ height: `${fillPercent}%` }}
                                  transition={{ duration: 0.8, ease: 'easeOut' }}
                                >
                                  {/* Wave highlight overlay */}
                                  <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 blur-[1px] animate-pulse" />
                                </motion.div>
                                {/* Tube glass shine overlay */}
                                <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-black/20 pointer-events-none" />
                                {/* Center value label inside tube */}
                                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                                  {units}
                                </span>
                              </div>
                              <span className="text-[10px] font-black text-muted uppercase tracking-wider">{type}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
};

export default BloodBankDirectory;
