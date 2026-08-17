import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  FaGamepad, FaPlay, FaArrowLeft, FaUpload, FaCheck, FaTrophy, FaClock,
} from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { gamesApi } from '../../api/games';
import Loading from '../Common/Loading';
import { toArray } from '../../utils/helpers';

const StudentGames = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const gp = (key) => t(`studentGames.${key}`);
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState([]);
  const [selected, setSelected] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [score, setScore] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    gamesApi
      .getGames()
      .then((res) => setGames(toArray(res.data)))
      .catch(() => toast.error(gp('loadError')))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openGame = async (game) => {
    setSelected(game);
    setSubmission(null);
    setScore('');
    setScreenshot(null);
    setPreview(null);
    try {
      const res = await gamesApi.getGame(game.id);
      const mine = toArray(res.data.submissions).find((s) => s.student_id === user?.id);
      setSubmission(mine || null);
      if (mine?.score) setScore(mine.score);
    } catch (e) {
      toast.error(gp('loadError'));
    }
  };

  const pickFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshot(file);
    setPreview(URL.createObjectURL(file));
  };

  const uploadScreenshot = async () => {
    if (!screenshot) return screenshot == null ? '' : '';
    setUploading(true);
    try {
      const res = await gamesApi.uploadScreenshot(selected.id, screenshot);
      return res.data?.url || '';
    } catch (e) {
      toast.error(gp('uploadError'));
      return '';
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!score.trim() && !screenshot) {
      toast.error(gp('requireScore'));
      return;
    }
    setSubmitting(true);
    try {
      let url = '';
      if (screenshot) {
        url = await uploadScreenshot();
        if (!url && screenshot) {
          setSubmitting(false);
          return;
        }
      }
      const res = await gamesApi.submitGame(selected.id, { score: score.trim(), screenshot_url: url || null });
      setSubmission(res.data);
      toast.success(gp('submitSuccess'));
    } catch (e) {
      toast.error(gp('submitError'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  // ---- Detalle de juego: iframe + comprobante ----
  if (selected) {
    const status = submission?.status;
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelected(null)}
            className="p-2 rounded-lg bg-[var(--surface-container-low)] hover:bg-[var(--surface-container-high)] text-[var(--on-surface-variant)]"
            aria-label={gp('back')}
          >
            <FaArrowLeft />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-[var(--on-surface)]">{selected.title}</h2>
            <p className="text-sm text-[var(--on-surface-variant)]">{selected.course?.name}</p>
          </div>
          {status && (
            <span className={`ml-auto text-xs font-bold px-3 py-1 rounded-full ${
              status === 'approved' ? 'bg-green-100 text-green-700' :
              status === 'rejected' ? 'bg-red-100 text-red-600' :
              'bg-[var(--surface-container-high)] text-[var(--on-surface-variant)]'
            }`}>
              {gp(`status.${status}`)}
            </span>
          )}
        </div>

        {selected.pin && (
          <div className="bg-[var(--primary)]/10 rounded-2xl p-4 text-center">
            <p className="text-sm text-[var(--on-surface-variant)]">{gp('pinLabel')}</p>
            <p className="text-4xl font-black tracking-[0.3em] text-[var(--primary)]">{selected.pin}</p>
          </div>
        )}

        {selected.url ? (
          <div className="rounded-2xl overflow-hidden shadow-sm border border-[var(--surface-container)]">
            <div className="flex items-center gap-2 px-4 py-2 bg-[var(--surface-container-low)]">
              <FaPlay className="text-[var(--primary)] text-xs" />
              <span className="text-xs font-bold text-[var(--on-surface-variant)]">{gp('playingNow')}</span>
            </div>
            <iframe
              src={selected.url}
              title={selected.title}
              width="100%"
              height="600"
              style={{ border: 'none', borderRadius: '0 0 8px 8px' }}
              allow="fullscreen; autoplay; encrypted-media"
            />
          </div>
        ) : (
          <div className="bg-[var(--surface)] rounded-2xl p-8 text-center shadow-sm border border-[var(--surface-container)]">
            <FaGamepad className="mx-auto text-4xl text-[var(--primary)] mb-2" />
            <p className="font-bold text-[var(--on-surface)]">{gp('joinWithPin')}</p>
            <p className="text-sm text-[var(--on-surface-variant)]">{gp('enterPinHint')}</p>
            <a
              href="https://quizizz.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-[var(--primary)] text-white rounded-xl font-bold hover:opacity-90"
            >
              <FaPlay /> {gp('openExternal')}
            </a>
          </div>
        )}

        {/* Comprobante de puntaje */}
        <div className="bg-[var(--surface)] rounded-2xl p-6 shadow-sm border border-[var(--surface-container)]">
          <h3 className="font-bold text-lg text-[var(--on-surface)] flex items-center gap-2">
            <FaTrophy className="text-[var(--primary)]" /> {gp('submitTitle')}
          </h3>
          <p className="text-sm text-[var(--on-surface-variant)] mt-1">{gp('submitHint')}</p>

          {status === 'approved' ? (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <FaCheck className="mx-auto text-3xl text-green-600 mb-1" />
              <p className="font-bold text-green-700">{gp('approvedMsg')}</p>
              {submission.grade !== null && submission.grade !== undefined && (
                <p className="text-sm text-green-600 mt-1">{gp('grade')}: {submission.grade}</p>
              )}
              {submission.xp_awarded > 0 && (
                <p className="font-bold text-green-700 mt-1">+{submission.xp_awarded} XP</p>
              )}
            </div>
          ) : status === 'rejected' ? (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="font-bold text-red-600">{gp('rejectedMsg')}</p>
              {submission.teacher_feedback && (
                <p className="text-sm text-red-500 mt-1">{submission.teacher_feedback}</p>
              )}
              <button
                onClick={() => setSubmission(null)}
                className="mt-3 px-4 py-2 bg-[var(--primary)] text-white rounded-xl font-bold"
              >
                {gp('resubmit')}
              </button>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <input
                type="text"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder={gp('scorePlaceholder')}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
              />
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-[var(--surface-container-high)] rounded-xl p-4 text-center cursor-pointer hover:border-[var(--primary)]"
              >
                <input ref={fileRef} type="file" accept="image/*" onChange={pickFile} className="hidden" />
                {preview ? (
                  <img src={preview} alt={gp('screenshot')} className="mx-auto max-h-40 rounded-lg" />
                ) : (
                  <p className="text-sm text-[var(--on-surface-variant)] flex items-center justify-center gap-2">
                    <FaUpload /> {gp('uploadHint')}
                  </p>
                )}
              </div>
              <button
                onClick={submit}
                disabled={submitting || uploading || (!score.trim() && !screenshot)}
                className="w-full px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50"
              >
                {submitting || uploading ? gp('sending') : gp('submitBtn')}
              </button>
              {status === 'pending' && (
                <p className="text-center text-xs text-[var(--on-surface-variant)] flex items-center justify-center gap-1">
                  <FaClock className="text-xs" /> {gp('pendingMsg')}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---- Vista principal: lista de juegos ----
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--on-surface)]">{gp('title')}</h2>
        <p className="text-[var(--on-surface-variant)]">{gp('subtitle')}</p>
      </div>

      {games.length === 0 ? (
        <div className="bg-[var(--surface)] rounded-2xl p-10 text-center shadow-sm border border-[var(--surface-container)]">
          <FaGamepad className="mx-auto text-4xl text-[var(--on-surface-variant)] mb-3" />
          <p className="text-[var(--on-surface-variant)]">{gp('noGames')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => openGame(game)}
              className="bg-[var(--surface)] rounded-2xl p-6 text-left shadow-sm border border-[var(--surface-container)] hover:border-[var(--primary)] hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center mb-3 text-[var(--primary)]">
                <FaGamepad />
              </div>
              <h3 className="font-bold text-lg text-[var(--on-surface)] group-hover:text-[var(--primary)]">
                {game.title}
              </h3>
              <p className="text-sm text-[var(--on-surface-variant)] mt-1">{game.course?.name}</p>
              {game.pin && (
                <p className="text-xs font-bold text-[var(--primary)] mt-2">{gp('pinLabel')}: {game.pin}</p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentGames;