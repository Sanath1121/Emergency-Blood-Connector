import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import { LuHeart, LuActivity, LuShieldCheck, LuSparkles } from 'react-icons/lu';

const Home = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useContext(AuthContext);

  return (
    <div className="flex-1 bg-white min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-6 bg-gradient-to-br from-red-50/50 via-white to-red-50/10">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 bg-red-50 text-primary border border-red-100 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
              <LuSparkles />
              Real-time Emergency Response Platform
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-secondary tracking-tight leading-tight">
              Bridging the Gap in <br />
              <span className="text-primary bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                Emergency Blood
              </span> Need.
            </h1>
            <p className="text-base text-gray-500 max-w-lg mt-6 leading-relaxed">
              BloodBridge is a real-time connector connecting patients, hospitals, and volunteers with verified blood donors instantly. Managed by an advanced accountability metrics system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-8">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="bg-primary hover:bg-primary-light text-white text-sm font-bold uppercase tracking-wider px-8 py-3.5 rounded-xl shadow-lg shadow-red-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  Go to {user?.role} Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="bg-primary hover:bg-primary-light text-white text-sm font-bold uppercase tracking-wider px-8 py-3.5 rounded-xl shadow-lg shadow-red-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Register as Donor / Patient
                  </Link>
                  <Link
                    to="/login"
                    className="bg-white hover:bg-red-50 border border-border hover:border-red-200 text-secondary text-sm font-bold uppercase tracking-wider px-8 py-3.5 rounded-xl transition-all hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex-1 relative flex justify-center">
            {/* Elegant Vector Concept Design */}
            <div className="w-80 h-80 rounded-full bg-red-100/40 absolute -z-10 blur-3xl animate-pulse"></div>
            <div className="border border-border rounded-3xl p-6 bg-white/70 backdrop-blur-md shadow-2xl flex flex-col gap-6 max-w-sm w-full border-l-4 border-l-primary relative">
              <div className="absolute -top-4 -right-4 h-10 w-10 bg-primary text-white flex items-center justify-center rounded-2xl shadow-lg text-lg animate-bounce">
                🩸
              </div>
              <div className="flex gap-4 items-center">
                <div className="h-10 w-10 bg-red-100 text-primary flex items-center justify-center rounded-xl text-lg font-bold">
                  🥇
                </div>
                <div>
                  <h4 className="font-bold text-secondary text-sm">Donor Reliability Score (DRS)</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Trust USP</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed border-t border-border pt-4">
                No more fake promises. Our proprietary DRS system tracks real donation logs, rewarding active heroes and ensuring real-time response accountability.
              </p>
              <div className="bg-gray-50 p-3 rounded-xl border border-border flex items-center justify-between text-xs font-semibold">
                <span className="text-gray-500">🏆 Start Score</span>
                <span className="text-primary font-extrabold">50 Points</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges section */}
      <section className="py-16 border-t border-border max-w-5xl mx-auto px-6">
        <h3 className="text-center text-xs font-extrabold uppercase tracking-widest text-primary mb-12">
          How it Works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl border border-border hover:border-red-200 transition-all hover:shadow-lg flex flex-col items-center text-center">
            <div className="h-12 w-12 bg-red-50 rounded-xl text-primary flex items-center justify-center text-xl mb-4 shadow-sm border border-red-100">
              <LuHeart />
            </div>
            <h4 className="font-bold text-secondary text-base">Instant Donor Matching</h4>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              We query matching donors within your city, checking compatibility charts and sorted dynamically by reliability scores.
            </p>
          </div>
          <div className="p-6 rounded-2xl border border-border hover:border-red-200 transition-all hover:shadow-lg flex flex-col items-center text-center">
            <div className="h-12 w-12 bg-red-50 rounded-xl text-primary flex items-center justify-center text-xl mb-4 shadow-sm border border-red-100">
              <LuActivity />
            </div>
            <h4 className="font-bold text-secondary text-base">Real-time Sockets</h4>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              Hospital emergency rooms can trigger high-alert SOS signals broadcasting instant socket popups to O- and compatible groups.
            </p>
          </div>
          <div className="p-6 rounded-2xl border border-border hover:border-red-200 transition-all hover:shadow-lg flex flex-col items-center text-center">
            <div className="h-12 w-12 bg-red-50 rounded-xl text-primary flex items-center justify-center text-xl mb-4 shadow-sm border border-red-100">
              <LuShieldCheck />
            </div>
            <h4 className="font-bold text-secondary text-base">Security & Badges</h4>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              Donor phones remain strictly hidden until confirm commitments. Earn Gold badges and unlock city achievements!
            </p>
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <footer className="bg-secondary text-white py-12 px-6 border-t border-border mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">🩸</span>
            <span className="font-bold tracking-wider">BloodBridge Platform</span>
          </div>
          <p className="text-xs text-gray-400">
            © 2026 Emergency Blood Connector System. Free humanitarian program.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
