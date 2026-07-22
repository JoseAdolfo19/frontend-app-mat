import React, { useState, useEffect } from 'react';
import { notificationsApi } from '../../api/notifications';
import toast from 'react-hot-toast';
import { FaBell, FaCheck, FaTrash, FaCheckDouble } from 'react-icons/fa';
import Loading from '../Common/Loading';

// Normaliza cualquier forma de respuesta (array plano, paginado, null, o error) a un array seguro
const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value && Array.isArray(value.data)) return value.data;
  return [];
};

const Notifications = () => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsApi.getNotifications();
      setNotifications(toArray(response.data?.data));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Error al cargar notificaciones');
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
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Error al marcar como leída');
    } finally {
      setProcessingId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
      toast.success('Todas marcadas como leídas');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Error al marcar todas como leídas');
    }
  };

  const handleDelete = async (id) => {
    try {
      setProcessingId(id);
      await notificationsApi.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success('Notificación eliminada');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Error al eliminar la notificación');
    } finally {
      setProcessingId(null);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  if (loading) return <Loading />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[var(--on-surface)]">Notificaciones</h2>
          <p className="text-[var(--on-surface-variant)]">
            {unreadCount > 0 ? `Tienes ${unreadCount} notificación${unreadCount !== 1 ? 'es' : ''} sin leer` : 'Estás al día'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 bg-[var(--surface-container)] text-[var(--on-surface)] font-bold rounded-xl hover:bg-[var(--surface-container-high)] transition-all flex items-center gap-2"
          >
            <FaCheckDouble />
            Marcar todas como leídas
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-5 rounded-2xl border transition-all flex items-start gap-4 ${
              notification.read_at
                ? 'bg-[var(--surface)] border-[var(--surface-container)]'
                : 'bg-[var(--primary)]/5 border-[var(--primary)]/20'
            }`}
          >
            <div className={`p-2 rounded-full ${notification.read_at ? 'bg-[var(--surface-container)] text-[var(--on-surface-variant)]' : 'bg-[var(--primary)]/10 text-[var(--primary)]'}`}>
              <FaBell className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className={`font-medium ${notification.read_at ? 'text-[var(--on-surface-variant)]' : 'text-[var(--on-surface)]'}`}>
                {notification.title || notification.message || 'Notificación'}
              </p>
              {notification.body && (
                <p className="text-sm text-[var(--on-surface-variant)] mt-1">{notification.body}</p>
              )}
              <p className="text-xs text-[var(--on-surface-variant)] mt-2">
                {notification.created_at ? new Date(notification.created_at).toLocaleString() : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!notification.read_at && (
                <button
                  onClick={() => handleMarkAsRead(notification.id)}
                  disabled={processingId === notification.id}
                  className="p-2 text-[var(--secondary)] hover:bg-[var(--secondary)]/10 rounded-lg transition-colors disabled:opacity-50"
                  title="Marcar como leída"
                >
                  <FaCheck className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => handleDelete(notification.id)}
                disabled={processingId === notification.id}
                className="p-2 text-[var(--error)] hover:bg-[var(--error)]/10 rounded-lg transition-colors disabled:opacity-50"
                title="Eliminar"
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
          <h3 className="text-xl font-bold text-[var(--on-surface)]">No tienes notificaciones</h3>
          <p className="text-[var(--on-surface-variant)]">Te avisaremos cuando haya algo nuevo</p>
        </div>
      )}
    </div>
  );
};

export default Notifications;