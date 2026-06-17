import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LuBell, LuLanguages, LuLogOut, LuUser, LuHeartHandshake, LuSettings } from 'react-icons/lu';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useContext(AuthContext);
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useContext(NotificationContext);
  const [showNotifications, setShowNotifications] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('bloodbridge_lang', lng);
  };

  const currentLang = i18n.language || 'en';

  return (
    <nav className="h-16 border-b border-white/5 bg-surface/50 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-40 shadow-lg text-white">
      {/* Branding */}
      <Link to="/" className="flex items-center gap-2.5 group">
        <span className="text-2xl animate-pulse">🩸</span>
        <span className="text-lg font-black tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-primary-light group-hover:to-primary transition-all">
          BloodBridge
        </span>
      </Link>

      {/* Navigation Controls */}
      <div className="flex items-center gap-4">
        {/* Language Selector */}
        <div className="flex items-center gap-1 border border-white/5 rounded-xl p-0.5 bg-background/50">
          <button
            onClick={() => changeLanguage('en')}
            className={`px-2.5 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
              currentLang === 'en' ? 'bg-primary text-white shadow-md' : 'text-muted hover:text-white hover:bg-white/5'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => changeLanguage('hi')}
            className={`px-2.5 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
              currentLang === 'hi' ? 'bg-primary text-white shadow-md' : 'text-muted hover:text-white hover:bg-white/5'
            }`}
          >
            हिं
          </button>
          <button
            onClick={() => changeLanguage('te')}
            className={`px-2.5 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
              currentLang === 'te' ? 'bg-primary text-white shadow-md' : 'text-muted hover:text-white hover:bg-white/5'
            }`}
          >
            తె
          </button>
        </div>

        {user && (
          <>
            {/* Notification Bell Dropdown */}
            <div id="guide-notification-bell" className="relative">
              <motion.button
                onClick={() => setShowNotifications(!showNotifications)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-muted hover:text-primary-light hover:bg-primary/10 rounded-xl relative transition-all cursor-pointer border border-transparent hover:border-primary/15"
              >
                <LuBell className="text-lg" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 h-4.5 w-4.5 bg-primary text-white text-[9px] font-black rounded-full flex items-center justify-center border border-background animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </motion.button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    className="absolute right-0 mt-3 w-80 bg-surface/90 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl"
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-3 bg-background/80 border-b border-white/5 flex justify-between items-center">
                      <span className="text-[10px] font-black text-muted uppercase tracking-widest">
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => markAllAsRead()}
                          className="text-[9px] font-black text-primary-light hover:underline uppercase tracking-wider cursor-pointer"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-xs text-muted font-medium">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            className={`p-3.5 border-b border-white/5 transition-all flex flex-col gap-1 relative ${
                              !n.isRead ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-white/5'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <span className={`text-xs font-bold leading-tight ${!n.isRead ? 'text-primary-light' : 'text-white'}`}>
                                {n.title}
                              </span>
                              <div className="flex gap-2">
                                {!n.isRead && (
                                  <button
                                    onClick={() => markAsRead(n._id)}
                                    className="text-[8px] bg-primary/20 hover:bg-primary/30 text-primary-light px-1.5 py-0.5 rounded font-black uppercase tracking-wider cursor-pointer"
                                  >
                                    Read
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteNotification(n._id)}
                                  className="text-muted hover:text-white text-[9px] font-black cursor-pointer"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                            <span className="text-[11px] text-muted leading-relaxed font-medium">
                              {n.message}
                            </span>
                            <span className="text-[9px] text-muted/60 mt-1 font-semibold">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Avatar + Role Chip */}
            <div className="flex items-center gap-3 border-l border-white/5 pl-4">
              <div className="flex flex-col text-right hidden sm:flex">
                <span className="text-xs font-extrabold text-white leading-tight">{user.name}</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-primary-light bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-lg mt-1 self-end">
                  {user.role}
                </span>
              </div>
              {/* Avatar: Google picture or initials */}
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-9 w-9 rounded-full border border-white/10 shadow-md object-cover"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center font-black text-sm border border-white/10 shadow-md">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Account Settings Link */}
              <Link
                to="/account"
                title="Account Settings"
                className="p-2 text-muted hover:text-white hover:bg-white/5 rounded-xl border border-transparent hover:border-white/5 transition-all"
              >
                <LuSettings className="text-base" />
              </Link>

              {/* Logout Button */}
              <button
                onClick={logout}
                title="Logout"
                className="p-2 text-muted hover:text-primary-light hover:bg-primary/10 rounded-xl border border-transparent hover:border-primary/10 transition-all cursor-pointer"
              >
                <LuLogOut className="text-base" />
              </button>
            </div>
          </>
        )}

        {!user && (
          <Link
            to="/login"
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-light text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl shadow-md transition-all border border-primary/20 active:scale-95"
          >
            <LuHeartHandshake className="text-xs" />
            {t('auth.login', 'Login')}
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
