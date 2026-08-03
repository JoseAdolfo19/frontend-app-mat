import React, { createContext, useContext, useState, useEffect } from 'react';
import { usersApi } from '../api/users';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { getTranslation, getSavedLanguage } from '../utils/i18n';

const translate = (key) => getTranslation(getSavedLanguage(), key);

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getNotifications();
      setNotifications(response.data.data || []);
      const unread = response.data.data?.filter(n => !n.is_read) || [];
      setUnreadCount(unread.length);
    } catch {
      toast.error(translate('notifications.loadedError'));
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await usersApi.getUnreadCount();
      setUnreadCount(response.data.unread_count || 0);
    } catch {
      toast.error(translate('notifications.loadedError'));
    }
  };

  const markAsRead = async (id) => {
    try {
      await usersApi.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      toast.error(translate('notifications.markReadError'));
    }
  };

  const markAllAsRead = async () => {
    try {
      await usersApi.markAllAsRead();
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
      toast.success(translate('notifications.markAllRead'));
    } catch (error) {
      toast.error(translate('notifications.markAllReadError'));
    }
  };

  const deleteNotification = async (id) => {
    try {
      await usersApi.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (notifications.find(n => n.id === id)?.is_read === false) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      toast.error(translate('notifications.deleteError'));
    }
  };

  useEffect(() => {
    if (user && user.id) {
      fetchNotifications();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      fetchNotifications,
      fetchUnreadCount,
      markAsRead,
      markAllAsRead,
      deleteNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};