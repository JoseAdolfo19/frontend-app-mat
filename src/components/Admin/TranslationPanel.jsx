import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FaSave, FaPlus, FaTrash, FaSearch } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import { translationsApi } from '../../api/translations';
import Loading from '../Common/Loading';

const LOCALES = ['es', 'en', 'qu'];

const TranslationPanel = () => {
  const { t } = useLanguage();
  const cp = (key) => t(`admin.translations.${key}`);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [locale, setLocale] = useState('');
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ key: '', locale: 'es', value: '' });

  const fetchRows = async () => {
    setLoading(true);
    try {
      const res = await translationsApi.getAdmin({
        search,
        locale: locale || undefined,
        per_page: 50,
        page,
      });
      setRows(res.data?.translations || []);
      setTotal(res.data?.total || 0);
    } catch (e) {
      toast.error(cp('loadError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, locale, page]);

  const handleChange = (row, value) => {
    setRows((list) => list.map((r) => (r.id === row.id ? { ...r, value } : r)));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const items = rows
        .filter((r) => r.dirty === undefined || r.dirty)
        .map((r) => ({ key: r.key, locale: r.locale, value: r.value }));
      if (items.length) {
        const res = await translationsApi.bulkUpdate(items);
        toast.success(cp('saved', res.data?.updated ?? ''));
      }
      fetchRows();
    } catch (e) {
      toast.error(cp('saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleNew = async (e) => {
    e.preventDefault();
    try {
      await translationsApi.create(newForm);
      toast.success(cp('created'));
      setShowNew(false);
      setNewForm({ key: '', locale: 'es', value: '' });
      fetchRows();
    } catch (err) {
      toast.error(cp('saveError'));
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(cp('confirmDelete'))) return;
    try {
      await translationsApi.remove(row.id);
      toast.success(cp('deleted'));
      fetchRows();
    } catch (err) {
      toast.error(cp('deleteError'));
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / 50));

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">{cp('title')}</h1>
        <button onClick={() => setShowNew((v) => !v)} className="px-4 py-2 rounded-lg bg-[var(--primary)] text-[var(--on-primary)] text-sm font-medium flex items-center gap-1">
          <FaPlus /> {cp('newTranslation')}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-48">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)]" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={cp('search')}
            className="w-full pl-9 p-2.5 rounded-lg border border-[var(--outline)] bg-[var(--surface)]"
          />
        </div>
        <select value={locale} onChange={(e) => { setLocale(e.target.value); setPage(1); }} className="p-2.5 rounded-lg border border-[var(--outline)] bg-[var(--surface)]">
          <option value="">{cp('allLocales')}</option>
          {LOCALES.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <button onClick={handleSave} disabled={saving} className="px-4 py-2.5 rounded-lg bg-[var(--primary)] text-[var(--on-primary)] text-sm font-medium flex items-center gap-1 disabled:opacity-50">
          <FaSave /> {cp('saveAll')}
        </button>
      </div>

      {showNew && (
        <form onSubmit={handleNew} className="p-4 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface)] space-y-2">
          <input required value={newForm.key} onChange={(e) => setNewForm({ ...newForm, key: e.target.value })} placeholder={cp('keyPlaceholder')} className="w-full p-2.5 rounded-lg border border-[var(--outline)] bg-[var(--surface)]" />
          <div className="flex gap-2">
            <select value={newForm.locale} onChange={(e) => setNewForm({ ...newForm, locale: e.target.value })} className="p-2.5 rounded-lg border border-[var(--outline)] bg-[var(--surface)]">
              {LOCALES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            <input required value={newForm.value} onChange={(e) => setNewForm({ ...newForm, value: e.target.value })} placeholder={cp('valuePlaceholder')} className="flex-1 p-2.5 rounded-lg border border-[var(--outline)] bg-[var(--surface)]" />
            <button type="submit" className="px-4 py-2.5 rounded-lg bg-[var(--primary)] text-[var(--on-primary)] text-sm">{cp('create')}</button>
          </div>
        </form>
      )}

      {loading ? (
        <Loading />
      ) : (
        <div className="rounded-xl border border-[var(--outline-variant)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--surface-container)]/50 text-left text-[var(--on-surface-variant)]">
                <th className="p-3 font-medium">{cp('colKey')}</th>
                <th className="p-3 font-medium">{cp('colLocale')}</th>
                <th className="p-3 font-medium">{cp('colValue')}</th>
                <th className="p-3 font-medium w-10"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-[var(--outline-variant)]">
                  <td className="p-3 font-mono text-xs break-all">{row.key}</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded bg-[var(--surface-container)] text-xs">{row.locale}</span></td>
                  <td className="p-3">
                    <input
                      value={row.value}
                      onChange={(e) => handleChange(row, e.target.value)}
                      className="w-full p-1.5 rounded-lg border border-[var(--outline)] bg-[var(--surface)]"
                    />
                  </td>
                  <td className="p-3">
                    <button onClick={() => handleDelete(row)} className="text-[var(--error)]"><FaTrash /></button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={4} className="p-6 text-center text-[var(--on-surface-variant)]">{cp('noResults')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 rounded-lg border border-[var(--outline)] disabled:opacity-40">‹</button>
          <span className="text-sm">{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 rounded-lg border border-[var(--outline)] disabled:opacity-40">›</button>
        </div>
      )}
    </div>
  );
};

export default TranslationPanel;