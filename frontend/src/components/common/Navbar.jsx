import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
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
    <nav className="h-16 border-b border-border bg-white flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
      {/* Branding */}
      <Link to="/" className="flex items-center gap-2 group">
        <span className="text-2xl animate-pulse">🩸</span>
        <span className="text-xl font-bold tracking-tight text-secondary group-hover:text-primary transition-colors">
          BloodBridge
        </span>
      </Link>

      {/* Navigation Controls */}
      <div className="flex items-center gap-4">
        {/* Language Selector */}
        <div className="flex items-center gap-1 border border-border rounded-lg p-0.5 bg-gray-50">
          <button
            onClick={() => changeLanguage('en')}
            className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
              currentLang === 'en' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => changeLanguage('hi')}
            className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
              currentLang === 'hi' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            हिं
          </button>
          <button
            onClick={() => changeLanguage('te')}
            className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
              currentLang === 'te' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            తె
          </button>
        </div>

        {user && (
          <>
            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-600 hover:text-primary hover:bg-red-50 rounded-full relative transition-all"
              >
                <LuBell className="text-xl" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 h-5 w-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="p-3 bg-gray-50 border-b border-border flex justify-between items-center">
                    <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllAsRead()}
                        className="text-[10px] font-semibold text-primary hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-muted">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          className={`p-3 border-b border-border transition-all flex flex-col gap-1 relative ${
                            !n.isRead ? 'bg-red-50/40 hover:bg-red-50/60' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className={`text-xs font-bold ${!n.isRead ? 'text-primary' : 'text-secondary'}`}>
                              {n.title}
                            </span>
                            <div className="flex gap-2">
                              {!n.isRead && (
                                <button
                                  onClick={() => markAsRead(n._id)}
                                  className="text-[9px] bg-red-100 hover:bg-red-200 text-primary px-1.5 py-0.5 rounded font-bold"
                                >
                                  Read
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(n._id)}
                                className="text-gray-400 hover:text-gray-600 text-[10px] font-bold"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                          <span className="text-[11px] text-gray-500 leading-relaxed">
                            {n.message}
                          </span>
                          <span className="text-[9px] text-gray-400 mt-1">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar + Role Chip */}
            <div className="flex items-center gap-3 border-l border-border pl-4">
              <div className="flex flex-col text-right hidden sm:flex">
                <span className="text-sm font-semibold text-secondary">{user.name}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-md mt-0.5 self-end">
                  {user.role}
                </span>
              </div>
              {/* Avatar: Google picture or initials */}
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-9 w-9 rounded-full border-2 border-white shadow-md object-cover"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-sm border-2 border-white shadow-md">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Account Settings Link */}
              <Link
                to="/account"
                title="Account Settings"
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
              >
                <LuSettings className="text-lg" />
              </Link>

              {/* Logout Button */}
              <button
                onClick={logout}
                title="Logout"
                className="p-2 text-gray-500 hover:text-primary hover:bg-red-50 rounded-full transition-all"
              >
                <LuLogOut className="text-lg" />
              </button>
            </div>
          </>
        )}

        {!user && (
          <Link
            to="/login"
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-light text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg shadow-md transition-all transform active:scale-95"
          >
            <LuHeartHandshake />
            {t('auth.login', 'Login')}
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
