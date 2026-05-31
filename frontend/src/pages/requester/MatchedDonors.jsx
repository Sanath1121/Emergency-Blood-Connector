import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { NotificationContext } from '../../context/NotificationContext';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import DRSBadge from '../../components/common/DRSBadge';
import api from '../../services/api';
import { LuUsers, LuCheck, LuArrowLeft } from 'react-icons/lu';

const MatchedDonors = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useContext(NotificationContext);

  const [request, setRequest] = useState(null);
  const [matchedDonors, setMatchedDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmingId, setConfirmingId] = useState(null);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/requests/${id}`);
      if (res.data.success) {
        setRequest(res.data.data.request);
        setMatchedDonors(res.data.data.matchedDonorsList || []);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMatches();
  }, [id]);

  const handleConfirm = async (donorId) => {
    setConfirmingId(donorId);
    try {
      const res = await api.put(`/requests/${id}/confirm/${donorId}`);
      if (res.data.success) {
        addToast(
          '🥇 Donor Confirmed',
          'Donor commitment registered! Contact information is now revealed on your dashboard.',
          'general'
        );
        navigate('/dashboard');
      }
    } catch (error) {
      addToast('❌ Action Failed', error.response?.data?.message || 'Failed to confirm donor', 'sos_alert');
    }
    setConfirmingId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 max-w-5xl mx-auto flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="p-2 bg-white border border-border rounded-xl text-gray-500 hover:text-primary transition-all hover:shadow-sm"
            >
              <LuArrowLeft className="text-lg" />
            </Link>
            <div>
              <h2 className="text-xl font-bold text-secondary flex items-center gap-2">
                <LuUsers /> Compatible Donors Matching
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Showing compatible verified donors in city. DRS ranks reliability descending.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-muted">
              Matching compatibility list...
            </div>
          ) : !request ? (
            <div className="p-8 text-center text-xs text-muted">
              Request not found
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Blood request details summary */}
              <div className="bg-white p-5 rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-l-primary">
                <div className="flex gap-4 items-center">
                  <div className="h-10 w-10 bg-red-50 text-primary border border-red-100 flex items-center justify-center rounded-xl font-black text-sm">
                    {request.bloodType}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-secondary text-sm">
                      Patient: {request.patientName} ({request.bloodType})
                    </h3>
                    <span className="text-[10px] text-gray-400 font-bold block mt-0.5 uppercase tracking-wider">
                      📍 {request.hospitalName}, {request.city} • Units: {request.unitsRequired}
                    </span>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 text-[10px] font-extrabold uppercase rounded-full tracking-wider border shadow-sm ${
                    request.urgency === 'critical'
                      ? 'bg-red-50 border-red-200 text-primary'
                      : 'bg-gray-50 border-border text-gray-600'
                  }`}
                >
                  Urgency: {request.urgency}
                </span>
              </div>

              {/* List of matching donors */}
              <h3 className="font-bold text-xs uppercase tracking-widest text-primary mt-2">
                Top Compatible Donors List (sorted by DRS Score)
              </h3>

              {matchedDonors.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-8 bg-white border border-border rounded-2xl min-h-60 shadow-sm">
                  <span className="text-4xl mb-3">🔍</span>
                  <h4 className="font-bold text-secondary text-sm">No Compatible Donors Available</h4>
                  <p className="text-xs text-gray-500 max-w-md mt-1 leading-relaxed">
                    There are currently no compatible verified blood donors marked as "Available" in your city. If this is critical, Hospital coordinators can trigger the high-alert SOS broadcast!
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {matchedDonors.map((donor) => {
                    const respondedToThis = request.respondedDonors.some(
                      (id) => id._id === donor._id
                    );

                    return (
                      <div
                        key={donor._id}
                        className={`bg-white rounded-2xl border p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-sm transition-all ${
                          respondedToThis ? 'border-success/30 bg-green-50/10' : 'border-border'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          <div className="h-10 w-10 bg-secondary text-white rounded-xl font-bold flex items-center justify-center text-sm shadow-sm">
                            {donor.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-secondary text-sm">{donor.name}</h4>
                              {respondedToThis && (
                                <span className="bg-green-100 text-success text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded">
                                  ✓ Responded Willing
                                </span>
                              )}
                            </div>
                            <div className="flex gap-4 items-center mt-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                              <span>Blood Group: <strong className="text-secondary">{donor.bloodType}</strong></span>
                              <span>•</span>
                              <span>Donations saved: <strong className="text-secondary">{donor.totalDonations}</strong></span>
                            </div>
                          </div>
                        </div>

                        {/* Middle: DRS Badge display */}
                        <div className="self-start sm:self-center">
                          <DRSBadge score={donor.drsScore} />
                        </div>

                        {/* Right: Confirm Button (Phone number remains hidden!) */}
                        <div className="self-end sm:self-center">
                          <button
                            onClick={() => handleConfirm(donor._id)}
                            disabled={confirmingId === donor._id}
                            className={`text-[10px] font-extrabold uppercase tracking-widest px-5 py-2.5 rounded-xl shadow-md transition-all transform active:scale-95 flex items-center gap-1 ${
                              respondedToThis
                                ? 'bg-success hover:bg-success/90 text-white'
                                : 'bg-secondary hover:bg-secondary/90 text-white'
                            }`}
                          >
                            <LuCheck />
                            {confirmingId === donor._id ? 'Confirming...' : 'Confirm Donor'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MatchedDonors;
