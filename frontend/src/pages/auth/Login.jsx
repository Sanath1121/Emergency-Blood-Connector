import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import { LuMail, LuLock, LuHeartHandshake } from 'react-icons/lu';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Login = () => {
  const { t } = useTranslation();
  const { login, googleLogin, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated]);

  // Initialize Google One-Tap for returning users
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !window.google) return;
    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredentialResponse,
        auto_select: true,        // One-Tap for returning users
        cancel_on_tap_outside: false
      });
      window.google.accounts.id.prompt(); // Show One-Tap if eligible
    } catch (err) {
      console.warn('Google One-Tap init error:', err);
    }
  }, []);

  const handleGoogleCredentialResponse = async (response) => {
    setGoogleLoading(true);
    setError('');
    const res = await googleLogin(response.credential);
    setGoogleLoading(false);
    if (res.success) {
      navigate('/dashboard');
    } else if (res.requiresOnboarding) {
      // New user — redirect to register with Google pre-fill
      navigate('/register', {
        state: {
          googleCredential: response.credential,
          googleName: res.googleName,
          googleEmail: res.googleEmail,
          googleAvatar: res.googleAvatar
        }
      });
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
    // Trigger Google's sign-in popup
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredentialResponse,
    });
    window.google.accounts.oauth2 && window.google.accounts.id.prompt();

    // Fallback: use renderButton popup approach via hidden div
    const tempDiv = document.createElement('div');
    document.body.appendChild(tempDiv);
    window.google.accounts.id.renderButton(tempDiv, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
    });
    tempDiv.querySelector('div[role="button"]')?.click();
    setTimeout(() => document.body.removeChild(tempDiv), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message || t('auth.loginFailed', 'Login failed'));
    }
  };

  return (
    <div className="flex-1 bg-background min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-12">
      <div className="bg-white p-8 rounded-3xl border border-border shadow-2xl max-w-md w-full relative overflow-hidden">
        {/* Accent Top Border */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-primary-light"></div>

        <div className="flex flex-col items-center text-center mb-8">
          <span className="text-4xl mb-3 animate-pulse">🩸</span>
          <h2 className="text-2xl font-bold text-secondary">{t('auth.loginTitle')}</h2>
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1">{t('auth.loginSubtitle')}</p>
        </div>

        {error && (
          <div className="bg-red-50 text-primary border border-red-100 text-xs font-semibold px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
            ⚠️ {error}
          </div>
        )}

        {/* ── Google Sign-In Button ── */}
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
              {googleLoading ? t('auth.googleSigningIn') : t('auth.googleContinue')}
        </button>

        {/* ── Divider ── */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-gray-100"></div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('auth.orSignInWithEmail')}</span>
          <div className="flex-1 h-px bg-gray-100"></div>
        </div>

        {/* ── Standard Login Form ── */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-secondary uppercase tracking-wider">
              {t('auth.email', 'Email Address')}
            </label>
            <div className="relative flex items-center">
              <LuMail className="absolute left-4 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.emailPlaceholder')}
                className="w-full bg-gray-50 border border-border focus:border-primary focus:bg-white rounded-xl pl-11 pr-4 py-3 text-sm font-medium outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-secondary uppercase tracking-wider">
              {t('auth.password', 'Password')}
            </label>
            <div className="relative flex items-center">
              <LuLock className="absolute left-4 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder')}
                className="w-full bg-gray-50 border border-border focus:border-primary focus:bg-white rounded-xl pl-11 pr-4 py-3 text-sm font-medium outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-light disabled:bg-gray-400 text-white font-bold uppercase tracking-wider text-xs py-4 rounded-xl shadow-lg shadow-red-500/10 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
          >
            <LuHeartHandshake className="text-base" />
            {loading ? t('common.loading', 'Loading...') : t('auth.signIn', 'Sign In')}
          </button>
        </form>

        <div className="border-t border-border mt-8 pt-6 text-center">
          <Link
            to="/register"
            className="text-xs text-primary font-bold hover:underline transition-all"
          >
            {t('auth.noAccount', "Don't have an account? Register")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
