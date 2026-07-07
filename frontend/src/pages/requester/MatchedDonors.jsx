import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { NotificationContext } from '../../context/NotificationContext';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import DRSBadge from '../../components/common/DRSBadge';
import api from '../../services/api';
import { LuUsers, LuCheck, LuArrowLeft } from 'react-icons/lu';

const MatchedDonors = () => {
  const { t } = useTranslation();
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
        const reqData = res.data.data.request;
        setRequest(reqData);
        
        // Merge respondedDonors and matchedDonorsList (remove duplicates)
        const responded = reqData.respondedDonors || [];
        const topEligible = res.data.data.matchedDonorsList || [];
        
        const merged = [...responded];
        const respondedIds = new Set(responded.map(d => d._id.toString()));
        
        topEligible.forEach(d => {
          if (!respondedIds.has(d._id.toString())) {
            merged.push(d);
          }
        });
        
        setMatchedDonors(merged);
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
          t('requester.commitmentRegistered'),
          t('requester.youAreCoordinating'),
          'general'
        );
        navigate('/dashboard');
      }
    } catch (error) {
      addToast(t('common.errorRetry'), error.response?.data?.message || t('requester.confirmFailed', 'Failed to confirm donor'), 'sos_alert');
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
                <LuUsers /> {t('requester.matchingTitle')}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {t('requester.matchingSubtitle')}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-muted">
              {t('requester.loadingMatches')}
            </div>
          ) : !request ? (
            <div className="p-8 text-center text-xs text-muted">
              {t('requester.requestNotFound')}
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
                      {t('requester.requestSummaryPatient')}: {request.patientName} ({request.bloodType})
                    </h3>
                    <span className="text-[10px] text-gray-400 font-bold block mt-0.5 uppercase tracking-wider">
                      📍 {request.hospitalName}, {request.city} • {t('requester.requestSummaryUnits')}: {request.unitsRequired}
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
                  {t('requester.requestSummaryUrgency')}: {request.urgency}
                </span>
              </div>

              {/* List of matching donors */}
              <h3 className="font-bold text-xs uppercase tracking-widest text-primary mt-2">
                {t('requester.topDonors')}
              </h3>

              {matchedDonors.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-8 bg-black/40 border border-border rounded-2xl min-h-60 shadow-sm backdrop-blur-sm">
                  <span className="text-4xl mb-3">🔍</span>
                  <h4 className="font-bold text-white text-sm">{t('requester.noCompatibleDonors')}</h4>
                  <p className="text-xs text-gray-300 max-w-md mt-2 leading-relaxed">
                    {t('requester.noCompatibleDonorsDescription')}
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
                                  ✓ {t('requester.responded')}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-4 items-center mt-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                              <span>{t('requester.bloodGroup')}: <strong className="text-secondary">{donor.bloodType}</strong></span>
                              <span>•</span>
                              <span>{t('requester.donationsSaved')}: <strong className="text-secondary">{donor.totalDonations}</strong></span>
                            </div>
                            
                            {respondedToThis && donor.phone && (
                              <div className="mt-2 text-xs font-bold text-primary">
                                📞 Contact: <strong className="text-secondary select-all">{donor.phone}</strong>
                              </div>
                            )}
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
                            {confirmingId === donor._id ? t('requester.confirming') : t('requester.confirmDonor')}
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
