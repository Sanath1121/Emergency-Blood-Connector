import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import api from '../../services/api';
import { LuPlus, LuActivity, LuCheck, LuUsers, LuFlame } from 'react-icons/lu';

const RequesterDashboard = () => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const { addToast } = useContext(NotificationContext);
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 max-w-6xl mx-auto flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
            <div>
              <h2 className="text-xl font-bold text-secondary flex items-center gap-2">🏠 {t('request.dashboardTitle')}</h2>
              <p className="text-xs text-gray-500 mt-1">{t('request.dashboardSubtitle')}</p>
            </div>
            <Link
              to="/requests/post"
              className="bg-primary hover:bg-primary-light text-white text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <LuPlus />
              {t('request.post', 'Post Blood Request')}
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-muted">
              {t('request.loadingDashboard')}
            </div>
          ) : myRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-8 bg-white border border-border rounded-2xl min-h-80 shadow-sm">
              <span className="text-4xl mb-3">📋</span>
              <h3 className="font-extrabold text-secondary text-sm">{t('request.noRequestsTitle')}</h3>
              <p className="text-xs text-gray-400 max-w-xs mt-1 leading-relaxed">{t('request.noRequestsDescription')}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {myRequests.map((req) => (
                <div
                  key={req._id}
                  className="bg-white rounded-2xl border border-border p-6 shadow-sm flex flex-col gap-6 relative overflow-hidden"
                >
                  {/* Status Ribbon */}
                  <div
                    className={`absolute top-0 right-0 px-3 py-1 text-[9px] font-extrabold uppercase rounded-bl-xl tracking-wider text-white shadow-sm ${
                      req.status === 'open'
                        ? 'bg-blue-500'
                        : req.status === 'matched'
                        ? 'bg-orange-500'
                        : req.status === 'fulfilled'
                        ? 'bg-green-600'
                        : 'bg-gray-400'
                    }`}
                  >
                    {req.status}
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    {/* Left: Blood request details */}
                    <div className="flex gap-4 items-start">
                      <div className="h-14 w-14 bg-red-50 text-primary border border-red-100 flex items-center justify-center rounded-2xl font-black text-xl shadow-sm mt-0.5">
                        {req.bloodType}
                      </div>
                      <div className="flex flex-col">
                        <h3 className="font-extrabold text-secondary text-base">
                          Patient: {req.patientName}
                        </h3>
                        <span className="text-xs font-bold text-gray-500 mt-1">
                          📍 {req.hospitalName}, {req.city}
                        </span>
                        <div className="flex flex-wrap gap-2.5 mt-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          <span>Urgency: <strong className={req.urgency === 'critical' ? 'text-primary' : 'text-secondary'}>{req.urgency}</strong></span>
                          <span>•</span>
                          <span>Units: <strong className="text-secondary">{req.unitsRequired} Units</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions depending on state */}
                    <div className="flex flex-wrap gap-3 items-center justify-start md:justify-end">
                      {req.status === 'open' && (
                        <>
                          {(user?.role === 'hospital' || user?.role === 'admin') && (
                            <button
                              onClick={() => handleSOS(req._id)}
                              className="bg-red-50 hover:bg-red-100 border border-red-200 text-primary text-[10px] font-extrabold uppercase tracking-widest px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                              title="Broadcast High-Alert SOS to all city donors"
                            >
                              <LuFlame className="text-sm" />
                              Trigger SOS Alert
                            </button>
                          )}

                          <Link
                            to={`/requests/${req._id}/matches`}
                            className="bg-secondary hover:bg-secondary/90 text-white text-[10px] font-extrabold uppercase tracking-widest px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                          >
                            <LuUsers className="text-sm" />
                            View Matches ({req.respondedDonors?.length || 0} Responded)
                          </Link>

                          <button
                            onClick={() => handleCancel(req._id)}
                            className="bg-white hover:bg-red-50 border border-border hover:border-red-200 text-gray-500 hover:text-primary text-[10px] font-extrabold uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all"
                          >
                            Cancel Request
                          </button>
                        </>
                      )}

                      {req.status === 'matched' && (
                        <button
                          onClick={() => handleCancel(req._id)}
                          className="bg-white hover:bg-red-50 border border-border hover:border-red-200 text-gray-500 hover:text-primary text-[10px] font-extrabold uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all"
                        >
                          Release Donor Commitment
                        </button>
                      )}
                    </div>
                  </div>

                  {/* If Matched: Reveal Confirmed Donor with Phone Number! */}
                  {req.status === 'matched' && req.matchedDonor && (
                    <div className="bg-red-50/20 border border-red-100 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
                      <div className="flex gap-4 items-center">
                        <div className="h-10 w-10 bg-secondary text-white rounded-xl flex items-center justify-center font-bold text-sm">
                          {req.matchedDonor.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <h4 className="font-extrabold text-secondary text-sm">
                            Confirmed Donor: {req.matchedDonor.name}
                          </h4>
                          <span className="text-xs font-bold text-primary mt-1">
                            📞 Contact Phone: <strong className="text-secondary select-all text-sm font-extrabold">{req.matchedDonor.phone || 'N/A'}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleFulfill(req._id)}
                          className="bg-success hover:bg-success/90 text-white text-[10px] font-extrabold uppercase tracking-widest px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1"
                        >
                          <LuCheck className="text-sm" />
                          Confirm Donated
                        </button>
                        <button
                          onClick={() => handleNoShow(req._id, req.matchedDonor._id)}
                          className="bg-primary hover:bg-primary-light text-white text-[10px] font-extrabold uppercase tracking-widest px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1"
                        >
                          <LuActivity className="text-sm" />
                          Mark No-Show
                        </button>
                      </div>
                    </div>
                  )}

                  {/* If Fulfilled: Show permanent completion log info */}
                  {req.status === 'fulfilled' && (
                    <div className="bg-green-50/20 border border-green-100 px-4 py-3 rounded-xl text-xs font-semibold text-success flex items-center gap-2 mt-2">
                      ✓ Donation successfully completed and verified on {new Date(req.fulfilledAt).toLocaleDateString()}.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default RequesterDashboard;
