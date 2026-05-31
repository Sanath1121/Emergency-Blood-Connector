import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import api from '../../services/api';
import { LuHospital, LuActivity, LuFlame, LuPlus, LuShieldAlert, LuDatabase } from 'react-icons/lu';

const HospitalDashboard = () => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const { addToast } = useContext(NotificationContext);

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 max-w-6xl mx-auto flex flex-col gap-6">
          {/* Header */}
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-red-50 text-primary border border-red-100 flex items-center justify-center rounded-2xl text-xl shadow-sm">
                <LuHospital />
              </div>
              <div>
                <h2 className="text-xl font-bold text-secondary">
                  Hospital Coordinator Portal
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Institution: **{user?.name}** • Region: **{user?.city}**
                </p>
              </div>
            </div>
            <Link
              to="/requests/post"
              className="bg-primary hover:bg-primary-light text-white text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <LuPlus />
              Post Blood Request
            </Link>
          </div>

          {/* Quick Info Grid: SOS info & inventory check */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* SOS Broadcast Instructions */}
            <div className="bg-gradient-to-br from-red-50 to-white p-6 rounded-2xl border border-red-100 shadow-sm lg:col-span-1 flex flex-col justify-between">
              <div>
                <span className="text-2xl">🚨</span>
                <h3 className="font-extrabold text-red-950 text-sm mt-3 flex items-center gap-1.5">
                  Emergency SOS System
                </h3>
                <p className="text-xs text-red-800 leading-relaxed mt-2">
                  As a hospital coordinator, you are authorized to trigger direct broadcast SOS alerts. This pushes high-volume websocket alerts and bypasses cooldown notification groups to compatible donors in your area.
                </p>
              </div>
              <div className="bg-red-50 border border-red-100 p-3 rounded-xl mt-4 flex items-center gap-2 text-[10px] font-bold text-red-900 uppercase">
                <LuShieldAlert className="text-sm" /> Authorized Personnel Only
              </div>
            </div>

            {/* Blood bank inventories widget */}
            <div className="bg-white p-6 rounded-2xl border border-border shadow-sm lg:col-span-2 flex flex-col">
              <h3 className="font-bold text-secondary text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
                <LuDatabase className="text-primary" /> City Blood Banks Inventories
              </h3>

              {loading ? (
                <div className="flex-1 flex items-center justify-center text-xs text-muted">
                  Loading stock data...
                </div>
              ) : bloodBanks.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-xs text-muted p-6">
                  No blood bank directory entries listed in your city yet
                </div>
              ) : (
                <div className="flex flex-col gap-3 max-h-40 overflow-y-auto pr-1">
                  {bloodBanks.map((bank) => (
                    <div
                      key={bank._id}
                      className="p-3 bg-gray-50 border border-border rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs"
                    >
                      <div>
                        <h4 className="font-bold text-secondary">{bank.name}</h4>
                        <span className="text-[10px] text-gray-400 block mt-0.5">{bank.address}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(bank.availability).map(([type, units]) => (
                          <span
                            key={type}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              units > 5 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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
            </div>
          </div>

          {/* Active Hospital Requests */}
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col min-h-60">
            <h3 className="font-bold text-secondary text-xs uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-border pb-3">
              <LuActivity className="text-primary" /> Active Hospital Blood Requests
            </h3>

            {loading ? (
              <div className="p-8 text-center text-xs text-muted">
                Loading requests...
              </div>
            ) : requests.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted flex flex-col items-center justify-center min-h-40">
                <span>📋</span>
                <p className="mt-1">No requests posted by your institution yet.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {requests.map((req) => (
                  <div
                    key={req._id}
                    className="p-4 bg-gray-50 border border-border rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                  >
                    <div className="flex gap-4 items-center">
                      <div className="h-10 w-10 bg-red-50 text-primary border border-red-100 flex items-center justify-center rounded-xl font-bold">
                        {req.bloodType}
                      </div>
                      <div>
                        <h4 className="font-bold text-secondary text-xs">
                          Patient: {req.patientName} ({req.bloodType})
                        </h4>
                        <span className="text-[10px] text-gray-400 block mt-0.5 uppercase font-semibold">
                          Units: {req.unitsRequired}u • Status: <strong className="text-secondary">{req.status}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 self-start sm:self-center">
                      {req.status === 'open' && (
                        <>
                          <button
                            onClick={() => handleSOS(req._id)}
                            className="bg-primary hover:bg-primary-light text-white text-[10px] font-extrabold uppercase tracking-widest px-4 py-2 rounded-lg shadow-sm transition-all flex items-center gap-1"
                          >
                            <LuFlame className="text-xs" /> Trigger SOS
                          </button>
                          <Link
                            to={`/requests/${req._id}/matches`}
                            className="bg-secondary hover:bg-secondary/90 text-white text-[10px] font-extrabold uppercase tracking-widest px-4 py-2 rounded-lg shadow-sm transition-all"
                          >
                            View Matches
                          </Link>
                        </>
                      )}
                      {req.status === 'matched' && (
                        <Link
                          to="/dashboard"
                          className="bg-success text-white text-[10px] font-extrabold uppercase tracking-widest px-4 py-2 rounded-lg shadow-sm transition-all"
                        >
                          Manage Donor
                        </Link>
                      )}
                      {req.status === 'fulfilled' && (
                        <span className="text-[10px] font-bold text-success bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
                          Fulfilled ✓
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default HospitalDashboard;
