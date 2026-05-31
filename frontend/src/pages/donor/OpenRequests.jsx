import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import api from '../../services/api';
import { isCompatible } from '../../utils/bloodCompatibility';
import { LuSearch, LuMapPin, LuActivity } from 'react-icons/lu';

const OpenRequests = () => {
  const { t } = useTranslation();
  const { user, updateUserProfile } = useContext(AuthContext);
  const { addToast } = useContext(NotificationContext);

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [acceptingId, setAcceptingId] = useState(null);
  const [coordinatingId, setCoordinatingId] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/requests?city=' + user?.city);
      if (res.data.success) {
        // Filter compatible requests only
        const compatibleRequests = res.data.data.filter((req) =>
          isCompatible(user?.bloodType, req.bloodType)
        );
        setRequests(compatibleRequests);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const handleAccept = async (requestId) => {
    if (user?.availability === 'on_cooldown') {
      addToast('⏳ Cooldown Active', 'You are on cooldown and cannot accept donation requests.', 'sos_alert');
      return;
    }

    setAcceptingId(requestId);
    try {
      const res = await api.put(`/requests/${requestId}/respond`);
      if (res.data.success) {
        addToast(
          '🤝 Commitment Registered',
          `You have accepted the request. Requesters will contact you if selected! DRS: ${res.data.data.drsScore} (+${res.data.data.drsChange})`,
          'general'
        );
        // Refresh requests and profile
        fetchRequests();
        const meRes = await api.get('/auth/me');
        if (meRes.data.success) {
          updateUserProfile(meRes.data.data);
        }
      }
    } catch (error) {
      addToast('❌ Commitment Failed', error.response?.data?.message || 'Failed to accept request', 'sos_alert');
    }
    setAcceptingId(null);
  };

  const handleCoordinate = async (requestId) => {
    setCoordinatingId(requestId);
    try {
      const res = await api.put(`/requests/${requestId}/coordinate`);
      if (res.data.success) {
        addToast(
          '🤝 Coordination Registered',
          'You are now coordinating this request. The patient has been notified!',
          'general'
        );
        fetchRequests();
      }
    } catch (error) {
      addToast('❌ Action Failed', error.response?.data?.message || 'Failed to register coordination', 'sos_alert');
    }
    setCoordinatingId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 max-w-6xl mx-auto flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-border pb-4">
            <div>
              <h2 className="text-xl font-bold text-secondary flex items-center gap-2">
                🩸 Open Emergency Requests
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Showing compatible blood requests in **{user?.city}** for your **{user?.bloodType}** blood group.
              </p>
            </div>
            <button
              onClick={fetchRequests}
              className="bg-gray-100 hover:bg-gray-200 border border-border text-secondary text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-all"
            >
              Refresh List
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-muted">
              Searching matching emergency requests...
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-8 bg-white border border-border rounded-2xl min-h-80 shadow-sm">
              <span className="text-4xl mb-3">🕊️</span>
              <h3 className="font-extrabold text-secondary text-sm">No Open Requests In Your Area</h3>
              <p className="text-xs text-gray-400 max-w-xs mt-1 leading-relaxed">
                Splendid news! There are currently no emergency compatibility requests matching your city. Thank you for staying alert.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {requests.map((req) => {
                const alreadyResponded = req.respondedDonors.includes(user?._id);
                return (
                  <div
                    key={req._id}
                    className={`bg-white rounded-2xl border p-5 flex flex-col justify-between shadow-sm relative overflow-hidden transition-all ${
                      alreadyResponded ? 'border-success/30 bg-green-50/10' : 'border-border'
                    }`}
                  >
                    {/* Urgency Ribbon */}
                    <div
                      className={`absolute top-0 right-0 px-3 py-1 text-[9px] font-extrabold uppercase rounded-bl-xl tracking-wider text-white shadow-sm ${
                        req.urgency === 'critical'
                          ? 'bg-red-600'
                          : req.urgency === 'moderate'
                          ? 'bg-amber-500'
                          : 'bg-blue-500'
                      }`}
                    >
                      {req.urgency}
                    </div>

                    <div className="flex flex-col gap-4">
                      {/* Blood type required large badge */}
                      <div className="flex gap-4 items-center">
                        <div className="h-12 w-12 bg-red-50 text-primary border border-red-100 flex items-center justify-center rounded-2xl font-black text-lg shadow-sm">
                          {req.bloodType}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-secondary text-sm">
                            Patient: {req.patientName}
                          </h3>
                          <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider mt-0.5">
                            Required: {req.unitsRequired} Units
                          </span>
                        </div>
                      </div>

                      {/* Detail locations */}
                      <div className="flex flex-col gap-1.5 border-t border-border pt-4 text-xs font-semibold text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <LuMapPin className="text-gray-400" />
                          📍 {req.hospitalName}, {req.city}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <LuActivity className="text-gray-400" />
                          ⏰ Posted on {new Date(req.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-border flex flex-wrap justify-end gap-2">
                      {/* Blood donation accept/status */}
                      {alreadyResponded ? (
                        <span className="px-4 py-2 border border-success bg-green-50 text-success text-[10px] font-extrabold uppercase tracking-widest rounded-xl">
                          ✓ Commitment Registered
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAccept(req._id)}
                          disabled={user?.availability === 'on_cooldown' || acceptingId === req._id}
                          className="bg-primary hover:bg-primary-light disabled:bg-gray-300 text-white text-[10px] font-extrabold uppercase tracking-widest px-5 py-2.5 rounded-xl shadow-md transition-all transform active:scale-95"
                        >
                          {acceptingId === req._id ? 'Accepting...' : 'Accept Request'}
                        </button>
                      )}

                      {/* Coordinate button */}
                      {req.coordinator && req.coordinator === user?._id ? (
                        <span className="px-4 py-2 border border-blue-200 bg-blue-50 text-blue-600 text-[10px] font-extrabold uppercase tracking-widest rounded-xl">
                          🤝 You are Coordinating
                        </span>
                      ) : !req.coordinator ? (
                        <button
                          onClick={() => handleCoordinate(req._id)}
                          disabled={coordinatingId === req._id}
                          className="bg-secondary hover:bg-secondary/90 disabled:bg-gray-300 text-white text-[10px] font-extrabold uppercase tracking-widest px-5 py-2.5 rounded-xl shadow-md transition-all transform active:scale-95"
                        >
                          {coordinatingId === req._id ? 'Registering...' : '🤝 Help Coordinate'}
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default OpenRequests;
