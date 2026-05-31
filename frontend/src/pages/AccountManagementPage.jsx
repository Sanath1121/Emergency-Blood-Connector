import React, { useState, useContext, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { LuLock, LuShield, LuCheck, LuInfo, LuUser, LuMail } from 'react-icons/lu';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Lightweight JWT decoder (no verification — frontend only)
const decodeJwt = (token) => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

const AccountManagementPage = () => {
  const { user, updateUserProfile } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('password'); // 'password' | 'google'
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: string }
  const [loading, setLoading] = useState(false);
  const [googleVerified, setGoogleVerified] = useState(false);
  const [pendingGoogleCredential, setPendingGoogleCredential] = useState(null);

  const isGoogleOnly = user?.isGoogleUser && !user?.hasPasswordSet;

  // Auto-switch to Google tab if user hasn't set a password yet
  useEffect(() => {
    if (isGoogleOnly) setActiveTab('google');
  }, [isGoogleOnly]);

  const handleGoogleVerification = (response) => {
    const credential = response.credential;
    const payload = decodeJwt(credential);

    if (!payload) {
      setStatus({ type: 'error', message: 'Failed to decode Google credential. Please try again.' });
      return;
    }

    // ── Frontend Layer: Email mismatch check ──
    if (payload.email?.toLowerCase() !== user?.email?.toLowerCase()) {
      setStatus({
        type: 'error',
        message: `Verification failed: Verified Google email (${payload.email}) does not match your registered account email (${user?.email}).`
      });
      setGoogleVerified(false);
      setPendingGoogleCredential(null);
      return;
    }

    setGoogleVerified(true);
    setPendingGoogleCredential(credential);
    setStatus({ type: 'success', message: `✅ Google identity verified as ${payload.email}` });
  };

  const triggerGoogleVerification = () => {
    if (!GOOGLE_CLIENT_ID) {
      setStatus({ type: 'error', message: 'Google Sign-In is not configured. Please add your VITE_GOOGLE_CLIENT_ID.' });
      return;
    }
    if (!window.google) {
      setStatus({ type: 'error', message: 'Google Identity Services failed to load. Please refresh the page.' });
      return;
    }

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleVerification,
    });

    // Render a hidden button and click it to trigger the popup
    const tempDiv = document.createElement('div');
    tempDiv.style.display = 'none';
    document.body.appendChild(tempDiv);
    window.google.accounts.id.renderButton(tempDiv, { type: 'standard', size: 'large' });
    tempDiv.querySelector('div[role="button"]')?.click();
    setTimeout(() => document.body.removeChild(tempDiv), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', message: 'New passwords do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setStatus({ type: 'error', message: 'Password must be at least 6 characters.' });
      return;
    }

    if (activeTab === 'google' && !googleVerified) {
      setStatus({ type: 'error', message: 'Please verify your identity with Google first.' });
      return;
    }

    setLoading(true);
    try {
      const payload = activeTab === 'google'
        ? { googleCredential: pendingGoogleCredential, newPassword }
        : { currentPassword, newPassword };

      const res = await api.put('/auth/change-password', payload);

      if (res.data.success) {
        setStatus({ type: 'success', message: '🔐 Password updated successfully! You can now sign in with email + password.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setGoogleVerified(false);
        setPendingGoogleCredential(null);
        // Refresh user context so hasPasswordSet updates
        const meRes = await api.get('/auth/me');
        if (meRes.data.success) updateUserProfile(meRes.data.data);
      } else {
        setStatus({ type: 'error', message: res.data.message || 'Failed to update password.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'An error occurred. Please try again.' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center px-4 py-10">
      <div className="w-full max-w-xl">

        {/* ── Header Card ── */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 mb-5 flex items-center gap-4">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-full border-2 border-primary/20 shadow" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
              <LuUser className="text-primary text-2xl" />
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-secondary">{user?.name}</h1>
            <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
              <LuMail className="text-gray-400" /> {user?.email}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              {user?.isGoogleUser && (
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-100">
                  <svg width="10" height="10" viewBox="0 0 48 48" className="inline">
                    <path fill="#EA4335" d="M24 9.5c3.4 0 6.4 1.2 8.8 3.1l6.6-6.6C35.2 2.5 29.9 0 24 0 14.8 0 6.9 5.4 3 13.3l7.7 6C12.5 13.1 17.8 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8C43.7 37.5 46.5 31.4 46.5 24.5z"/>
                    <path fill="#FBBC05" d="M10.7 28.7A14.6 14.6 0 019.5 24c0-1.6.3-3.2.8-4.7L2.6 13.3A23.8 23.8 0 000 24c0 3.8.9 7.4 2.5 10.6l8.2-5.9z"/>
                    <path fill="#34A853" d="M24 48c6 0 11-2 14.7-5.3l-7.5-5.8c-2 1.3-4.6 2.1-7.2 2.1-6.2 0-11.5-3.6-13.3-9.3l-8 6.1C6.8 42.6 14.8 48 24 48z"/>
                  </svg>
                  Google Linked
                </span>
              )}
              {!user?.hasPasswordSet && (
                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-100">
                  ⚠️ No Password Set
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Password & Security Card ── */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-border">
            <h2 className="text-base font-bold text-secondary flex items-center gap-2">
              <LuShield className="text-primary" />
              Password & Security
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              {isGoogleOnly
                ? 'Set your first password by verifying your Google account below.'
                : 'Update your password using your current password or verify via Google.'}
            </p>
          </div>

          {/* ── Verification Method Tabs ── */}
          {!isGoogleOnly && (
            <div className="flex border-b border-border">
              <button
                onClick={() => { setActiveTab('password'); setStatus(null); setGoogleVerified(false); }}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === 'password'
                    ? 'text-primary border-b-2 border-primary bg-red-50/50'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                🔑 Verify via Password
              </button>
              <button
                onClick={() => { setActiveTab('google'); setStatus(null); }}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === 'google'
                    ? 'text-blue-600 border-b-2 border-blue-500 bg-blue-50/50'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                🔵 Verify via Google
              </button>
            </div>
          )}

          {/* ── Google-only banner ── */}
          {isGoogleOnly && (
            <div className="mx-6 mt-5 bg-amber-50 border border-amber-100 text-amber-800 text-xs font-semibold px-4 py-3 rounded-xl flex items-start gap-2">
              <span className="text-lg leading-none">💡</span>
              <span>
                Your account was created via Google and does not have a password yet.
                Verify your Google account below to set your first password — after which you can sign in with either method.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">

            {/* ── Tab A: Verify via Current Password ── */}
            {activeTab === 'password' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-secondary uppercase tracking-wider">
                  Current Password
                </label>
                <div className="relative flex items-center">
                  <LuLock className="absolute left-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Your current password"
                    className="w-full bg-gray-50 border border-border focus:border-primary focus:bg-white rounded-xl pl-11 pr-4 py-3 text-sm font-medium outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* ── Tab B: Verify via Google ── */}
            {activeTab === 'google' && (
              <div className="flex flex-col gap-3">
                <label className="text-xs font-bold text-secondary uppercase tracking-wider">
                  Google Identity Verification
                </label>

                {!googleVerified ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-3">
                      Click the button below to open a Google sign-in popup and verify your identity.
                      You must sign in as <strong>{user?.email}</strong>.
                    </p>
                    <button
                      type="button"
                      onClick={triggerGoogleVerification}
                      className="inline-flex items-center gap-2 bg-white border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 font-semibold text-sm px-5 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <svg width="18" height="18" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.4 0 6.4 1.2 8.8 3.1l6.6-6.6C35.2 2.5 29.9 0 24 0 14.8 0 6.9 5.4 3 13.3l7.7 6C12.5 13.1 17.8 9.5 24 9.5z"/>
                        <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8C43.7 37.5 46.5 31.4 46.5 24.5z"/>
                        <path fill="#FBBC05" d="M10.7 28.7A14.6 14.6 0 019.5 24c0-1.6.3-3.2.8-4.7L2.6 13.3A23.8 23.8 0 000 24c0 3.8.9 7.4 2.5 10.6l8.2-5.9z"/>
                        <path fill="#34A853" d="M24 48c6 0 11-2 14.7-5.3l-7.5-5.8c-2 1.3-4.6 2.1-7.2 2.1-6.2 0-11.5-3.6-13.3-9.3l-8 6.1C6.8 42.6 14.8 48 24 48z"/>
                      </svg>
                      Verify with Google Account
                    </button>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2">
                    <LuCheck className="text-lg flex-shrink-0" />
                    Identity verified via Google — enter your new password below.
                  </div>
                )}
              </div>
            )}

            {/* ── New Password ── */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-secondary uppercase tracking-wider">
                New Password
              </label>
              <div className="relative flex items-center">
                <LuLock className="absolute left-4 text-gray-400" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-gray-50 border border-border focus:border-primary focus:bg-white rounded-xl pl-11 pr-4 py-3 text-sm font-medium outline-none transition-all"
                />
              </div>
            </div>

            {/* ── Confirm Password ── */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-secondary uppercase tracking-wider">
                Confirm New Password
              </label>
              <div className="relative flex items-center">
                <LuLock className="absolute left-4 text-gray-400" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className={`w-full bg-gray-50 border focus:bg-white rounded-xl pl-11 pr-4 py-3 text-sm font-medium outline-none transition-all ${
                    confirmPassword && newPassword !== confirmPassword
                      ? 'border-red-300 focus:border-red-400'
                      : 'border-border focus:border-primary'
                  }`}
                />
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-[10px] text-red-500 font-semibold">Passwords do not match</p>
              )}
            </div>

            {/* ── Status Feedback ── */}
            {status && (
              <div className={`flex items-start gap-2 text-xs font-semibold px-4 py-3 rounded-xl border ${
                status.type === 'success'
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-red-50 text-red-600 border-red-100'
              }`}>
                {status.type === 'success' ? <LuCheck className="text-base flex-shrink-0 mt-0.5" /> : <LuInfo className="text-base flex-shrink-0 mt-0.5" />}
                {status.message}
              </div>
            )}

            {/* ── Submit Button ── */}
            <button
              type="submit"
              disabled={loading || (activeTab === 'google' && !googleVerified)}
              className="w-full bg-primary hover:bg-primary-light disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold uppercase tracking-wider text-xs py-4 rounded-xl shadow-lg shadow-red-500/10 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 mt-1"
            >
              <LuShield className="text-base" />
              {loading ? 'Updating Password...' : (isGoogleOnly ? 'Set My Password' : 'Update Password')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AccountManagementPage;
