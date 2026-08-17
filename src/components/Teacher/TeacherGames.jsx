import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  FaGamepad, FaPlus, FaTrash, FaEdit, FaArrowLeft, FaPlay, FaClipboardCheck,
  FaCheck, FaTimes, FaTrophy, FaBook,
} from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import { gamesApi } from '../../api/games';
import Loading from '../Common/Loading';
import { toArray } from '../../utils/helpers';

const TeacherGames = () => {
  const { t } = useLanguage();
  const gp = (key) => t(`teacherGames.${key}`);
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ course_id: '', title: '', url: '', pin: '', description: '', platform: 'quizizz' });
  const [selectedGame, setSelectedGame] = useState(null);

  useEffect(() => {
    Promise.all([gamesApi.getGames(), gamesApi.getTeacherCourses()])
      .then(([gRes, cRes]) => {
        setGames(toArray(gRes.data));
        setCourses(toArray(cRes.data));
      })
      .catch(() => toast.error(gp('loadError')))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () =>
    setForm({ course_id: '', title: '', url: '', pin: '', description: '', platform: 'quizizz' });

  const saveGame = async () => {
    if (!form.course_id || !form.title.trim()) return;
    try {
      if (editing) {
        await gamesApi.updateGame(editing, form);
        toast.success(gp('updateSuccess'));
      } else {
        await gamesApi.createGame(form);
        toast.success(gp('createSuccess'));
      }
      setShowCreate(false);
      setEditing(null);
      resetForm();
      const res = await gamesApi.getGames();
      setGames(toArray(res.data));
    } catch (e) {
      toast.error(gp('saveError'));
    }
  };

  const deleteGame = async (id) => {
    if (!window.confirm(gp('confirmDelete'))) return;
    try {
      await gamesApi.deleteGame(id);
      setGames((prev) => prev.filter((g) => g.id !== id));
      toast.success(gp('deleteSuccess'));
    } catch (e) {
      toast.error(gp('deleteError'));
    }
  };

  const startEdit = (game) => {
    setEditing(game.id);
    setForm({
      course_id: game.course_id,
      title: game.title,
      url: game.url || '',
      pin: game.pin || '',
      description: game.description || '',
      platform: game.platform || 'quizizz',
    });
    setShowCreate(true);
  };

  const platformIcon = (p) => (p === 'kahoot' ? 'Kahoot' : p === 'h5p' ? 'H5P' : 'Quizizz');

  if (loading) return <Loading />;

  // ---- Detalle de un juego: comprobantes ----
  if (selectedGame) {
    const submissions = toArray(selectedGame.submissions);
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedGame(null)}
            className="p-2 rounded-lg bg-[var(--surface-container-low)] hover:bg-[var(--surface-container-high)] text-[var(--on-surface-variant)]"
            aria-label={gp('back')}
          >
            <FaArrowLeft />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-[var(--on-surface)]">{selectedGame.title}</h2>
            <p className="text-sm text-[var(--on-surface-variant)]">
              {selectedGame.course?.name} · {platformIcon(selectedGame.platform)}
            </p>
          </div>
        </div>

        {selectedGame.url && (
          <a
            href={selectedGame.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-xl font-bold hover:opacity-90"
          >
            <FaPlay /> {gp('openGame')}
          </a>
        )}
        {selectedGame.pin && (
          <p className="text-sm text-[var(--on-surface-variant)]">
            {gp('pinLabel')}: <strong className="text-[var(--primary)]">{selectedGame.pin}</strong>
          </p>
        )}

        <h3 className="font-bold text-xl text-[var(--on-surface)] mt-4">
          {gp('submissions')} ({submissions.length})
        </h3>

        {submissions.length === 0 ? (
          <div className="bg-[var(--surface)] rounded-2xl p-10 text-center shadow-sm border border-[var(--surface-container)]">
            <FaClipboardCheck className="mx-auto text-4xl text-[var(--on-surface-variant)] mb-3" />
            <p className="text-[var(--on-surface-variant)]">{gp('noSubmissions')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((s) => (
              <SubmissionCard key={s.id} submission={s} onReload={async () => {
                const res = await gamesApi.getGame(selectedGame.id);
                setSelectedGame(res.data);
              }} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ---- Vista principal: lista de juegos ----
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--on-surface)]">{gp('title')}</h2>
          <p className="text-[var(--on-surface-variant)]">{gp('subtitle')}</p>
        </div>
        <button
          onClick={() => { setShowCreate((v) => !v); setEditing(null); resetForm(); }}
          className="px-4 py-2 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 flex items-center gap-2 font-bold"
        >
          <FaPlus /> {gp('createGame')}
        </button>
      </div>

      {showCreate && (
        <div className="bg-[var(--surface)] rounded-2xl p-5 shadow-sm border border-[var(--surface-container)] space-y-3">
          <h3 className="font-bold text-[var(--on-surface)]">{editing ? gp('editGame') : gp('newGame')}</h3>
          <select
            value={form.course_id}
            onChange={(e) => setForm((f) => ({ ...f, course_id: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
          >
            <option value="">{gp('selectCourse')}</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.salon?.grade} "{c.salon?.section}"{c.salon?.section ? '' : ''})
              </option>
            ))}
          </select>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder={gp('titlePlaceholder')}
            className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
          />
          <input
            type="text"
            value={form.url}
            onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
            placeholder={gp('urlPlaceholder')}
            className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
          />
          <input
            type="text"
            value={form.pin}
            onChange={(e) => setForm((f) => ({ ...f, pin: e.target.value }))}
            placeholder={gp('pinPlaceholder')}
            className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
          />
          <select
            value={form.platform}
            onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
          >
            <option value="quizizz">Quizizz</option>
            <option value="kahoot">Kahoot!</option>
            <option value="h5p">H5P</option>
            <option value="other">{gp('other')}</option>
          </select>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder={gp('descriptionPlaceholder')}
            rows={2}
            className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
          />
          <button
            onClick={saveGame}
            disabled={!form.course_id || !form.title.trim()}
            className="px-6 py-3 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 disabled:opacity-50 font-bold"
          >
            {editing ? gp('updateBtn') : gp('createBtn')}
          </button>
        </div>
      )}

      {games.length === 0 ? (
        <div className="bg-[var(--surface)] rounded-2xl p-10 text-center shadow-sm border border-[var(--surface-container)]">
          <FaGamepad className="mx-auto text-4xl text-[var(--on-surface-variant)] mb-3" />
          <p className="text-[var(--on-surface-variant)]">{gp('noGames')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((game) => (
            <div
              key={game.id}
              className="bg-[var(--surface)] rounded-2xl p-6 shadow-sm border border-[var(--surface-container)] hover:shadow-md transition-all"
            >
              <button onClick={() => setSelectedGame(game)} className="text-left w-full">
                <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center mb-3 text-[var(--primary)]">
                  <FaGamepad />
                </div>
                <h3 className="font-bold text-lg text-[var(--on-surface)]">{game.title}</h3>
                <p className="text-sm text-[var(--on-surface-variant)] mt-1 flex items-center gap-1">
                  <FaBook className="text-xs" /> {game.course?.name}
                </p>
                <span className="inline-block mt-2 text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
                  {platformIcon(game.platform)}
                </span>
              </button>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => startEdit(game)}
                  className="p-2 bg-[var(--surface-container-low)] text-[var(--primary)] rounded-lg hover:bg-[var(--surface-container-high)]"
                  aria-label={gp('edit')}
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => deleteGame(game.id)}
                  className="p-2 bg-[var(--surface-container-low)] text-[var(--error)] rounded-lg hover:bg-[var(--surface-container-high)]"
                  aria-label={gp('delete')}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SubmissionCard = ({ submission, onReload }) => {
  const { t } = useLanguage();
  const gp = (key) => t(`teacherGames.${key}`);
  const [grade, setGrade] = useState(submission.grade ?? '');
  const [feedback, setFeedback] = useState(submission.teacher_feedback ?? '');
  const [busy, setBusy] = useState(false);

  const gradeIt = async (status) => {
    if (status === 'approved' && !grade) {
      toast.error(gp('gradeRequired'));
      return;
    }
    setBusy(true);
    try {
      await gamesApi.gradeSubmission(submission.id, {
        status,
        grade: status === 'approved' ? grade : null,
        teacher_feedback: feedback,
      });
      toast.success(status === 'approved' ? gp('approved') : gp('rejected'));
      onReload();
    } catch (e) {
      toast.error(gp('gradeError'));
    } finally {
      setBusy(false);
    }
  };

  const statusBadge = {
    pending: 'bg-[var(--surface-container-high)] text-[var(--on-surface-variant)]',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-600',
  }[submission.status];

  return (
    <div className="bg-[var(--surface)] rounded-2xl p-5 shadow-sm border border-[var(--surface-container)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center text-[var(--primary)]">
            <FaTrophy />
          </div>
          <div>
            <p className="font-bold text-[var(--on-surface)]">{submission.student?.full_name}</p>
            {submission.score && <p className="text-sm text-[var(--on-surface-variant)]">{gp('score')}: {submission.score}</p>}
          </div>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusBadge}`}>
          {gp(`status.${submission.status}`)}
        </span>
      </div>

      {submission.screenshot_url && (
        <a
          href={submission.screenshot_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 block"
        >
          <img
            src={submission.screenshot_url}
            alt={gp('screenshot')}
            className="w-full max-h-40 object-cover rounded-xl border border-[var(--surface-container-high)]"
          />
        </a>
      )}

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="number"
          min="0"
          max="20"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          placeholder={gp('gradePlaceholder')}
          className="px-4 py-2.5 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
        />
        <input
          type="text"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder={gp('feedbackPlaceholder')}
          className="px-4 py-2.5 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
        />
      </div>

      <div className="flex gap-2 mt-3">
        <button
          onClick={() => gradeIt('approved')}
          disabled={busy}
          className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
        >
          <FaCheck /> {gp('approve')}
        </button>
        <button
          onClick={() => gradeIt('rejected')}
          disabled={busy}
          className="px-4 py-2 bg-[var(--surface-container-low)] text-[var(--error)] rounded-lg font-bold hover:bg-[var(--surface-container-high)] disabled:opacity-50 flex items-center gap-1"
        >
          <FaTimes /> {gp('reject')}
        </button>
      </div>

      {submission.xp_awarded > 0 && (
        <p className="mt-3 text-sm font-bold text-[var(--primary)]">
          +{submission.xp_awarded} XP
        </p>
      )}
    </div>
  );
};

export default TeacherGames;