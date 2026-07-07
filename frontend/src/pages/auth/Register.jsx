import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
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
      setError(res.message || t('auth.registrationFailed', 'Registration failed'));
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
      setError(res.message || t('auth.googleSignInFailed', 'Google sign-in failed'));
    }
  };

  const handleGoogleButtonClick = () => {
    if (!GOOGLE_CLIENT_ID) {
      setError(t('auth.googleNotConfigured', 'Google Sign-In is not configured. Please add your VITE_GOOGLE_CLIENT_ID.'));
      return;
    }
    if (!window.google) {
      setError(t('auth.googleLoadFailed', 'Google Identity Services failed to load. Please refresh the page.'));
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
    <div className="flex-1 bg-background min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-12 relative overflow-hidden text-white">
      {/* Background blobs */}
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />

      <motion.div 
        className="bg-surface/40 p-8 rounded-3xl border border-white/5 shadow-2xl max-w-lg w-full relative overflow-hidden backdrop-blur-xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-primary-light"></div>

        <div className="flex flex-col items-center text-center mb-8">
          {/* Show Google avatar if coming from Google flow */}
          {isGoogleFlow && googleState.googleAvatar ? (
            <img
              src={googleState.googleAvatar}
              alt={googleState.googleName}
              className="w-16 h-16 rounded-full border-2 border-primary/40 mb-3 shadow-md object-cover"
            />
          ) : (
            <span className="text-4xl mb-3 animate-pulse">🩸</span>
          )}
          <h2 className="text-2xl font-black text-white">
            {isGoogleFlow ? `Welcome, ${googleState.googleName?.split(' ')[0]}!` : t('auth.registerTitle')}
          </h2>
          <p className="text-[10px] text-primary-light font-black uppercase tracking-widest mt-1">
            {isGoogleFlow ? t('auth.completeProfile') : t('auth.registerSubtitle')}
          </p>
        </div>

        {error && (
          <motion.div 
            className="bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold px-4 py-3 rounded-xl mb-6 flex items-center gap-2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            ⚠️ {error}
          </motion.div>
        )}

        {/* ── Google Sign-In Button (only show if NOT already in Google flow) ── */}
        {!isGoogleFlow && (
          <>
            <motion.button
              type="button"
              onClick={handleGoogleButtonClick}
              disabled={googleLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-3 bg-surface border border-white/10 hover:border-white/20 text-white font-extrabold text-xs py-3.5 px-4 rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-60 mb-5 cursor-pointer uppercase tracking-wider"
            >
              {googleLoading ? (
                <svg className="animate-spin h-5 w-5 text-primary-light" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.4 0 6.4 1.2 8.8 3.1l6.6-6.6C35.2 2.5 29.9 0 24 0 14.8 0 6.9 5.4 3 13.3l7.7 6C12.5 13.1 17.8 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8C43.7 37.5 46.5 31.4 46.5 24.5z"/>
                  <path fill="#FBBC05" d="M10.7 28.7A14.6 14.6 0 019.5 24c0-1.6.3-3.2.8-4.7L2.6 13.3A23.8 23.8 0 000 24c0 3.8.9 7.4 2.5 10.6l8.2-5.9z"/>
                  <path fill="#34A853" d="M24 48c6 0 11-2 14.7-5.3l-7.5-5.8c-2 1.3-4.6 2.1-7.2 2.1-6.2 0-11.5-3.6-13.3-9.3l-8 6.1C6.8 42.6 14.8 48 24 48z"/>
                </svg>
              )}
              {googleLoading ? t('auth.googleSigningIn') : t('auth.googleContinue')}
            </motion.button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-white/5"></div>
              <span className="text-[10px] font-black text-muted uppercase tracking-wider">{t('auth.orRegisterWithEmail')}</span>
              <div className="flex-1 h-px bg-white/5"></div>
            </div>
          </>
        )}

        {/* ── Google flow info banner ── */}
        {isGoogleFlow && (
          <div className="bg-primary/10 border border-primary/20 text-primary-light text-xs font-semibold px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
            ✨ {t('auth.googleVerified')}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Role selection */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-muted uppercase tracking-widest">
              {t('auth.role', 'Select Role')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {roles.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, role: r.value }))}
                  className={`px-2 py-3 text-[10px] font-black border rounded-xl transition-all uppercase tracking-wider cursor-pointer ${
                    formData.role === r.value
                      ? 'bg-primary border-primary text-white shadow-md shadow-primary/20'
                      : 'bg-background/40 border-white/5 text-muted hover:bg-background/60 hover:text-white'
                  }`}
                >
                  {r.label.split(' ')[0]} {/* shortened for smaller screens */}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name — hidden in Google flow (auto-filled) */}
            {!isGoogleFlow && (
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest">
                  {t('auth.name', 'Full Name')}
                </label>
                <div className="relative flex items-center">
                  <LuUser className="absolute left-4 text-muted" />
                  <input
                    type="text"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t('auth.namePlaceholder', 'Rahul Sharma')}
                    className="w-full bg-background/50 border border-white/5 focus:border-primary/50 focus:bg-background/80 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold outline-none transition-all text-white placeholder-muted/60"
                  />
                </div>
              </div>
            )}

            {/* Email — read-only in Google flow */}
            {!isGoogleFlow && (
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest">
                  {t('auth.email', 'Email Address')}
                </label>
                <div className="relative flex items-center">
                  <LuMail className="absolute left-4 text-muted" />
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t('auth.emailPlaceholder')}
                    className="w-full bg-background/50 border border-white/5 focus:border-primary/50 focus:bg-background/80 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold outline-none transition-all text-white placeholder-muted/60"
                  />
                </div>
              </div>
            )}

            {/* Password — hidden in Google flow */}
            {!isGoogleFlow && (
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest">
                  {t('auth.password', 'Password')}
                </label>
                <div className="relative flex items-center">
                  <LuLock className="absolute left-4 text-muted" />
                  <input
                    type="password"
                    required
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={t('auth.passwordPlaceholder')}
                    className="w-full bg-background/50 border border-white/5 focus:border-primary/50 focus:bg-background/80 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold outline-none transition-all text-white placeholder-muted/60"
                  />
                </div>
              </div>
            )}

            {/* Phone */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest">
                {t('auth.phone', 'Phone Number')}
              </label>
              <div className="relative flex items-center">
                <LuPhone className="absolute left-4 text-muted" />
                <input
                  type="tel"
                  required={!isGoogleFlow}
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t('auth.phonePlaceholder', '9876543210')}
                  className="w-full bg-background/50 border border-white/5 focus:border-primary/50 focus:bg-background/80 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold outline-none transition-all text-white placeholder-muted/60"
                />
              </div>
            </div>

            {/* City */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest">
                {t('auth.city', 'City')}
              </label>
              <div className="relative flex items-center">
                <LuMapPin className="absolute left-4 text-muted" />
                <input
                  type="text"
                  required
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder={t('auth.cityPlaceholder', 'Mumbai')}
                  className="w-full bg-background/50 border border-white/5 focus:border-primary/50 focus:bg-background/80 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold outline-none transition-all text-white placeholder-muted/60"
                />
              </div>
            </div>

            {/* Blood Type (Donor only) */}
            {formData.role === 'donor' && (
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest">
                  {t('auth.bloodType', 'Blood Type')}
                </label>
                <select
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleChange}
                  className="w-full bg-background/50 border border-white/5 focus:border-primary/50 focus:bg-background/80 rounded-xl px-4 py-3 text-sm font-semibold outline-none transition-all text-white"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                    <option key={type} value={type} className="bg-surface text-white">{type}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-primary hover:bg-primary-light disabled:bg-slate-700 text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
          >
            <LuHeartHandshake className="text-base" />
            {loading ? t('common.loading', 'Loading...') : (isGoogleFlow ? t('auth.completeRegistration') : t('auth.signUp', 'Sign Up'))}
          </motion.button>
        </form>

        <div className="border-t border-white/5 mt-8 pt-6 text-center">
          <Link
            to="/login"
            className="text-xs text-primary-light font-black hover:underline transition-all uppercase tracking-wider"
          >
            {t('auth.hasAccount', 'Already have an account? Login')}
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
