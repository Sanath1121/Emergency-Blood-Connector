import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import DRSBadge from '../../components/common/DRSBadge';
import api from '../../services/api';
import useGuide from '../../hooks/useGuide';
import { LuHeartPulse, LuCalendar, LuTrophy, LuActivity, LuAward } from 'react-icons/lu';

const DonorDashboard = () => {
  const { t } = useTranslation();
  const { user, updateUserProfile } = useContext(AuthContext);
  const { addToast } = useContext(NotificationContext);
  const { autoStart } = useGuide('donor');

  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [recentResponses, setRecentResponses] = useState([]);
  const [loadingResponses, setLoadingResponses] = useState(false);

  const fetchLeaderboard = async () => {
    if (!user || !user.showOnLeaderboard) return;
    setLoadingLeaderboard(true);
    try {
      const res = await api.get('/donors/leaderboard');
      if (res.data.success) {
        setLeaderboard(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
    setLoadingLeaderboard(false);
  };

  const fetchResponses = async () => {
    setLoadingResponses(true);
    try {
      const res = await api.get('/donors/my/requests');
      if (res.data.success) {
        setRecentResponses(res.data.data.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching responses:', error);
    }
    setLoadingResponses(false);
  };

  useEffect(() => {
    fetchLeaderboard();
    fetchResponses();
  }, [user?.showOnLeaderboard, user?.city]);

  useEffect(() => {
    autoStart();
  }, []);

  const handleOptIn = async () => {
    try {
      const res = await api.put('/donors/profile', { showOnLeaderboard: true });
      if (res.data.success) {
        updateUserProfile(res.data.data);
        addToast('🏆 Opted In!', 'You are now visible on the city leaderboard.', 'general');
      }
    } catch (error) {
      console.error('Error opting in:', error);
    }
  };

  // Cooldown calculation
  const getCooldownDays = () => {
    if (!user?.cooldownUntil) return 0;
    const diff = new Date(user.cooldownUntil).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const cooldownDays = getCooldownDays();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 max-w-6xl mx-auto flex flex-col gap-6">
          {/* Header */}
          <div id="guide-welcome" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-border shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-secondary">{t('donor.welcomeBack', { name: user?.name })}</h2>
              <p className="text-xs text-gray-500 mt-1">{t('donor.registeredAs', { bloodType: user?.bloodType, city: user?.city })}</p>
            </div>
            <div id="guide-drs">
              <DRSBadge score={user?.drsScore || 50} />
            </div>
          </div>

          {/* Cooldown Active Banner */}
          {user?.availability === 'on_cooldown' && cooldownDays > 0 && (
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center gap-3 border-l-4 border-l-orange-500 shadow-sm">
              <span className="text-2xl">⏳</span>
              <div className="flex-1">
                <h4 className="font-bold text-orange-900 text-sm">{t('donor.cooldownTitle')}</h4>
                <p className="text-xs text-orange-700 mt-0.5 leading-relaxed">{t('donor.cooldownDescription')}</p>
              </div>
              <span className="px-4 py-2 bg-orange-100 border border-orange-200 text-orange-800 text-xs font-extrabold rounded-lg whitespace-nowrap self-start sm:self-center">
                {t('donor.daysRemaining', { count: cooldownDays })}
              </span>
            </div>
          )}

          {/* Quick Metrics grid */}
          <div id="guide-stats" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-white border border-border shadow-sm flex items-center gap-4">
              <div className="h-10 w-10 bg-red-50 rounded-xl text-primary flex items-center justify-center text-lg border border-red-100">
                <LuHeartPulse />
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {t('donor.totalDonations')}
                </span>
                <h3 className="text-xl font-extrabold text-secondary mt-0.5">
                  {user?.totalDonations || 0}
                </h3>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-border shadow-sm flex items-center gap-4">
              <div className="h-10 w-10 bg-orange-50 rounded-xl text-orange-500 flex items-center justify-center text-lg border border-orange-100">
                <LuCalendar />
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {t('donor.availabilityLabel')}
                </span>
                <h3 className="text-sm font-bold text-secondary capitalize mt-1">
                  {user?.availability === 'available' ? (
                    <span className="text-success">Available 🟢</span>
                  ) : user?.availability === 'on_cooldown' ? (
                    <span className="text-orange-500">On Cooldown ⏳</span>
                  ) : (
                    <span className="text-gray-400">Unavailable 🔴</span>
                  )}
                </h3>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-border shadow-sm flex items-center gap-4 col-span-1 sm:col-span-2">
              <div className="h-10 w-10 bg-amber-50 rounded-xl text-amber-500 flex items-center justify-center text-lg border border-amber-100">
                <LuAward />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                  {t('donor.milestoneBadges')}
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {user?.badges?.length === 0 ? (
                    <span className="text-xs text-gray-400">{t('donor.noBadges')}</span>
                  ) : (
                    user?.badges?.map((badge, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold rounded"
                        title={`Awarded on ${new Date(badge.awardedAt).toLocaleDateString()}`}
                      >
                        {badge.label}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Grid: Leaderboard & Responded Requests */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* City Leaderboard */}
            <div className="p-6 bg-white rounded-2xl border border-border shadow-sm flex flex-col min-h-80">
              <div className="flex items-center gap-2 border-b border-border pb-4 mb-4">
                <LuTrophy className="text-primary text-xl" />
                <h3 className="font-bold text-secondary text-sm uppercase tracking-wider">
                  {t('donor.leaderboardTitle')}
                </h3>
              </div>

              {!user?.showOnLeaderboard ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-gray-50 border border-dashed border-border rounded-xl">
                  <span className="text-3xl mb-3">👁️</span>
                  <h4 className="font-bold text-secondary text-sm">{t('donor.leaderboardOptInRequiredTitle')}</h4>
                  <p className="text-xs text-gray-500 max-w-xs mt-1 leading-relaxed">{t('donor.leaderboardOptInRequiredDescription')}</p>
                  <button
                    onClick={handleOptIn}
                    className="mt-4 bg-primary hover:bg-primary-light text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-lg shadow-md transform active:scale-95 transition-all"
                  >
                    {t('donor.leaderboardOptInButton')}
                  </button>
                </div>
              ) : loadingLeaderboard ? (
                <div className="flex-1 flex items-center justify-center text-xs text-muted">
                  {t('donor.loadingLeaderboard')}
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-xs text-muted">
                  {t('donor.noOtherDonors', { city: user?.city })}
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {leaderboard.map((donor, idx) => (
                    <div
                      key={donor._id}
                      className={`flex items-center justify-between p-3 rounded-xl border border-border ${
                        donor._id === user._id ? 'bg-red-50/30 border-red-200' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-extrabold text-muted w-4">{idx + 1}.</span>
                        <div className="h-7 w-7 rounded-full bg-secondary text-white font-bold text-xs flex items-center justify-center">
                          {donor.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-secondary">
                            {donor.name} {donor._id === user._id && ' (You)'}
                          </span>
                          <div className="flex gap-1.5 mt-0.5">
                            {donor.badges.slice(0, 1).map((b, bIdx) => (
                              <span key={bIdx} className="text-[9px] font-bold text-amber-700">
                                {b.label}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-primary block">
                          {donor.totalDonations} Donations
                        </span>
                        <span className="text-[9px] text-gray-400 font-bold block">
                          DRS: {donor.drsScore}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Responded Requests List */}
            <div className="p-6 bg-white rounded-2xl border border-border shadow-sm flex flex-col min-h-80">
              <div className="flex items-center gap-2 border-b border-border pb-4 mb-4">
                <LuActivity className="text-primary text-xl" />
                <h3 className="font-bold text-secondary text-sm uppercase tracking-wider">
                  {t('donor.recentResponsesTitle')}
                </h3>
              </div>

              {loadingResponses ? (
                <div className="flex-1 flex items-center justify-center text-xs text-muted">
                  {t('donor.loadingResponses')}
                </div>
              ) : recentResponses.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-gray-50 border border-dashed border-border rounded-xl">
                  <span className="text-3xl mb-2">🩹</span>
                  <h4 className="font-bold text-secondary text-xs">{t('donor.noResponsesTitle', 'No Active Commitments')}</h4>
                  <p className="text-[10px] text-gray-500 max-w-xs mt-0.5 leading-relaxed">
                    {t('donor.noResponsesDescription', 'Check the "Requests" page in your sidebar to accept open compatible blood requests in your city.')}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {recentResponses.map((req) => (
                    <div
                      key={req._id}
                      className="p-3 bg-white border border-border rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-3"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-secondary">
                          {t('request.patient')}: {req.patientName} ({req.bloodType})
                        </span>
                        <span className="text-[10px] text-gray-400 font-semibold mt-0.5">
                          {t('request.hospital')}: {req.hospitalName}, {req.city}
                        </span>
                        <span className="text-[9px] text-gray-400 mt-0.5">
                          {t('request.postedOn', 'Posted on')} {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            req.status === 'open'
                              ? 'bg-blue-100 text-blue-800'
                              : req.status === 'matched'
                              ? 'bg-orange-100 text-orange-800'
                              : req.status === 'fulfilled'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DonorDashboard;
