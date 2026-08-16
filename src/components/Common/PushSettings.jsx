import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FaBell, FaBellSlash, FaPaperPlane } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import { pushApi } from '../../api/push';
import { isPushSupported, getSubscription, subscribeToPush, unsubscribeFromPush } from '../../utils/push';
import Loading from './Loading';

const PushSettings = () => {
  const { t } = useLanguage();
  const tp = (key) => t(`settings.push.${key}`);
  const [loading, setLoading] = useState(true);
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [permission, setPermission] = useState('default');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    refreshState();
  }, []);

  const refreshState = async () => {
    setLoading(true);
    const support = isPushSupported();
    setSupported(support);
    if (support) {
      setPermission(Notification.permission);
      const sub = await getSubscription().catch(() => null);
      setSubscribed(Boolean(sub));
    }
    setLoading(false);
  };

  const handleSubscribe = async () => {
    try {
      await subscribeToPush();
      setSubscribed(true);
      setPermission('granted');
      toast.success(tp('subscribed'));
    } catch (e) {
      toast.error(tp('error'));
    }
  };

  const handleUnsubscribe = async () => {
    await unsubscribeFromPush();
    setSubscribed(false);
    toast.success(tp('unsubscribed'));
  };

  const handleTest = async () => {
    setSending(true);
    try {
      const res = await pushApi.sendTest();
      toast.success(tp('testSent'));
      setEnabled(res.data?.enabled !== false);
    } catch (e) {
      toast.error(tp('testError'));
    } finally {
      setSending(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--on-surface-variant)]">{tp('description')}</p>

      {!supported && (
        <div className="p-4 rounded-lg bg-[var(--surface)] border border-[var(--outline-variant)]">
          <p className="text-sm">{tp('notSupported')}</p>
        </div>
      )}

      {supported && (
        <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--surface)] border border-[var(--outline-variant)]">
          <div className="flex items-center gap-3">
            {subscribed ? (
              <FaBell className="text-[var(--primary)] text-xl" />
            ) : (
              <FaBellSlash className="text-[var(--on-surface-variant)] text-xl" />
            )}
            <div>
              <p className="font-medium">{tp('title')}</p>
              <p className="text-xs text-[var(--on-surface-variant)]">
                {permission === 'denied' ? tp('blocked') : subscribed ? tp('active') : tp('inactive')}
              </p>
            </div>
          </div>
          {permission === 'denied' ? (
            <span className="text-xs text-red-500">{tp('enableInBrowser')}</span>
          ) : subscribed ? (
            <button
              onClick={handleUnsubscribe}
              className="px-4 py-2 rounded-lg border border-[var(--outline)] text-sm hover:bg-[var(--surface-container)]"
            >
              {tp('disable')}
            </button>
          ) : (
            <button
              onClick={handleSubscribe}
              className="px-4 py-2 rounded-lg bg-[var(--primary)] text-[var(--on-primary)] text-sm font-medium"
            >
              {tp('enable')}
            </button>
          )}
        </div>
      )}

      {subscribed && (
        <div className="p-4 rounded-lg bg-[var(--surface)] border border-[var(--outline-variant)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{tp('testTitle')}</p>
              <p className="text-xs text-[var(--on-surface-variant)]">{tp('testHint')}</p>
            </div>
            <button
              onClick={handleTest}
              disabled={sending}
              className="px-4 py-2 rounded-lg bg-[var(--primary)] text-[var(--on-primary)] text-sm font-medium flex items-center gap-2 disabled:opacity-50"
            >
              <FaPaperPlane className="text-xs" />
              {tp('sendTest')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PushSettings;