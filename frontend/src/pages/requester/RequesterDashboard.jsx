import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import api from '../../services/api';
import useGuide from '../../hooks/useGuide';
import { LuPlus, LuActivity, LuCheck, LuUsers, LuFlame } from 'react-icons/lu';

const RequesterDashboard = () => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const { addToast } = useContext(NotificationContext);
  const navigate = useNavigate();
  const { autoStart } = useGuide('requester');

  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMyRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/requests?my=true');
      if (res.data.success) {
        setMyRequests(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching own requests:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchMyRequests();
    }
  }, [user]);

  useEffect(() => {
    autoStart();
  }, []);

  const handleFulfill = async (requestId) => {
    try {
      const res = await api.put(`/requests/${requestId}/fulfill`);
      if (res.data.success) {
        addToast(
          '🎉 Request Fulfilled',
          'Thank you for updating. The donation has been confirmed, and donor DRS has been updated!',
          'donation_confirmed'
        );
        fetchMyRequests();
      }
    } catch (error) {
      addToast('❌ Action Failed', error.response?.data?.message || 'Failed to fulfill request', 'sos_alert');
    }
  };

  const handleNoShow = async (requestId, donorId) => {
    try {
      const res = await api.put(`/requests/${requestId}/noshow/${donorId}`);
      if (res.data.success) {
        addToast(
          '⚠️ Donor No-Show',
          'Donor marked as no-show. Their DRS has been penalized, and your request is open again.',
          'general'
        );
        fetchMyRequests();
      }
    } catch (error) {
      addToast('❌ Action Failed', error.response?.data?.message || 'Failed to mark no-show', 'sos_alert');
    }
  };

  const handleCancel = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;
    try {
      const res = await api.put(`/requests/${requestId}/cancel`);
      if (res.data.success) {
        addToast('🛑 Request Cancelled', 'Your request has been cancelled.', 'general');
        fetchMyRequests();
      }
    } catch (error) {
      addToast('❌ Action Failed', error.response?.data?.message || 'Failed to cancel request', 'sos_alert');
    }
  };

  const handleSOS = async (requestId) => {
    try {
      const res = await api.post(`/requests/${requestId}/sos`);
      if (res.data.success) {
        addToast(
          '🚨 SOS Broadcasted',
          'CRITICAL SOS alert has been broadcasted via socket to all eligible donors in the city!',
          'sos_alert'
        );
        fetchMyRequests();
      }
    } catch (error) {
      addToast('❌ SOS Failed', error.response?.data?.message || 'Failed to trigger SOS', 'sos_alert');
    }
  };

  const listVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
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
          <motion.div 
            id="guide-welcome" 
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <h2 className="text-xl font-black tracking-tight flex items-center gap-2">🏠 {t('request.dashboardTitle')}</h2>
              <p className="text-xs text-muted mt-1 font-semibold">{t('request.dashboardSubtitle')}</p>
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/requests/post"
                id="guide-nav-post"
                className="bg-primary hover:bg-primary-light text-white text-[10px] font-black uppercase tracking-widest px-5 py-3.5 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center gap-2 border border-primary/20"
              >
                <LuPlus className="text-sm" />
                {t('request.post', 'Post Blood Request')}
              </Link>
            </motion.div>
          </motion.div>

          {loading ? (
            <div className="p-12 text-center text-xs text-muted font-bold animate-pulse">
              {t('request.loadingDashboard')}
            </div>
          ) : myRequests.length === 0 ? (
            <motion.div 
              className="flex flex-col items-center justify-center text-center p-8 bg-surface/40 border border-white/5 rounded-3xl min-h-80 shadow-2xl backdrop-blur-md"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <span className="text-4xl mb-4">📋</span>
              <h3 className="font-extrabold text-white text-sm">{t('request.noRequestsTitle')}</h3>
              <p className="text-xs text-muted max-w-xs mt-2 leading-relaxed font-semibold">{t('request.noRequestsDescription')}</p>
            </motion.div>
          ) : (
            <motion.div 
              id="guide-active-requests" 
              className="flex flex-col gap-6"
              variants={listVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence>
                {myRequests.map((req) => (
                  <motion.div
                    key={req._id}
                    className="bg-surface/30 rounded-3xl border border-white/5 p-6 shadow-xl flex flex-col gap-6 relative overflow-hidden backdrop-blur-md"
                    variants={itemVariants}
                    whileHover={{ borderColor: 'rgba(255,255,255,0.08)' }}
                    layout
                  >
                    {/* Status Tag */}
                    <div
                      className={`absolute top-0 right-0 px-4 py-1.5 text-[9px] font-black uppercase rounded-bl-2xl tracking-widest text-white shadow-md border-l border-b border-white/5 ${
                        req.status === 'open'
                          ? 'bg-blue-600/80 border-blue-500/25'
                          : req.status === 'matched'
                          ? 'bg-orange-600/80 border-orange-500/25 glow-primary'
                          : req.status === 'fulfilled'
                          ? 'bg-success/80 border-success/25'
                          : 'bg-slate-600/80 border-slate-500/25'
                      }`}
                    >
                      {req.status}
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      {/* Left: Blood request details */}
                      <div className="flex gap-5 items-start">
                        <div className="h-14 w-14 bg-primary/10 text-primary border border-primary/20 flex items-center justify-center rounded-2xl font-black text-xl shadow-inner glow-primary mt-0.5">
                          {req.bloodType}
                        </div>
                        <div className="flex flex-col">
                          <h3 className="font-black text-white text-base leading-snug">
                            Patient: {req.patientName}
                          </h3>
                          <span className="text-xs font-bold text-muted mt-1">
                            🏥 {req.hospitalName}, {req.city}
                          </span>
                          <div className="flex flex-wrap gap-3 mt-3 text-[10px] font-black uppercase tracking-widest text-muted">
                            <span>Urgency: <strong className={req.urgency === 'critical' ? 'text-primary-light glow-text-primary' : 'text-white'}>{req.urgency}</strong></span>
                            <span>•</span>
                            <span>Units: <strong className="text-white">{req.unitsRequired} Units</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions depending on state */}
                      <div className="flex flex-wrap gap-3 items-center justify-start md:justify-end">
                        {req.status === 'open' && (
                          <>
                            {(user?.role === 'hospital' || user?.role === 'admin') && (
                              <motion.button
                                onClick={() => handleSOS(req._id)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary-light text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer pulsing-glow-red"
                                title="Broadcast High-Alert SOS to all city donors"
                              >
                                <LuFlame className="text-sm" />
                                Trigger SOS Alert
                              </motion.button>
                            )}

                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                              <Link
                                to={`/requests/${req._id}/matches`}
                                className="bg-surface hover:bg-surface-light border border-white/10 text-white text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                              >
                                <LuUsers className="text-sm" />
                                View Matches ({req.respondedDonors?.length || 0})
                              </Link>
                            </motion.div>

                            <motion.button
                              onClick={() => handleCancel(req._id)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="bg-background/40 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 text-muted hover:text-primary-light text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-xl transition-all cursor-pointer"
                            >
                              Cancel Request
                            </motion.button>
                          </>
                        )}

                        {req.status === 'matched' && (
                          <motion.button
                            onClick={() => handleCancel(req._id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-background/40 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 text-muted hover:text-primary-light text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-xl transition-all cursor-pointer"
                          >
                            Release Commitment
                          </motion.button>
                        )}
                      </div>
                    </div>

                    {/* If Matched: Reveal Confirmed Donor with Phone Number! */}
                    {req.status === 'matched' && req.matchedDonor && (
                      <motion.div 
                        className="bg-primary/5 border border-primary/20 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2 shadow-inner"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <div className="flex gap-4 items-center">
                          <div className="h-10 w-10 bg-primary/20 border border-primary/30 text-white rounded-xl flex items-center justify-center font-black text-sm">
                            {req.matchedDonor.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <h4 className="font-extrabold text-white text-sm">
                              Confirmed Donor: {req.matchedDonor.name}
                            </h4>
                            <span className="text-xs font-bold text-primary-light mt-1">
                              📞 Contact Phone: <strong className="text-white select-all text-sm font-black tracking-wide ml-1">{req.matchedDonor.phone || 'N/A'}</strong>
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2.5">
                          <motion.button
                            onClick={() => handleFulfill(req._id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-success hover:bg-success/90 text-white text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-xl shadow-md transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <LuCheck className="text-sm" />
                            Confirm Donated
                          </motion.button>
                          <motion.button
                            onClick={() => handleNoShow(req._id, req.matchedDonor._id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-primary hover:bg-primary-light text-white text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-xl shadow-md transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <LuActivity className="text-sm" />
                            Mark No-Show
                          </motion.button>
                        </div>
                      </motion.div>
                    )}

                    {/* If Fulfilled: Show permanent completion log info */}
                    {req.status === 'fulfilled' && (
                      <div className="bg-success/10 border border-success/20 px-4 py-3 rounded-xl text-xs font-semibold text-success flex items-center gap-2 mt-2">
                        ✓ Donation successfully completed and verified on {new Date(req.fulfilledAt).toLocaleDateString()}.
                      </div>
                    )}
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

export default RequesterDashboard;
