import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from './AuthContext';
import io from 'socket.io-client';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user, updateUserProfile } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);

  const addToast = (title, message, type = 'general') => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, title, message, type }]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
        const unread = res.data.data.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      const res = await api.put(`/notifications/${id}/read`);
      if (res.data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await api.put('/notifications/read-all');
      if (res.data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const res = await api.delete(`/notifications/${id}`);
      if (res.data.success) {
        const wasUnread = !notifications.find((n) => n._id === id)?.isRead;
        setNotifications((prev) => prev.filter((n) => n._id !== id));
        if (wasUnread) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Socket connection and real-time triggers
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchNotifications();

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const socket = io(socketUrl, { withCredentials: true });

    socket.on('connect', () => {
      console.log('Notification socket connected:', socket.id);
      socket.emit('join_user', user._id);
      if (user.city) {
        socket.emit('join_city', user.city);
      }
    });

    // 1. Listen for new blood requests (matching blood + city)
    socket.on('new_blood_request', (data) => {
      addToast(data.notification.title, data.notification.message, 'blood_request');
      setNotifications((prev) => [data.notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    // 2. Listen for SOS alerts (broadcast SOS)
    socket.on('sos_alert', (data) => {
      addToast('🚨 EMERGENCY SOS ALERT 🚨', data.message, 'sos_alert');
      setNotifications((prev) => [data.notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    // 3. Listen for request accepted (sent to requester)
    socket.on('request_accepted', (data) => {
      addToast('🤝 Donor Responded!', data.notification.message, 'request_accepted');
      setNotifications((prev) => [data.notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    // 4. Listen for donor confirmed (sent to donor)
    socket.on('donor_confirmed', (data) => {
      addToast('🥇 Request Confirmed!', data.notification.message, 'donor_confirmed');
      setNotifications((prev) => [data.notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    // 5. Listen for donation confirmed (sent to donor)
    socket.on('donation_confirmed', (data) => {
      addToast('🎉 Donation Fulfilled!', data.notification.message, 'donation_confirmed');
      setNotifications((prev) => [data.notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Real-time update user profile (DRS badge, total donations, availability)
      api.get('/auth/me').then((res) => {
        if (res.data.success) {
          updateUserProfile(res.data.data);
        }
      });
    });

    // 6. Generic/cooldown notifications
    socket.on('notification', (data) => {
      addToast(data.title, data.message, data.type);
      setNotifications((prev) => [data.notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Refresh profile (cooldown lifted!)
      api.get('/auth/me').then((res) => {
        if (res.data.success) {
          updateUserProfile(res.data.data);
        }
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toasts,
        addToast,
        removeToast,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification
      }}
    >
      {children}

      {/* Render Toast notifications in top-right */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full">
        {toasts.map((toast) => {
          let bgClass = 'bg-white border-secondary text-secondary';
          let borderAccent = 'border-l-4 border-l-secondary';
          let emoji = 'ℹ️';

          if (toast.type === 'sos_alert') {
            bgClass = 'bg-red-50 text-red-900 border-red-200';
            borderAccent = 'border-l-4 border-l-red-600';
            emoji = '🚨';
          } else if (toast.type === 'blood_request') {
            bgClass = 'bg-orange-50 text-orange-900 border-orange-200';
            borderAccent = 'border-l-4 border-l-orange-500';
            emoji = '🩸';
          } else if (toast.type === 'donation_confirmed' || toast.type === 'cooldown_lifted') {
            bgClass = 'bg-green-50 text-green-900 border-green-200';
            borderAccent = 'border-l-4 border-l-green-600';
            emoji = '🎉';
          } else if (toast.type === 'request_accepted' || toast.type === 'donor_confirmed') {
            bgClass = 'bg-blue-50 text-blue-900 border-blue-200';
            borderAccent = 'border-l-4 border-l-blue-500';
            emoji = '🤝';
          }

          return (
            <div
              key={toast.id}
              className={`p-4 rounded-lg shadow-lg border flex gap-3 items-start transition-all duration-300 animate-slide-in ${bgClass} ${borderAccent}`}
            >
              <span className="text-xl mt-0.5">{emoji}</span>
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{toast.title}</h4>
                <p className="text-xs mt-1 leading-relaxed">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-gray-600 text-xs font-bold px-1"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};
