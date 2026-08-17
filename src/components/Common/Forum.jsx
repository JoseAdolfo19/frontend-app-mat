import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FaComments, FaPlus, FaComment, FaLock, FaTimes } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { messagingApi } from '../../api/messaging';
import Loading from '../Common/Loading';
import { toArray } from '../../utils/helpers';

const Forum = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const cp = (key) => t(`forum.${key}`);
  const [loading, setLoading] = useState(true);
  const [threads, setThreads] = useState([]);
  const [active, setActive] = useState(null);
  const [posts, setPosts] = useState([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', body: '' });
  const [submitting, setSubmitting] = useState(false);

  const isTeacher = user?.role?.name !== 'student';

  const fetchThreads = async () => {
    try {
      const res = await messagingApi.getThreads();
      setThreads(toArray(res.data));
    } catch (e) {
      toast.error(cp('loadError'));
    }
  };

  useEffect(() => {
    fetchThreads().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openThread = async (thread) => {
    setActive(thread);
    try {
      const res = await messagingApi.getThread(thread.id);
      setPosts(toArray(res.data?.posts));
    } catch (e) {
      toast.error(cp('loadError'));
    }
  };

  const post = async () => {
    if (!draft.trim() || !active) return;
    setSending(true);
    try {
      await messagingApi.postInThread(active.id, draft);
      setDraft('');
      await openThread(active);
      await fetchThreads();
    } catch (e) {
      toast.error(cp('sendError'));
    } finally {
      setSending(false);
    }
  };

  const createThread = async () => {
    if (!form.title.trim() || !form.body.trim()) return;
    setSubmitting(true);
    try {
      const res = await messagingApi.createThread({ title: form.title, body: form.body });
      setCreating(false);
      setForm({ title: '', body: '' });
      toast.success(cp('createSuccess'));
      await fetchThreads();
      if (res.data?.id) openThread(res.data);
    } catch (e) {
      toast.error(cp('createError'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6">
      <div className="bg-[var(--surface)] rounded-2xl p-4 shadow-sm border border-[var(--surface-container)] h-fit md:h-[600px] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FaComments className="text-[var(--primary)]" />
            <h3 className="font-bold text-lg text-[var(--on-surface)]">{cp('title')}</h3>
          </div>
          {isTeacher && (
            <button
              onClick={() => setCreating((v) => !v)}
              className="px-3 py-1.5 bg-[var(--primary)] text-white rounded-lg text-sm hover:opacity-90 flex items-center gap-1"
            >
              {creating ? <FaTimes /> : <FaPlus />}
              {creating ? cp('cancel') : cp('newThread')}
            </button>
          )}
        </div>

        {creating && isTeacher && (
          <div className="mb-4 p-4 bg-[var(--surface-container-low)] rounded-xl space-y-2">
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder={cp('titlePlaceholder')}
              className="w-full px-3 py-2 rounded-lg border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface)]"
            />
            <textarea
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              placeholder={cp('bodyPlaceholder')}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface)] resize-none"
            />
            <button
              onClick={createThread}
              disabled={submitting || !form.title.trim() || !form.body.trim()}
              className="w-full px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? cp('creating') : cp('publish')}
            </button>
          </div>
        )}

        {threads.length === 0 && (
          <p className="text-sm text-[var(--on-surface-variant)]">{cp('empty')}</p>
        )}
        {threads.map((thread) => (
          <button
            key={thread.id}
            onClick={() => openThread(thread)}
            className={`w-full text-left p-3 rounded-xl mb-2 transition-all ${
              active?.id === thread.id
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--surface-container-low)] hover:bg-[var(--surface-container-high)]'
            }`}
          >
            <p className="font-semibold truncate">{thread.title}</p>
            <p className="text-xs opacity-80 flex items-center gap-1 mt-1">
              <FaComment /> {thread.posts_count ?? 0}
              {thread.is_closed && (
                <span className="ml-2 flex items-center gap-1">
                  <FaLock /> {cp('closed')}
                </span>
              )}
            </p>
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
            <div className="px-5 py-4 border-b border-[var(--surface-container)] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[var(--on-surface)]">{active.title}</h3>
                <p className="text-xs text-[var(--on-surface-variant)]">
                  {active.teacher?.full_name}
                </p>
              </div>
              {active.body && (
                <p className="text-sm text-[var(--on-surface-variant)] max-w-[40%] text-right">
                  {active.body}
                </p>
              )}
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-[var(--surface-container-low)] rounded-xl px-4 py-3"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-sm text-[var(--on-surface)]">
                      {post.user?.full_name}
                    </p>
                    <p className="text-xs text-[var(--on-surface-variant)]">
                      {new Date(post.created_at).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-sm text-[var(--on-surface)]">{post.body}</p>
                </div>
              ))}
            </div>
            {!active.is_closed && (
              <div className="p-4 border-t border-[var(--surface-container)] flex gap-2">
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && post()}
                  placeholder={cp('writePlaceholder')}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
                />
                <button
                  onClick={post}
                  disabled={sending || !draft.trim()}
                  className="px-5 py-3 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 disabled:opacity-50"
                >
                  {sending ? cp('sending') : cp('send')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Forum;