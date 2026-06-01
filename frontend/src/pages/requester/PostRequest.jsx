import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import api from '../../services/api';
import { LuPlus, LuUser, LuHospital, LuMapPin, LuHeartPulse } from 'react-icons/lu';

const PostRequest = () => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const { addToast } = useContext(NotificationContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    patientName: '',
    bloodType: 'O+',
    unitsRequired: 1,
    hospitalName: '',
    city: user?.city || '',
    urgency: 'moderate'
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/requests', formData);
      if (res.data.success) {
        addToast(
          t('requester.requestCreatedTitle'),
          t('requester.requestCreatedMessage', { patientName: formData.patientName }),
          'general'
        );
        navigate('/dashboard');
      }
    } catch (error) {
      addToast(t('requester.requestFailed'), error.response?.data?.message || t('requester.requestFailed', 'Failed to create request'), 'sos_alert');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 max-w-2xl mx-auto flex flex-col gap-6">
          <div className="bg-white p-8 rounded-3xl border border-border shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-primary-light"></div>

            <div className="flex items-center gap-3 border-b border-border pb-4 mb-6">
              <LuPlus className="text-primary text-2xl" />
              <h2 className="text-xl font-bold text-secondary">
                {t('requester.postTitle')}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Patient Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-secondary uppercase tracking-wider">
                  {t('requester.patientName')}
                </label>
                <div className="relative flex items-center">
                  <LuUser className="absolute left-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleChange}
                    placeholder={t('requester.patientPlaceholder', 'Ramesh Roy')}
                    className="w-full bg-gray-50 border border-border focus:border-primary focus:bg-white rounded-xl pl-11 pr-4 py-2.5 text-sm font-semibold outline-none transition-all"
                  />
                </div>
              </div>

              {/* Grid: Blood Type & Units */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-secondary uppercase tracking-wider">
                    {t('request.bloodType', 'Blood Type Required')}
                  </label>
                  <select
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-border focus:border-primary focus:bg-white rounded-xl px-4 py-2.5 text-sm font-bold outline-none transition-all"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-secondary uppercase tracking-wider">
                    {t('requester.unitsRequired')}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    name="unitsRequired"
                    value={formData.unitsRequired}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-border focus:border-primary focus:bg-white rounded-xl px-4 py-2.5 text-sm font-bold outline-none transition-all"
                  />
                </div>
              </div>

              {/* Hospital Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-secondary uppercase tracking-wider">
                  {t('requester.hospitalName')}
                </label>
                <div className="relative flex items-center">
                  <LuHospital className="absolute left-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    name="hospitalName"
                    value={formData.hospitalName}
                    onChange={handleChange}
                    placeholder={t('requester.hospitalPlaceholder', 'Lilavati Hospital')}
                    className="w-full bg-gray-50 border border-border focus:border-primary focus:bg-white rounded-xl pl-11 pr-4 py-2.5 text-sm font-semibold outline-none transition-all"
                  />
                </div>
              </div>

              {/* Grid: City & Urgency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-secondary uppercase tracking-wider">
                    {t('request.city', 'City')}
                  </label>
                  <div className="relative flex items-center">
                    <LuMapPin className="absolute left-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder={t('auth.cityPlaceholder', 'Mumbai')}
                      className="w-full bg-gray-50 border border-border focus:border-primary focus:bg-white rounded-xl pl-11 pr-4 py-2.5 text-sm font-semibold outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-secondary uppercase tracking-wider">
                    {t('request.urgency', 'Urgency Level')}
                  </label>
                  <select
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-border focus:border-primary focus:bg-white rounded-xl px-4 py-2.5 text-sm font-bold outline-none transition-all"
                  >
                    <option value="critical">{t('requester.urgencyCritical')}</option>
                    <option value="moderate">{t('requester.urgencyModerate')}</option>
                    <option value="planned">{t('requester.urgencyPlanned')}</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-light disabled:bg-gray-400 text-white font-bold uppercase tracking-wider text-xs py-4 rounded-xl shadow-lg shadow-red-500/10 transition-all mt-4 transform active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <LuHeartPulse className="text-base" />
                {loading ? t('requester.creating') : t('requester.publish')}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PostRequest;
