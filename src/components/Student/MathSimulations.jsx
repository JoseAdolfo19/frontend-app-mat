import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { FaPlay, FaStop } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';

const PRESETS = [
  { id: 'linear', label: 'f(x) = 2x + 1', fn: (x) => 2 * x + 1, color: '#3B82F6' },
  { id: 'quadratic', label: 'f(x) = x² − 4x + 3', fn: (x) => x * x - 4 * x + 3, color: '#10B981' },
  { id: 'cubic', label: 'f(x) = x³ − 3x', fn: (x) => x * x * x - 3 * x, color: '#F59E0B' },
  { id: 'sin', label: 'f(x) = sen(x)', fn: (x) => Math.sin(x), color: '#EF4444' },
  { id: 'cos', label: 'f(x) = cos(x)', fn: (x) => Math.cos(x), color: '#8B5CF6' },
  { id: 'sqrt', label: 'f(x) = √x', fn: (x) => (x >= 0 ? Math.sqrt(x) : null), color: '#06B6D4' },
  { id: 'abs', label: 'f(x) = |x|', fn: (x) => Math.abs(x), color: '#EC4899' },
  { id: 'log', label: 'f(x) = ln(x)', fn: (x) => (x > 0 ? Math.log(x) : null), color: '#84CC16' },
  { id: 'exp', label: 'f(x) = eˣ', fn: (x) => Math.exp(x), color: '#F97316' },
];

const MathSimulations = () => {
  const { t } = useLanguage();
  const sp = (key) => t(`simulations.${key}`);
  const [selected, setSelected] = useState('quadratic');
  const [range, setRange] = useState({ min: -10, max: 10, points: 200 });
  const [animating, setAnimating] = useState(false);

  const preset = PRESETS.find((p) => p.id === selected);

  const data = useMemo(() => {
    const pts = [];
    const step = (range.max - range.min) / range.points;
    for (let i = 0; i <= range.points; i++) {
      const x = range.min + i * step;
      const y = preset.fn(x);
      if (y === null || Math.abs(y) > 1000) {
        pts.push({ x, y: null });
      } else {
        pts.push({ x, y: Number(y.toFixed(4)) });
      }
    }
    return pts;
  }, [selected, range, preset]);

  const handleAnimate = () => {
    setAnimating(true);
    let v = range.min;
    const id = setInterval(() => {
      v += 0.5;
      if (v > range.max) {
        clearInterval(id);
        setAnimating(false);
        return;
      }
      const next = { ...range };
      // barrido animado: amplía el rango hacia la derecha
      setRange({ min: next.min, max: v, points: 200 });
    }, 40);
    // cleanup guard
    window.__animInterval = id;
  };

  const stopAnimate = () => {
    if (window.__animInterval) clearInterval(window.__animInterval);
    setAnimating(false);
  };

  const handlePreset = (id) => {
    if (animating) stopAnimate();
    setSelected(id);
    setRange({ min: -10, max: 10, points: 200 });
  };

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">{sp('title')}</h1>
      <p className="text-sm text-[var(--on-surface-variant)]">{sp('description')}</p>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => handlePreset(p.id)}
            className={`px-3 py-1.5 rounded-lg border text-sm ${
              selected === p.id
                ? 'bg-[var(--primary)] text-[var(--on-primary)] border-[var(--primary)]'
                : 'border-[var(--outline)] hover:bg-[var(--surface-container)]'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface)] p-4">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--outline-variant)" />
            <XAxis dataKey="x" type="number" domain={['dataMin', 'dataMax']} stroke="var(--on-surface-variant)" />
            <YAxis domain={['auto', 'auto']} stroke="var(--on-surface-variant)" />
            <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--outline-variant)' }} />
            <ReferenceLine x={0} stroke="var(--outline)" />
            <ReferenceLine y={0} stroke="var(--outline)" />
            <Line type="monotone" dataKey="y" stroke={preset.color} strokeWidth={2.5} dot={false} connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-[var(--on-surface-variant)]">{sp('min')}</label>
          <input
            type="number"
            value={range.min}
            onChange={(e) => setRange({ ...range, min: Number(e.target.value) })}
            className="w-24 p-2 rounded-lg border border-[var(--outline)] bg-[var(--surface)]"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-[var(--on-surface-variant)]">{sp('max')}</label>
          <input
            type="number"
            value={range.max}
            onChange={(e) => setRange({ ...range, max: Number(e.target.value) })}
            className="w-24 p-2 rounded-lg border border-[var(--outline)] bg-[var(--surface)]"
          />
        </div>
        <div className="flex-1" />
        {animating ? (
          <button onClick={stopAnimate} className="px-4 py-2 rounded-lg border border-[var(--error)] text-[var(--error)] text-sm flex items-center gap-1">
            <FaStop /> {sp('stop')}
          </button>
        ) : (
          <button onClick={handleAnimate} className="px-4 py-2 rounded-lg bg-[var(--primary)] text-[var(--on-primary)] text-sm font-medium flex items-center gap-1">
            <FaPlay /> {sp('animate')}
          </button>
        )}
      </div>
    </div>
  );
};

export default MathSimulations;