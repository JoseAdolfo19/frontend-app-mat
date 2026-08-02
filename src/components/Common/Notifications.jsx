import React, { useState, useEffect } from 'react';
import { notificationsApi } from '../../api/notifications';
import toast from 'react-hot-toast';
import { FaBell, FaCheck, FaTrash, FaCheckDouble } from 'react-icons/fa';
import Loading from '../Common/Loading';
import { useLanguage } from '../../contexts/LanguageContext';
import { toArray } from '../../utils/helpers';

const Notifications = () => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [processingId, setProcessingId] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsApi.getNotifications();
      setNotifications(toArray(response.data?.data));
    } catch (error) {
      toast.error(t('notifications.loadedError'));
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      setProcessingId(id);
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      toast.error(t('notifications.markReadError'));
    } finally {
      setProcessingId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast.success(t('notifications.markAllRead'));
    } catch (error) {
      toast.error(t('notifications.markAllReadError'));
    }
  };

  const handleDelete = async (id) => {
    try {
      setProcessingId(id);
      await notificationsApi.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success(t('notifications.deletedSuccess'));
    } catch (error) {
      toast.error(t('notifications.deleteError'));
    } finally {
      setProcessingId(null);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (loading) return <Loading />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[var(--on-surface)]">{t('notifications.title')}</h2>
          <p className="text-[var(--on-surface-variant)]">
            {unreadCount > 0
              ? (unreadCount === 1
                ? t('notifications.unreadCount').replace('{count}', unreadCount)
                : t('notifications.unreadCountPlural').replace('{count}', unreadCount))
              : t('notifications.upToDate')}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 bg-[var(--surface-container)] text-[var(--on-surface)] font-bold rounded-xl hover:bg-[var(--surface-container-high)] transition-all flex items-center gap-2"
          >
            <FaCheckDouble />
            {t('notifications.markAllRead')}
          </button>
        )}
      </div>

      <div className="space-y-3" role="list" aria-label={t('notifications.listLabel') || 'Lista de notificaciones'}>
        {notifications.map((notification) => (
          <div
            key={notification.id}
            role="listitem"
            className={`p-5 rounded-2xl border transition-all flex items-start gap-4 ${
              notification.is_read
                ? 'bg-[var(--surface)] border-[var(--surface-container)]'
                : 'bg-[var(--primary)]/5 border-[var(--primary)]/20'
            }`}
          >
            <div className={`p-2 rounded-full ${notification.read_at ? 'bg-[var(--surface-container)] text-[var(--on-surface-variant)]' : 'bg-[var(--primary)]/10 text-[var(--primary)]'}`}>
              <FaBell className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className={`font-medium ${notification.read_at ? 'text-[var(--on-surface-variant)]' : 'text-[var(--on-surface)]'}`}>
                {notification.title || notification.message || t('notifications.title')}
              </p>
              {notification.body && (
                <p className="text-sm text-[var(--on-surface-variant)] mt-1">{notification.body}</p>
              )}
              <p className="text-xs text-[var(--on-surface-variant)] mt-2">
                {notification.created_at ? new Date(notification.created_at).toLocaleString() : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!notification.is_read && (
                <button
                  onClick={() => handleMarkAsRead(notification.id)}
                  disabled={processingId === notification.id}
                  className="p-2 text-[var(--secondary)] hover:bg-[var(--secondary)]/10 rounded-lg transition-colors disabled:opacity-50"
                  title={t('notifications.markAsRead')}
                  aria-label={t('notifications.markAsRead') || 'Marcar como leído'}
                >
                  <FaCheck className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => handleDelete(notification.id)}
                disabled={processingId === notification.id}
                className="p-2 text-[var(--error)] hover:bg-[var(--error)]/10 rounded-lg transition-colors disabled:opacity-50"
                  title={t('notifications.delete')}
                  aria-label={t('notifications.delete') || 'Eliminar notificación'}
              >
                <FaTrash className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {notifications.length === 0 && (
        <div className="text-center py-16">
          <FaBell className="mx-auto text-5xl text-[var(--on-surface-variant)] mb-4" />
          <h3 className="text-xl font-bold text-[var(--on-surface)]">{t('notifications.empty')}</h3>
          <p className="text-[var(--on-surface-variant)]">{t('notifications.emptyDesc')}</p>
        </div>
      )}
    </div>
  );
};

export default Notifications;