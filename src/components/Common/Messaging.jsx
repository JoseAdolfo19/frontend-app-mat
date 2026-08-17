import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { FaPaperPlane, FaComments, FaUser } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { messagingApi } from '../../api/messaging';
import Loading from '../Common/Loading';
import { toArray } from '../../utils/helpers';

const Messaging = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const cp = (key) => t(`messaging.${key}`);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const fetchConversations = async () => {
    try {
      const res = await messagingApi.getConversations();
      setConversations(toArray(res.data));
      return toArray(res.data);
    } catch (e) {
      toast.error(cp('loadError'));
      return [];
    }
  };

  useEffect(() => {
    fetchConversations().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openConversation = async (conv) => {
    setActive(conv);
    try {
      const res = await messagingApi.getConversation(conv.id);
      setMessages(toArray(res.data));
    } catch (e) {
      toast.error(cp('loadError'));
    }
  };

  const send = async () => {
    if (!draft.trim() || !active) return;
    setSending(true);
    try {
      await messagingApi.reply(active.id, draft);
      setDraft('');
      await openConversation(active);
    } catch (e) {
      toast.error(cp('sendError'));
    } finally {
      setSending(false);
    }
  };

  const otherParticipant = (conv) => {
    const isTeacher = user?.role?.name !== 'student';
    return isTeacher ? conv.student?.full_name : conv.teacher?.full_name;
  };

  if (loading) return <Loading />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6">
      <div className="bg-[var(--surface)] rounded-2xl p-4 shadow-sm border border-[var(--surface-container)] h-fit md:h-[600px] overflow-y-auto">
        <div className="flex items-center gap-2 mb-4">
          <FaComments className="text-[var(--primary)]" />
          <h3 className="font-bold text-lg text-[var(--on-surface)]">{cp('title')}</h3>
        </div>
        {conversations.length === 0 && (
          <p className="text-sm text-[var(--on-surface-variant)]">{cp('empty')}</p>
        )}
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => openConversation(conv)}
            className={`w-full text-left p-3 rounded-xl mb-2 transition-all flex items-center gap-3 ${
              active?.id === conv.id
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--surface-container-low)] hover:bg-[var(--surface-container-high)]'
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-[var(--primary)] flex items-center justify-center text-white shrink-0">
              <FaUser />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold truncate">{otherParticipant(conv)}</p>
              <p className="text-xs opacity-80 truncate">
                {conv.evaluation?.title || cp('general')}
              </p>
            </div>
            {conv.unread_count > 0 && (
              <span className="bg-white text-[var(--primary)] text-xs font-bold rounded-full px-2 py-0.5">
                {conv.unread_count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--surface-container)] flex flex-col h-[600px]">
        {!active ? (
          <div className="flex-1 flex items-center justify-center text-[var(--on-surface-variant)]">
            {cp('selectHint')}
          </div>
        ) : (
          <>
            <div className="px-5 py-4 border-b border-[var(--surface-container)]">
              <h3 className="font-bold text-[var(--on-surface)]">{otherParticipant(active)}</h3>
              <p className="text-xs text-[var(--on-surface-variant)]">
                {active.evaluation?.title || cp('general')}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {messages.map((msg) => {
                const mine = String(msg.sender_id) === String(user?.id);
                return (
                  <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                        mine
                          ? 'bg-[var(--primary)] text-white rounded-br-sm'
                          : 'bg-[var(--surface-container-high)] text-[var(--on-surface)] rounded-bl-sm'
                      }`}
                    >
                      <p className="font-semibold text-xs mb-1 opacity-80">
                        {msg.sender?.full_name}
                      </p>
                      <p>{msg.body}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(msg.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
            <div className="p-4 border-t border-[var(--surface-container)] flex gap-2">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder={cp('writePlaceholder')}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
              />
              <button
                onClick={send}
                disabled={sending || !draft.trim()}
                className="px-5 py-3 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
              >
                <FaPaperPlane />
                {sending ? cp('sending') : cp('send')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Messaging;