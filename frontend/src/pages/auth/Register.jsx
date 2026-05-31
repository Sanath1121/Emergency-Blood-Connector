import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import { LuUser, LuMail, LuLock, LuPhone, LuMapPin, LuHeartHandshake } from 'react-icons/lu';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Register = () => {
  const { t } = useTranslation();
  const { register, googleLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Pre-fill data passed from Login via Google One-Tap for new users
  const [googleState, setGoogleState] = useState(location.state || {});
  const isGoogleFlow = !!googleState.googleCredential;

  const [formData, setFormData] = useState({
    name: googleState.googleName || '',
    email: googleState.googleEmail || '',
    password: '',
    role: 'donor',
    bloodType: 'O+',
    city: '',
    phone: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let res;

    if (isGoogleFlow) {
      // Complete Google registration with role/city onboarding data
      res = await googleLogin(googleState.googleCredential, {
        role: formData.role,
        city: formData.city,
        phone: formData.phone,
        bloodType: formData.role === 'donor' ? formData.bloodType : undefined
      });
    } else {
      res = await register(formData);
    }

    setLoading(false);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message || 'Registration failed');
    }
  };

  const handleGoogleCredentialResponse = async (response) => {
    setGoogleLoading(true);
    setError('');
    const res = await googleLogin(response.credential);
    setGoogleLoading(false);
    if (res.success) {
      navigate('/dashboard');
    } else if (res.requiresOnboarding) {
      // Stay on register page but pre-fill Google data
      const onboardingState = {
        googleCredential: response.credential,
        googleName: res.googleName || googleState.googleName,
        googleEmail: res.googleEmail || googleState.googleEmail,
        googleAvatar: res.googleAvatar || googleState.googleAvatar
      };

      setGoogleState(onboardingState);
      setFormData(prev => ({
        ...prev,
        name: onboardingState.googleName || prev.name,
        email: onboardingState.googleEmail || prev.email
      }));
      setError('');
    } else {
      setError(res.message || 'Google sign-in failed');
    }
  };

  const handleGoogleButtonClick = () => {
    if (!GOOGLE_CLIENT_ID) {
      setError('Google Sign-In is not configured. Please add your VITE_GOOGLE_CLIENT_ID.');
      return;
    }
    if (!window.google) {
      setError('Google Identity Services failed to load. Please refresh the page.');
      return;
    }
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredentialResponse,
    });
    const tempDiv = document.createElement('div');
    document.body.appendChild(tempDiv);
    window.google.accounts.id.renderButton(tempDiv, { type: 'standard', size: 'large' });
    tempDiv.querySelector('div[role="button"]')?.click();
    setTimeout(() => document.body.removeChild(tempDiv), 500);
  };

  const roles = [
    { value: 'donor', label: 'Blood Donor' },
    { value: 'requester', label: 'Patient / Requester' },
    { value: 'hospital', label: 'Hospital Coordinator' }
  ];

  return (
    <div className="flex-1 bg-background min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-12">
      <div className="bg-white p-8 rounded-3xl border border-border shadow-2xl max-w-lg w-full relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-primary to-primary-light"></div>

        <div className="flex flex-col items-center text-center mb-8">
          {/* Show Google avatar if coming from Google flow */}
          {isGoogleFlow && googleState.googleAvatar ? (
            <img
              src={googleState.googleAvatar}
              alt={googleState.googleName}
              className="w-14 h-14 rounded-full border-2 border-primary/20 mb-3 shadow-md"
            />
          ) : (
            <span className="text-4xl mb-3 animate-pulse">🩸</span>
          )}
          <h2 className="text-2xl font-bold text-secondary">
            {isGoogleFlow ? `Welcome, ${googleState.googleName?.split(' ')[0]}!` : 'Join BloodBridge Network'}
          </h2>
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1">
            {isGoogleFlow ? 'Complete your profile to continue' : 'Create account and connect instantly'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-primary border border-red-100 text-xs font-semibold px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
            ⚠️ {error}
          </div>
        )}

        {/* ── Google Sign-In Button (only show if NOT already in Google flow) ── */}
        {!isGoogleFlow && (
          <>
            <button
              type="button"
              onClick={handleGoogleButtonClick}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-sm py-3 px-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-60 mb-5"
            >
              {googleLoading ? (
                <svg className="animate-spin h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.4 0 6.4 1.2 8.8 3.1l6.6-6.6C35.2 2.5 29.9 0 24 0 14.8 0 6.9 5.4 3 13.3l7.7 6C12.5 13.1 17.8 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8C43.7 37.5 46.5 31.4 46.5 24.5z"/>
                  <path fill="#FBBC05" d="M10.7 28.7A14.6 14.6 0 019.5 24c0-1.6.3-3.2.8-4.7L2.6 13.3A23.8 23.8 0 000 24c0 3.8.9 7.4 2.5 10.6l8.2-5.9z"/>
                  <path fill="#34A853" d="M24 48c6 0 11-2 14.7-5.3l-7.5-5.8c-2 1.3-4.6 2.1-7.2 2.1-6.2 0-11.5-3.6-13.3-9.3l-8 6.1C6.8 42.6 14.8 48 24 48z"/>
                </svg>
              )}
              {googleLoading ? 'Signing up with Google...' : 'Continue with Google'}
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-gray-100"></div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Or register with email</span>
              <div className="flex-1 h-px bg-gray-100"></div>
            </div>
          </>
        )}

        {/* ── Google flow info banner ── */}
        {isGoogleFlow && (
          <div className="bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
            ✅ Google account verified — just select your role and city to get started!
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Role selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-secondary uppercase tracking-wider">
              {t('auth.role', 'Select Role')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {roles.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, role: r.value }))}
                  className={`px-3 py-2 text-xs font-bold border rounded-xl transition-all ${
                    formData.role === r.value
                      ? 'bg-primary border-primary text-white shadow-sm shadow-red-500/10'
                      : 'bg-gray-50 border-border text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name — hidden in Google flow (auto-filled) */}
            {!isGoogleFlow && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-secondary uppercase tracking-wider">
                  {t('auth.name', 'Full Name')}
                </label>
                <div className="relative flex items-center">
                  <LuUser className="absolute left-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Rahul Sharma"
                    className="w-full bg-gray-50 border border-border focus:border-primary focus:bg-white rounded-xl pl-11 pr-4 py-2.5 text-sm font-medium outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email — read-only in Google flow */}
            {!isGoogleFlow && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-secondary uppercase tracking-wider">
                  {t('auth.email', 'Email Address')}
                </label>
                <div className="relative flex items-center">
                  <LuMail className="absolute left-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="rahul@example.com"
                    className="w-full bg-gray-50 border border-border focus:border-primary focus:bg-white rounded-xl pl-11 pr-4 py-2.5 text-sm font-medium outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* Password — hidden in Google flow */}
            {!isGoogleFlow && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-secondary uppercase tracking-wider">
                  {t('auth.password', 'Password')}
                </label>
                <div className="relative flex items-center">
                  <LuLock className="absolute left-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border border-border focus:border-primary focus:bg-white rounded-xl pl-11 pr-4 py-2.5 text-sm font-medium outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-secondary uppercase tracking-wider">
                {t('auth.phone', 'Phone Number')}
              </label>
              <div className="relative flex items-center">
                <LuPhone className="absolute left-4 text-gray-400" />
                <input
                  type="tel"
                  required={!isGoogleFlow}
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className="w-full bg-gray-50 border border-border focus:border-primary focus:bg-white rounded-xl pl-11 pr-4 py-2.5 text-sm font-medium outline-none transition-all"
                />
              </div>
            </div>

            {/* City */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-secondary uppercase tracking-wider">
                {t('auth.city', 'City')}
              </label>
              <div className="relative flex items-center">
                <LuMapPin className="absolute left-4 text-gray-400" />
                <input
                  type="text"
                  required
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Mumbai"
                  className="w-full bg-gray-50 border border-border focus:border-primary focus:bg-white rounded-xl pl-11 pr-4 py-2.5 text-sm font-medium outline-none transition-all"
                />
              </div>
            </div>

            {/* Blood Type (Donor only) */}
            {formData.role === 'donor' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-secondary uppercase tracking-wider">
                  {t('auth.bloodType', 'Blood Type')}
                </label>
                <select
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-border focus:border-primary focus:bg-white rounded-xl px-4 py-2.5 text-sm font-semibold outline-none transition-all"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-light disabled:bg-gray-400 text-white font-bold uppercase tracking-wider text-xs py-4 rounded-xl shadow-lg shadow-red-500/10 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
          >
            <LuHeartHandshake className="text-base" />
            {loading ? t('common.loading', 'Loading...') : (isGoogleFlow ? 'Complete Registration' : t('auth.signUp', 'Sign Up'))}
          </button>
        </form>

        <div className="border-t border-border mt-8 pt-6 text-center">
          <Link
            to="/login"
            className="text-xs text-primary font-bold hover:underline transition-all"
          >
            {t('auth.hasAccount', 'Already have an account? Login')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
