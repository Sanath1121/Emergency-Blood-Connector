import React, { useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  LuUser
} from 'react-icons/lu';
import { AuthContext } from '../../context/AuthContext';

const Sidebar = () => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user) return null;

  const role = user.role;

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
      icon: <LuSearch className="text-lg" />
    });
    navItems.push({
      path: '/profile',
      label: t('auth.name', 'Profile'),
      icon: <LuUser className="text-lg" />
    });
  } else if (role === 'requester' || role === 'hospital') {
    navItems.push({
      path: '/requests/post',
      label: t('request.post', 'Post Request'),
      icon: <LuPlus className="text-lg" />
    });
  } else if (role === 'admin') {
    navItems.push({
      path: '/admin/users',
      label: t('common.search', 'Manage Users'),
      icon: <LuUsers className="text-lg" />
    });
    navItems.push({
      path: '/admin/requests',
      label: t('nav.requests', 'All Requests'),
      icon: <LuFileText className="text-lg" />
    });
    navItems.push({
      path: '/admin/bloodbanks',
      label: t('nav.bloodBanks', 'Manage Banks'),
      icon: <LuDatabase className="text-lg" />
    });
  }

  // 3. Shared Directory / Map links
  navItems.push({
    path: '/bloodbanks',
    label: t('nav.bloodBanks', 'Blood Banks'),
    icon: <LuHeart className="text-lg" />
  });
  navItems.push({
    path: '/map',
    label: t('nav.map', 'Live Map'),
    icon: <LuMap className="text-lg" />
  });

  return (
    <aside className="w-64 border-r border-border bg-white flex flex-col min-h-[calc(100vh-4rem)] sticky top-16 shadow-sm">
      {/* Navigation list */}
      <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-md shadow-red-500/20'
                  : 'text-gray-600 hover:text-primary hover:bg-red-50'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Quick info chip */}
      <div className="p-4 border-t border-border bg-gray-50 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            City Room
          </span>
          <span className="text-xs font-bold text-secondary capitalize mt-0.5">
            📍 {user.city}
          </span>
        </div>
        {role === 'donor' && (
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Live Score
            </span>
            <span className="text-xs font-bold text-primary mt-0.5">
              🏆 {user.drsScore}
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
