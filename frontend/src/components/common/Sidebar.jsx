import React, { useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  LuLayoutDashboard,
  LuPlus,
  LuSearch,
  LuMap,
  LuHeart,
  LuUsers,
  LuDatabase,
  LuTrophy,
  LuFileText,
  LuUser,
  LuCompass
} from 'react-icons/lu';
import { AuthContext } from '../../context/AuthContext';
import useGuide from '../../hooks/useGuide';

const Sidebar = () => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user) return null;

  const role = user.role;
  const { startGuide } = useGuide(role);

  // Build role-specific navigation maps
  const navItems = [];

  // 1. Dashboard is common to everyone but lands on different panels
  navItems.push({
    path: '/dashboard',
    label: t('nav.dashboard', 'Dashboard'),
    icon: <LuLayoutDashboard className="text-lg" />
  });

  // 2. Role-specific menus
  if (role === 'donor') {
    navItems.push({
      path: '/requests',
      label: t('nav.requests', 'Requests'),
      icon: <LuSearch className="text-lg" />,
      id: 'guide-nav-requests'
    });
    navItems.push({
      path: '/profile',
      label: t('auth.name', 'Profile'),
      icon: <LuUser className="text-lg" />,
      id: 'guide-nav-profile'
    });
  } else if (role === 'requester' || role === 'hospital') {
    navItems.push({
      path: '/requests/post',
      label: t('request.post', 'Post Request'),
      icon: <LuPlus className="text-lg" />,
      id: 'guide-nav-post'
    });
  } else if (role === 'admin') {
    navItems.push({
      path: '/admin/users',
      label: t('common.search', 'Manage Users'),
      icon: <LuUsers className="text-lg" />,
      id: 'guide-nav-users'
    });
    navItems.push({
      path: '/admin/requests',
      label: t('nav.requests', 'All Requests'),
      icon: <LuFileText className="text-lg" />,
      id: 'guide-nav-admin-requests'
    });
    navItems.push({
      path: '/admin/bloodbanks',
      label: t('nav.bloodBanks', 'Manage Banks'),
      icon: <LuDatabase className="text-lg" />,
      id: 'guide-nav-admin-banks'
    });
  }

  // 3. Shared Directory / Map links
  navItems.push({
    path: '/bloodbanks',
    label: t('nav.bloodBanks', 'Blood Banks'),
    icon: <LuHeart className="text-lg" />,
    id: 'guide-nav-bloodbanks'
  });
  navItems.push({
    path: '/map',
    label: t('nav.map', 'Live Map'),
    icon: <LuMap className="text-lg" />
  });

  return (
    <aside className="w-64 border-r border-white/5 bg-surface/30 backdrop-blur-xl flex flex-col min-h-[calc(100vh-4rem)] sticky top-16 shadow-lg text-white">
      {/* Navigation list */}
      <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              id={item.id || undefined}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all relative group overflow-hidden ${
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 border border-primary/20'
                  : 'text-muted hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {item.icon}
              <span className="relative z-10">{item.label}</span>
              
              {/* Highlight strip on hover for inactive links */}
              {!isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-0 bg-primary/20 transition-all group-hover:w-1.5" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Take a Tour button */}
      <div className="px-4 pb-4">
        <motion.button
          id="guide-tour-button"
          onClick={startGuide}
          whileHover={{ scale: 1.02, borderColor: 'rgba(255,59,48,0.4)', color: '#FF3B30' }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/10 text-muted text-[10px] font-black uppercase tracking-widest hover:bg-primary/5 transition-all cursor-pointer"
        >
          <LuCompass className="text-sm" />
          Take a Tour
        </motion.button>
      </div>

      {/* Quick info chip */}
      <div className="p-4 border-t border-white/5 bg-background/50 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-muted uppercase tracking-widest">
            City Room
          </span>
          <span className="text-xs font-bold text-white capitalize mt-1">
            📍 {user.city}
          </span>
        </div>
        {role === 'donor' && (
          <div className="flex flex-col text-right">
            <span className="text-[9px] font-black text-muted uppercase tracking-widest">
              Live Score
            </span>
            <span className="text-xs font-black text-primary-light mt-1 glow-text-primary">
              🏆 {user.drsScore}
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
