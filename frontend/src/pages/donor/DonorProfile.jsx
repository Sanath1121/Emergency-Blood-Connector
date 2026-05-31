import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import api from '../../services/api';
import { LuUser, LuMapPin, LuPhone, LuHistory, LuSettings, LuCheck } from 'react-icons/lu';

const DonorProfile = () => {
  const { t } = useTranslation();
  const { user, updateUserProfile } = useContext(AuthContext);
  const { addToast } = useContext(NotificationContext);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    city: user?.city || '',
    phone: user?.phone || '',
    showOnLeaderboard: user?.showOnLeaderboard || false
  });

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [togglingAvailability, setTogglingAvailability] = useState(false);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get('/donors/my/history');
      if (res.data.success) {
        setHistory(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching donation history:', error);
    }
    setLoadingHistory(false);
  };

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        city: user.city || '',
        phone: user.phone || '',
        showOnLeaderboard: user.showOnLeaderboard || false
      });
      fetchHistory();
    }
  }, [user]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: value
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const res = await api.put('/donors/profile', formData);
      if (res.data.success) {
        updateUserProfile(res.data.data);
        addToast('✅ Success', 'Profile updated successfully!', 'general');
      }
    } catch (error) {
      addToast('❌ Error', error.response?.data?.message || 'Profile update failed', 'sos_alert');
    }
    setUpdatingProfile(false);
  };

  const handleToggleAvailability = async () => {
    if (user?.availability === 'on_cooldown') {
      addToast('⏳ Cooldown Active', 'You cannot change availability during active cooldown!', 'sos_alert');
      return;
    }

    setTogglingAvailability(true);
    try {
      const res = await api.put('/donors/availability');
      if (res.data.success) {
        updateUserProfile({ ...user, availability: res.data.data.availability });
        addToast('🟢 Success', `Status changed to ${res.data.data.availability}!`, 'general');
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
    }
    setTogglingAvailability(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 max-w-6xl mx-auto flex flex-col gap-6">
          <h2 className="text-xl font-bold text-secondary flex items-center gap-2">👤 {t('donor.profileTitle', 'My Donor Profile')}</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left side settings & Availability */}
            <div className="flex flex-col gap-6 lg:col-span-1">
              {/* Profile Card Summary */}
              <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-secondary text-white font-bold text-2xl flex items-center justify-center border-4 border-red-50 shadow-md">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <h3 className="font-extrabold text-secondary text-lg mt-4">{user?.name}</h3>
                <span className="text-xs font-bold text-primary bg-red-50 px-2 py-0.5 border border-red-100 rounded-md mt-1 uppercase tracking-wider">
                  Blood Group: {user?.bloodType}
                </span>

                <div className="w-full border-t border-border mt-6 pt-6 flex flex-col gap-4">
                  {/* Availability Toggle Switch */}
                  <div className="flex justify-between items-center">
                    <div className="text-left">
                      <span className="text-xs font-bold text-secondary uppercase tracking-wider block">
                        {t('donor.availabilityStatus', 'Availability Status')}
                      </span>
                      <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">
                        {t('donor.availabilityHelp', 'Can coordinate emergency needs')}
                      </span>
                    </div>

                    <button
                      onClick={handleToggleAvailability}
                      disabled={user?.availability === 'on_cooldown' || togglingAvailability}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors outline-none focus:ring-2 focus:ring-primary/20 ${
                        user?.availability === 'available' ? 'bg-success' : 'bg-gray-200'
                      } ${user?.availability === 'on_cooldown' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          user?.availability === 'available' ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="bg-gray-50 border border-border p-3 rounded-xl flex items-center justify-between text-xs font-semibold text-left">
                    <span className="text-gray-500">{t('donor.currentState', 'Current State')}</span>
                    <span
                      className={`font-bold ${
                        user?.availability === 'available'
                          ? 'text-success'
                          : user?.availability === 'on_cooldown'
                          ? 'text-orange-500'
                          : 'text-gray-400'
                      }`}
                    >
                      {user?.availability === 'available'
                        ? t('donor.available')
                        : user?.availability === 'on_cooldown'
                        ? t('donor.onCooldown')
                        : t('donor.unavailable')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Edit Details form */}
              <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col">
                <div className="flex items-center gap-2 border-b border-border pb-3 mb-4">
                  <LuSettings className="text-primary text-lg" />
                    <h3 className="font-bold text-secondary text-xs uppercase tracking-wider">{t('donor.editProfileDetails', 'Edit Profile Details')}</h3>
                </div>

                <form onSubmit={handleUpdate} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {t('auth.name')}
                    </label>
                    <div className="relative flex items-center">
                      <LuUser className="absolute left-3.5 text-gray-400 text-sm" />
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-gray-50 border border-border focus:border-primary focus:bg-white rounded-xl pl-10 pr-3 py-2 text-xs font-semibold outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {t('auth.city')}
                    </label>
                    <div className="relative flex items-center">
                      <LuMapPin className="absolute left-3.5 text-gray-400 text-sm" />
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full bg-gray-50 border border-border focus:border-primary focus:bg-white rounded-xl pl-10 pr-3 py-2 text-xs font-semibold outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {t('auth.phone')}
                    </label>
                    <div className="relative flex items-center">
                      <LuPhone className="absolute left-3.5 text-gray-400 text-sm" />
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full bg-gray-50 border border-border focus:border-primary focus:bg-white rounded-xl pl-10 pr-3 py-2 text-xs font-semibold outline-none transition-all"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer mt-1">
                    <input
                      type="checkbox"
                      name="showOnLeaderboard"
                      checked={formData.showOnLeaderboard}
                      onChange={handleChange}
                      className="accent-primary rounded h-4 w-4 border-border"
                    />
                    <span className="text-[11px] font-semibold text-secondary">
                      {t('donor.optInLeaderboard', 'Opt-in on City Leaderboard')}
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={updatingProfile}
                    className="w-full bg-primary hover:bg-primary-light disabled:bg-gray-400 text-white font-bold uppercase tracking-wider text-[10px] py-3 rounded-xl shadow-md transition-all mt-2 transform active:scale-95"
                  >
                    {updatingProfile ? t('common.loading') : t('donor.saveProfileSettings', 'Save Profile Settings')}
                  </button>
                </form>
              </div>
            </div>

            {/* Right side history log */}
            <div className="bg-white p-6 rounded-2xl border border-border shadow-sm lg:col-span-2 flex flex-col">
              <div className="flex items-center gap-2 border-b border-border pb-4 mb-4">
                <LuHistory className="text-primary text-lg" />
                <h3 className="font-bold text-secondary text-xs uppercase tracking-wider">
                  {t('donor.historyTitle', 'Donation Activity History Log')}
                </h3>
              </div>

              {loadingHistory ? (
                <div className="p-8 text-center text-xs text-muted">
                  {t('donor.loadingHistory', 'Loading donation history...')}
                </div>
              ) : history.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50 border border-dashed border-border rounded-xl min-h-60">
                  <span className="text-4xl mb-3 animate-pulse">🩸</span>
                  <h4 className="font-bold text-secondary text-sm">{t('donor.noHistoryTitle', 'No Donation History Yet')}</h4>
                  <p className="text-xs text-gray-500 max-w-xs mt-1 leading-relaxed">
                    {t('donor.noHistoryDescription', 'Once you accept a blood request, show up, and the requester confirms your donation, it will show up in this permanent log!')}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border bg-gray-50 font-bold text-gray-400 uppercase tracking-widest text-[9px]">
                        <th className="p-3">{t('donor.date', 'Date')}</th>
                        <th className="p-3">{t('request.patient')}</th>
                        <th className="p-3">{t('request.hospital')}</th>
                        <th className="p-3">{t('donor.drsImpact', 'DRS Impact')}</th>
                        <th className="p-3">{t('donor.outcome', 'Outcome')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((record) => (
                        <tr key={record._id} className="border-b border-border hover:bg-gray-50">
                          <td className="p-3 whitespace-nowrap font-medium">
                            {new Date(record.donatedAt).toLocaleDateString()}
                          </td>
                          <td className="p-3 whitespace-nowrap font-bold text-secondary">
                            {record.request?.patientName} ({record.request?.bloodType})
                          </td>
                          <td className="p-3 whitespace-nowrap text-gray-500">
                            {record.request?.hospitalName}, {record.request?.city}
                          </td>
                          <td className="p-3 whitespace-nowrap font-extrabold">
                            <span
                              className={
                                record.drsChange >= 0 ? 'text-success' : 'text-primary'
                              }
                            >
                              {record.drsChange >= 0 ? `+${record.drsChange}` : record.drsChange}
                            </span>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                record.outcome === 'donated'
                                  ? 'bg-green-50 border border-green-200 text-success'
                                  : 'bg-red-50 border border-red-200 text-primary'
                              }`}
                            >
                              {record.outcome === 'donated' ? 'Donated' : record.outcome.replace('_', ' ')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DonorProfile;
