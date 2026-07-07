import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
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
    <div className="flex-1 bg-background min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-12 relative overflow-hidden text-white">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
      
      <motion.div 
        className="bg-surface/40 p-8 rounded-3xl border border-white/5 shadow-2xl max-w-md w-full relative overflow-hidden backdrop-blur-xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Accent Top Border */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-primary-light"></div>

        <div className="flex flex-col items-center text-center mb-8">
          <span className="text-4xl mb-3 animate-pulse">🩸</span>
          <h2 className="text-2xl font-black text-white">{t('auth.loginTitle')}</h2>
          <p className="text-[10px] text-primary-light font-black uppercase tracking-widest mt-1">{t('auth.loginSubtitle')}</p>
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

        {/* ── Google Sign-In Button ── */}
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

        {/* ── Divider ── */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-white/5"></div>
          <span className="text-[10px] font-black text-muted uppercase tracking-wider">{t('auth.orSignInWithEmail')}</span>
          <div className="flex-1 h-px bg-white/5"></div>
        </div>

        {/* ── Standard Login Form ── */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-muted uppercase tracking-widest">
              {t('auth.email', 'Email Address')}
            </label>
            <div className="relative flex items-center">
              <LuMail className="absolute left-4 text-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.emailPlaceholder')}
                className="w-full bg-background/50 border border-white/5 focus:border-primary/50 focus:bg-background/80 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold outline-none transition-all text-white placeholder-muted/60"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-muted uppercase tracking-widest">
              {t('auth.password', 'Password')}
            </label>
            <div className="relative flex items-center">
              <LuLock className="absolute left-4 text-muted" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder')}
                className="w-full bg-background/50 border border-white/5 focus:border-primary/50 focus:bg-background/80 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold outline-none transition-all text-white placeholder-muted/60"
              />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-primary hover:bg-primary-light disabled:bg-slate-700 text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            <LuHeartHandshake className="text-base" />
            {loading ? t('common.loading', 'Loading...') : t('auth.signIn', 'Sign In')}
          </motion.button>
        </form>

        <div className="border-t border-white/5 mt-8 pt-6 text-center">
          <Link
            to="/register"
            className="text-xs text-primary-light font-black hover:underline transition-all uppercase tracking-wider"
          >
            {t('auth.noAccount', "Don't have an account? Register")}
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
