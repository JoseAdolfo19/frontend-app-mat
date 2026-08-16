import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { FaPlus, FaTrash, FaEdit, FaTimes } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import { calendarApi } from '../../api/calendar';
import Loading from '../Common/Loading';
import { toArray } from '../../utils/helpers';

const TYPE_COLORS = {
  activity: 'var(--primary)',
  exam: 'var(--error)',
  holiday: 'var(--secondary)',
  meeting: 'var(--tertiary)',
};

const AcademicCalendar = () => {
  const { t } = useLanguage();
  const cp = (key) => t(`calendar.${key}`);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const fetchEvents = async (start, end) => {
    try {
      const res = await calendarApi.getEvents({
        start: start.toISOString(),
        end: end.toISOString(),
      });
      setEvents(toArray(res.data?.events));
    } catch (e) {
      toast.error(cp('loadError'));
    }
  };

  useEffect(() => {
    setLoading(true);
    const start = new Date(month.getFullYear(), month.getMonth(), 1);
    const end = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59);
    fetchEvents(start, end).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  const days = useMemo(() => {
    const year = month.getFullYear();
    const monthIdx = month.getMonth();
    const first = new Date(year, monthIdx, 1);
    const startOffset = (first.getDay() + 6) % 7;
    const totalDays = new Date(year, monthIdx + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= totalDays; d++) cells.push(d);
    return cells;
  }, [month]);

  const eventsByDay = useMemo(() => {
    const map = {};
    for (const ev of events) {
      const d = ev.start_date?.slice(0, 10);
      if (!map[d]) map[d] = [];
      map[d].push(ev);
    }
    return map;
  }, [events]);

  const changeMonth = (delta) => {
    setMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1));
  };

  const openCreate = () => {
    setEditing(null);
    const today = new Date().toISOString().slice(0, 10);
    setForm({ title: '', description: '', start_date: today, end_date: today, type: 'activity', all_day: false, is_public: false });
    setModalOpen(true);
  };

  const openEdit = (ev) => {
    setEditing(ev);
    setForm({
      title: ev.title || '',
      description: ev.description || '',
      start_date: ev.start_date?.slice(0, 10) || '',
      end_date: ev.end_date?.slice(0, 10) || '',
      type: ev.type || 'activity',
      all_day: ev.all_day || false,
      is_public: ev.is_public || false,
    });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await calendarApi.updateEvent(editing.id, form);
        toast.success(cp('updated'));
      } else {
        await calendarApi.createEvent(form);
        toast.success(cp('created'));
      }
      setModalOpen(false);
      const start = new Date(month.getFullYear(), month.getMonth(), 1);
      const end = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59);
      fetchEvents(start, end);
    } catch (err) {
      toast.error(cp('saveError'));
    }
  };

  const handleDelete = async (ev) => {
    if (!window.confirm(cp('confirmDelete'))) return;
    try {
      await calendarApi.deleteEvent(ev.id);
      toast.success(cp('deleted'));
      setEvents((list) => list.filter((x) => x.id !== ev.id));
    } catch (err) {
      toast.error(cp('deleteError'));
    }
  };

  if (loading) return <Loading />;

  const todayKey = new Date().toISOString().slice(0, 10);
  const monthLabel = month.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold capitalize">{monthLabel}</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => changeMonth(-1)} className="px-3 py-1.5 rounded-lg border border-[var(--outline)]">‹</button>
          <button onClick={() => setMonth(new Date())} className="px-3 py-1.5 rounded-lg border border-[var(--outline)] text-sm">{cp('today')}</button>
          <button onClick={() => changeMonth(1)} className="px-3 py-1.5 rounded-lg border border-[var(--outline)]">›</button>
          <button onClick={openCreate} className="px-3 py-1.5 rounded-lg bg-[var(--primary)] text-[var(--on-primary)] text-sm font-medium flex items-center gap-1">
            <FaPlus /> {cp('newEvent')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-[var(--on-surface-variant)]">
        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d, i) => (
          <div key={i} className="py-1">{d}</div>
        ))}
        {days.map((d, i) => {
          if (d === null) return <div key={i} className="min-h-24 rounded-lg bg-[var(--surface-container)]/40" />;
          const key = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const dayEvents = eventsByDay[key] || [];
          const isToday = key === todayKey;
          return (
            <div key={i} className={`min-h-24 rounded-lg p-1 border ${isToday ? 'border-[var(--primary)]' : 'border-[var(--outline-variant)]'} bg-[var(--surface)]`}>
              <div className={`text-xs font-semibold mb-1 ${isToday ? 'text-[var(--primary)]' : ''}`}>{d}</div>
              {dayEvents.slice(0, 2).map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => openEdit(ev)}
                  className="block w-full text-left text-[10px] leading-tight truncate rounded px-1 py-0.5 mb-0.5 text-white"
                  style={{ backgroundColor: TYPE_COLORS[ev.type] || 'var(--primary)' }}
                >
                  {ev.title}
                </button>
              ))}
              {dayEvents.length > 2 && <div className="text-[10px] text-[var(--on-surface-variant)]">+{dayEvents.length - 2}</div>}
            </div>
          );
        })}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-[var(--surface)] rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editing ? cp('edit') : cp('newEvent')}</h2>
              <button onClick={() => setModalOpen(false)} className="text-[var(--on-surface-variant)]"><FaTimes /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input name="title" required value={form.title} onChange={handleChange} placeholder={cp('titlePlaceholder')} className="w-full p-2.5 rounded-lg border border-[var(--outline)] bg-[var(--surface)]" />
              <textarea name="description" value={form.description} onChange={handleChange} placeholder={cp('description')} className="w-full p-2.5 rounded-lg border border-[var(--outline)] bg-[var(--surface)]" rows={2} />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-[var(--on-surface-variant)]">{cp('startDate')}</label>
                  <input type="date" name="start_date" required value={form.start_date} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-[var(--outline)] bg-[var(--surface)]" />
                </div>
                <div>
                  <label className="text-xs text-[var(--on-surface-variant)]">{cp('endDate')}</label>
                  <input type="date" name="end_date" required value={form.end_date} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-[var(--outline)] bg-[var(--surface)]" />
                </div>
              </div>
              <select name="type" value={form.type} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-[var(--outline)] bg-[var(--surface)]">
                <option value="activity">{cp('type.activity')}</option>
                <option value="exam">{cp('type.exam')}</option>
                <option value="holiday">{cp('type.holiday')}</option>
                <option value="meeting">{cp('type.meeting')}</option>
              </select>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1 text-sm">
                  <input type="checkbox" name="all_day" checked={form.all_day} onChange={handleChange} /> {cp('allDay')}
                </label>
                <label className="flex items-center gap-1 text-sm">
                  <input type="checkbox" name="is_public" checked={form.is_public} onChange={handleChange} /> {cp('isPublic')}
                </label>
              </div>
              <div className="flex items-center gap-2 pt-2">
                {editing && (
                  <button type="button" onClick={() => handleDelete(editing)} className="px-4 py-2 rounded-lg border border-[var(--error)] text-[var(--error)] text-sm flex items-center gap-1">
                    <FaTrash /> {cp('delete')}
                  </button>
                )}
                <div className="flex-1" />
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg border border-[var(--outline)] text-sm">{cp('cancel')}</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-[var(--primary)] text-[var(--on-primary)] text-sm font-medium">{cp('save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicCalendar;