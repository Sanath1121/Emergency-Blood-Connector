import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import api from '../../services/api';
import useGuide from '../../hooks/useGuide';
import { LuHospital, LuActivity, LuFlame, LuPlus, LuShieldAlert, LuDatabase } from 'react-icons/lu';

const HospitalDashboard = () => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const { addToast } = useContext(NotificationContext);
  const { autoStart } = useGuide('hospital');

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bloodBanks, setBloodBanks] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch own requests
      const reqRes = await api.get('/requests?my=true');
      if (reqRes.data.success) {
        setRequests(reqRes.data.data);
      }

      // 2. Fetch blood banks in their city
      const bankRes = await api.get(`/bloodbanks?city=${user?.city}`);
      if (bankRes.data.success) {
        setBloodBanks(bankRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching hospital dashboard data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    autoStart();
  }, []);

  const handleSOS = async (requestId) => {
    try {
      const res = await api.post(`/requests/${requestId}/sos`);
      if (res.data.success) {
        addToast(
          '🚨 Critical SOS Alert Broadcasted',
          'High-alert SOS signal has been sent to all eligible city donors via Socket.io!',
          'sos_alert'
        );
        fetchData();
      }
    } catch (error) {
      addToast('❌ Action Failed', error.response?.data?.message || 'Failed to trigger SOS', 'sos_alert');
    }
  };

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
          {/* Header */}
          <motion.div 
            id="guide-welcome" 
            className="bg-surface/50 p-6 rounded-3xl border border-white/5 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 backdrop-blur-xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-primary/10 text-primary border border-primary/20 flex items-center justify-center rounded-2xl text-xl shadow-inner glow-primary">
                <LuHospital />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight">
                  Hospital Coordinator Portal
                </h2>
                <p className="text-xs text-muted mt-1 font-semibold">
                  Institution: <span className="text-white font-extrabold">{user?.name}</span> • Region: <span className="text-white font-extrabold">{user?.city}</span>
                </p>
              </div>
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/requests/post"
                className="bg-primary hover:bg-primary-light text-white text-[10px] font-black uppercase tracking-widest px-5 py-3.5 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center gap-2 border border-primary/20 cursor-pointer"
              >
                <LuPlus className="text-sm" />
                Post Blood Request
              </Link>
            </motion.div>
          </motion.div>

          {/* Quick Info Grid: SOS info & inventory check */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* SOS Broadcast Instructions */}
            <motion.div 
              id="guide-sos" 
              className="bg-primary/5 p-6 rounded-3xl border border-primary/20 shadow-lg lg:col-span-1 flex flex-col justify-between"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div>
                <span className="text-3xl">🚨</span>
                <h3 className="font-black text-white text-xs mt-3 flex items-center gap-1.5 uppercase tracking-wider">
                  Emergency SOS System
                </h3>
                <p className="text-xs text-muted leading-relaxed mt-3 font-semibold">
                  As a hospital coordinator, you are authorized to trigger direct broadcast SOS alerts. This pushes high-volume websocket alerts and bypasses cooldown notification groups to compatible donors in your area.
                </p>
              </div>
              <div className="bg-primary/10 border border-primary/20 p-3 rounded-xl mt-6 flex items-center gap-2 text-[9px] font-black text-primary-light uppercase tracking-widest pulsing-glow-red">
                <LuShieldAlert className="text-sm" /> Authorized Personnel Only
              </div>
            </motion.div>

            {/* Blood bank inventories widget */}
            <motion.div 
              className="bg-surface/40 p-6 rounded-3xl border border-white/5 shadow-lg lg:col-span-2 flex flex-col backdrop-blur-md"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="font-black text-white text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                <LuDatabase className="text-primary-light" /> City Blood Banks Inventories
              </h3>

              {loading ? (
                <div className="flex-1 flex items-center justify-center text-xs text-muted font-bold animate-pulse">
                  {t('hospital.loadingStock', 'Loading stock data...')}
                </div>
              ) : bloodBanks.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-xs text-muted p-6 font-semibold">
                  {t('hospital.noBanks', 'No blood bank directory entries listed in your city yet')}
                </div>
              ) : (
                <div className="flex flex-col gap-3 max-h-48 overflow-y-auto pr-1">
                  {bloodBanks.map((bank) => (
                    <div
                      key={bank._id}
                      className="p-4 bg-background/40 border border-white/5 hover:border-white/10 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs transition-all"
                    >
                      <div>
                        <h4 className="font-extrabold text-white">{bank.name}</h4>
                        <span className="text-[10px] text-muted block mt-1 font-semibold">{bank.address}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(bank.availability).map(([type, units]) => (
                          <span
                            key={type}
                            className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                              units > 5 
                                ? 'bg-success/10 border-success/20 text-success' 
                                : 'bg-primary/10 border-primary/20 text-primary-light'
                            }`}
                          >
                            {type}: {units}u
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Active Hospital Requests */}
          <motion.div 
            className="bg-surface/40 p-6 rounded-3xl border border-white/5 shadow-lg flex flex-col min-h-[240px] backdrop-blur-md"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <h3 className="font-black text-white text-xs uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
              <LuActivity className="text-primary-light" /> Active Hospital Blood Requests
            </h3>

            {loading ? (
              <div className="p-8 text-center text-xs text-muted font-bold animate-pulse">
                {t('hospital.loadingRequests', 'Loading requests...')}
              </div>
            ) : requests.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted flex flex-col items-center justify-center min-h-[140px] font-semibold">
                <span className="text-3xl mb-2">📋</span>
                <p className="mt-1">{t('hospital.noRequests', 'No requests posted by your institution yet.')}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {requests.map((req) => (
                  <motion.div
                    key={req._id}
                    className="p-4 bg-background/40 border border-white/5 hover:border-white/10 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all"
                    variants={cardVariants}
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex gap-4 items-center">
                      <div className="h-11 w-11 bg-primary/10 text-primary border border-primary/20 flex items-center justify-center rounded-xl font-black text-base shadow-inner">
                        {req.bloodType}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-white text-xs">
                          Patient: {req.patientName} ({req.bloodType})
                        </h4>
                        <span className="text-[10px] text-muted block mt-1 uppercase font-black tracking-wider">
                          Units: <span className="text-white">{req.unitsRequired}u</span> • Status: <span className="text-primary-light">{req.status}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2.5 self-start sm:self-center">
                      {req.status === 'open' && (
                        <>
                          <motion.button
                            onClick={() => handleSOS(req._id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-primary hover:bg-primary-light text-white text-[9px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer pulsing-glow-red"
                          >
                            <LuFlame className="text-xs" /> {t('request.triggerSOS')}
                          </motion.button>
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Link
                              to={`/requests/${req._id}/matches`}
                              className="bg-surface hover:bg-surface-light border border-white/10 text-white text-[9px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl shadow-md transition-all block"
                            >
                              {t('request.viewMatches', { count: req.respondedDonors?.length || 0 })}
                            </Link>
                          </motion.div>
                        </>
                      )}
                      {req.status === 'matched' && (
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Link
                            to="/dashboard"
                            className="bg-success text-white text-[9px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl shadow-md transition-all block"
                          >
                            {t('hospital.manageDonor', 'Manage Donor')}
                          </Link>
                        </motion.div>
                      )}
                      {req.status === 'fulfilled' && (
                        <span className="text-[9px] font-black text-success bg-success/10 border border-success/20 px-3 py-2 rounded-xl uppercase tracking-wider">
                          Fulfilled ✓
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default HospitalDashboard;
