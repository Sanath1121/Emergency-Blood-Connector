import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import api from '../../services/api';
import useGuide from '../../hooks/useGuide';
import { LuUsers, LuHeartPulse, LuFlame, LuTrophy, LuActivity, LuUserCheck } from 'react-icons/lu';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { autoStart } = useGuide('admin');

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching admin statistics:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    autoStart();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 max-w-6xl mx-auto flex flex-col gap-6">
          <h2 id="guide-welcome" className="text-xl font-bold text-secondary flex items-center gap-2">
            ⚙️ {t('admin.dashboardTitle')}
          </h2>

          {loading ? (
            <div className="p-8 text-center text-xs text-muted">
              {t('admin.loading')}
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Aggregates Card Grid */}
              <div id="guide-stats" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-5 rounded-2xl bg-white border border-border shadow-sm flex items-center gap-4">
                  <div className="h-10 w-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center text-lg border border-blue-100">
                    <LuUsers />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {t('admin.totalUsers')}
                    </span>
                    <h3 className="text-xl font-extrabold text-secondary mt-0.5">
                      {stats?.totalUsers || 0}
                    </h3>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-border shadow-sm flex items-center gap-4">
                  <div className="h-10 w-10 bg-red-50 text-primary rounded-xl flex items-center justify-center text-lg border border-red-100 animate-pulse">
                    <LuHeartPulse />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {t('admin.activeRequests')}
                    </span>
                    <h3 className="text-xl font-extrabold text-secondary mt-0.5">
                      {stats?.activeRequests || 0}
                    </h3>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-border shadow-sm flex items-center gap-4">
                  <div className="h-10 w-10 bg-green-50 text-success rounded-xl flex items-center justify-center text-lg border border-green-100">
                    <LuUserCheck />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {t('admin.verifiedDonors')}
                    </span>
                    <h3 className="text-xl font-extrabold text-secondary mt-0.5">
                      {stats?.verifiedDonors || 0} / {stats?.totalDonors || 0}
                    </h3>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-border shadow-sm flex items-center gap-4">
                  <div className="h-10 w-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center text-lg border border-amber-100">
                    <LuTrophy />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {t('admin.fulfilledRequests')}
                    </span>
                    <h3 className="text-xl font-extrabold text-secondary mt-0.5">
                      {stats?.fulfilledRequests || 0}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Leaderboard & City stats */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Elite Top Donors list */}
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col min-h-80">
                  <div className="flex items-center gap-2 border-b border-border pb-4 mb-4">
                    <LuTrophy className="text-primary text-xl" />
                    <h3 className="font-bold text-secondary text-xs uppercase tracking-wider">
                      {t('admin.eliteDonors')}
                    </h3>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {stats?.topDonors?.length === 0 ? (
                      <div className="text-xs text-muted text-center py-6">{t('admin.noDonors')}</div>
                    ) : (
                      stats?.topDonors?.map((donor, idx) => (
                        <div
                          key={donor._id}
                          className="flex items-center justify-between p-3 rounded-xl border border-border bg-white hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-extrabold text-muted w-4">{idx + 1}.</span>
                            <div className="h-7 w-7 rounded-full bg-secondary text-white font-bold text-xs flex items-center justify-center">
                              {donor.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold text-secondary">
                                {donor.name} ({donor.bloodType})
                              </span>
                              <span className="text-[9px] text-gray-400 font-bold uppercase block mt-0.5">
                                {t('common.city')}: {donor.city} • {t('admin.drs')}: {donor.drsScore}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs font-extrabold text-primary">
                            {donor.totalDonations} {t('requester.donationsSaved')}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* City activity distributions */}
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col min-h-80">
                  <div className="flex items-center gap-2 border-b border-border pb-4 mb-4">
                    <LuActivity className="text-primary text-xl" />
                    <h3 className="font-bold text-secondary text-xs uppercase tracking-wider">
                      {t('admin.topCities')}
                    </h3>
                  </div>

                  <div className="flex flex-col gap-4 justify-center">
                    {stats?.cityStats?.length === 0 ? (
                      <div className="text-xs text-muted text-center py-6">{t('admin.noRequests')}</div>
                    ) : (
                      stats?.cityStats?.map((city, idx) => (
                        <div key={idx} className="flex flex-col gap-1.5 text-xs font-bold">
                          <div className="flex justify-between items-center">
                            <span className="text-secondary capitalize">{city._id}</span>
                            <span className="text-primary">{city.count} {t('admin.activeRequests')}</span>
                          </div>
                          {/* Beautiful CSS bar */}
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{
                                width: `${Math.min(100, (city.count / (stats?.activeRequests + stats?.fulfilledRequests || 1)) * 100)}%`
                              }}
                            ></div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
