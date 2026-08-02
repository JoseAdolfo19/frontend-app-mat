import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const SUBJECT_COLORS = [
  'var(--primary)',
  'var(--secondary)',
  'var(--tertiary)',
  '#e74c3c',
  '#2ecc71',
  '#f39c12',
  '#9b59b6',
  '#1abc9c',
];

const CompetencyEvolution = ({ data = [], title, height = 300 }) => {
  const { t, lang } = useLanguage();
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(600);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return { subjects: [], points: {}, dates: [], minScore: 0, maxScore: 20 };

    const subjects = [...new Set(data.map((d) => d.subject))];
    const dates = [...new Set(data.map((d) => d.date))].sort();
    const points = {};

    subjects.forEach((subject) => {
      points[subject] = dates.map((date) => {
        const entry = data.find((d) => d.date === date && d.subject === subject);
        return entry ? entry.score : null;
      });
    });

    const scores = data.map((d) => d.score).filter((s) => s !== null && s !== undefined);
    const minScore = Math.max(0, Math.floor(Math.min(...scores)) - 1);
    const maxScore = Math.min(20, Math.ceil(Math.max(...scores)) + 1);

    return { subjects, points, dates, minScore, maxScore };
  }, [data]);

  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = containerWidth - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const scaleX = (index) => {
    if (chartData.dates.length <= 1) return chartWidth / 2;
    return (index / (chartData.dates.length - 1)) * chartWidth;
  };

  const scaleY = (score) => {
    if (chartData.maxScore === chartData.minScore) return chartHeight / 2;
    return chartHeight - ((score - chartData.minScore) / (chartData.maxScore - chartData.minScore)) * chartHeight;
  };

  const buildPath = (values) => {
    const validPoints = values
      .map((v, i) => (v !== null ? { x: scaleX(i), y: scaleY(v) } : null))
      .filter(Boolean);

    if (validPoints.length === 0) return '';
    return validPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  };

  const yTicks = useMemo(() => {
    const ticks = [];
    const range = chartData.maxScore - chartData.minScore;
    const step = range <= 5 ? 1 : range <= 10 ? 2 : 5;
    for (let v = chartData.minScore; v <= chartData.maxScore; v += step) {
      ticks.push(v);
    }
    return ticks;
  }, [chartData.minScore, chartData.maxScore]);

  if (!data || data.length === 0) {
    return (
      <div
        ref={containerRef}
        className="w-full bg-[var(--surface-container-low)] rounded-xl flex items-center justify-center"
        style={{ height }}
      >
        <p className="text-[var(--on-surface-variant)]">{t('common.noData')}</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full">
      {title && (
        <h4 className="text-sm font-bold text-[var(--on-surface-variant)] mb-2">{title}</h4>
      )}
      <svg
        width={containerWidth}
        height={height}
        viewBox={`0 0 ${containerWidth} ${height}`}
        className="overflow-visible"
      >
        <g transform={`translate(${padding.left}, ${padding.top})`}>
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={0}
                y1={scaleY(tick)}
                x2={chartWidth}
                y2={scaleY(tick)}
                stroke="var(--outline-variant)"
                strokeDasharray="4 4"
                opacity={0.3}
              />
              <text
                x={-8}
                y={scaleY(tick) + 4}
                textAnchor="end"
                fill="var(--on-surface-variant)"
                fontSize={11}
              >
                {tick}
              </text>
            </g>
          ))}

          {chartData.dates.map((date, i) => (
            <g key={date}>
              <line
                x1={scaleX(i)}
                y1={0}
                x2={scaleX(i)}
                y2={chartHeight}
                stroke="var(--outline-variant)"
                opacity={0.1}
              />
              <text
                x={scaleX(i)}
                y={chartHeight + 20}
                textAnchor="middle"
                fill="var(--on-surface-variant)"
                fontSize={10}
              >
                {date}
              </text>
            </g>
          ))}

          {chartData.subjects.map((subject, sIndex) => {
            const color = SUBJECT_COLORS[sIndex % SUBJECT_COLORS.length];
            const values = chartData.points[subject];
            const path = buildPath(values);
            const validPoints = values
              .map((v, i) => (v !== null ? { x: scaleX(i), y: scaleY(v), score: v } : null))
              .filter(Boolean);

            return (
              <g key={subject}>
                {path && (
                  <path
                    d={path}
                    fill="none"
                    stroke={color}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                {validPoints.map((p, pIndex) => (
                  <g key={pIndex}>
                    <circle cx={p.x} cy={p.y} r={4} fill={color} stroke="white" strokeWidth={2} />
                    <title>{`${subject}: ${p.score}`}</title>
                  </g>
                ))}
              </g>
            );
          })}
        </g>
      </svg>

      <div className="flex flex-wrap gap-4 mt-3 justify-center">
        {chartData.subjects.map((subject, sIndex) => (
          <div key={subject} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: SUBJECT_COLORS[sIndex % SUBJECT_COLORS.length] }}
            />
            <span className="text-xs font-medium text-[var(--on-surface-variant)]">{subject}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompetencyEvolution;
