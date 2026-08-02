import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import toast from 'react-hot-toast';

const PRESETS = [
  {
    name: 'Predeterminado',
    colors: {
      primary_color: '#004AC6',
      secondary_color: '#006C49',
      tertiary_color: '#996100',
      background_color: '#f8f9ff',
      surface_color: '#ffffff'
    }
  },
  {
    name: 'Escala de Grises',
    colors: {
      primary_color: '#616161',
      secondary_color: '#757575',
      tertiary_color: '#9e9e9e',
      background_color: '#f5f5f5',
      surface_color: '#ffffff'
    }
  },
  {
    name: 'Cálido',
    colors: {
      primary_color: '#c65100',
      secondary_color: '#b8860b',
      tertiary_color: '#8b4513',
      background_color: '#fff8f0',
      surface_color: '#ffffff'
    }
  },
  {
    name: 'Océano',
    colors: {
      primary_color: '#0077b6',
      secondary_color: '#0096c7',
      tertiary_color: '#00b4d8',
      background_color: '#f0f8ff',
      surface_color: '#ffffff'
    }
  },
];

const ColorSettings = () => {
  const { 
    primaryColor, 
    secondaryColor, 
    tertiaryColor,
    backgroundColor,
    surfaceColor,
    updateColors 
  } = useTheme();
  const { t } = useLanguage();

  const [colors, setColors] = useState({
    primary_color: primaryColor,
    secondary_color: secondaryColor,
    tertiary_color: tertiaryColor,
    background_color: backgroundColor,
    surface_color: surfaceColor
  });

  const [loading, setLoading] = useState(false);

  const cp = (key) => t(`admin.colorsPage.${key}`);

  const handleChange = (e) => {
    setColors({
      ...colors,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await updateColors(colors);
    setLoading(false);
    
    if (result.success) {
      toast.success(cp('successSave'));
    } else {
      toast.error(cp('errorSave'));
    }
  };

  const resetColors = async () => {
    const defaultColors = {
      primary_color: '#004AC6',
      secondary_color: '#006C49',
      tertiary_color: '#996100',
      background_color: '#f8f9ff',
      surface_color: '#ffffff'
    };
    setColors(defaultColors);
    setLoading(true);
    const result = await updateColors(defaultColors);
    setLoading(false);

    if (result.success) {
      toast.success(cp('successSave'));
    } else {
      toast.error(cp('errorSave'));
    }
  };

  return (
    <div className="bg-[var(--surface)] rounded-xl p-8 shadow-lg">
      <h3 className="text-2xl font-bold text-[var(--on-surface)] mb-6">
        {cp('title')}
      </h3>
      <p className="text-[var(--on-surface-variant)] mb-8">
        {cp('subtitle')}
      </p>

      <div className="mb-8">
        <h4 className="text-sm font-medium text-[var(--on-surface-variant)] mb-3">
          {cp('presets') || 'Plantillas de colores'}
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => setColors(preset.colors)}
              className="p-3 rounded-xl border-2 border-[var(--outline-variant)] hover:border-[var(--primary)] transition-all text-left"
            >
              <div className="flex gap-1 mb-2">
                {['primary_color', 'secondary_color', 'tertiary_color'].map((key) => (
                  <div
                    key={key}
                    className="w-5 h-5 rounded-full border border-[var(--outline-variant)]"
                    style={{ backgroundColor: preset.colors[key] }}
                  />
                ))}
              </div>
              <p className="text-xs font-medium text-[var(--on-surface)]">{preset.name}</p>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="color-primary" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-2">
              {cp('primary')}
            </label>
            <div className="flex items-center gap-4">
              <input
                id="color-primary"
                type="color"
                name="primary_color"
                value={colors.primary_color}
                onChange={handleChange}
                className="w-16 h-16 rounded-lg cursor-pointer border-2 border-[var(--outline-variant)]"
              />
              <input
                type="text"
                name="primary_color"
                value={colors.primary_color}
                onChange={handleChange}
                className="flex-1 px-4 py-2 rounded-lg border-2 border-[var(--outline-variant)] bg-[var(--surface-container-low)] text-[var(--on-surface)]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="color-secondary" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-2">
              {cp('secondary')}
            </label>
            <div className="flex items-center gap-4">
              <input
                id="color-secondary"
                type="color"
                name="secondary_color"
                value={colors.secondary_color}
                onChange={handleChange}
                className="w-16 h-16 rounded-lg cursor-pointer border-2 border-[var(--outline-variant)]"
              />
              <input
                type="text"
                name="secondary_color"
                value={colors.secondary_color}
                onChange={handleChange}
                className="flex-1 px-4 py-2 rounded-lg border-2 border-[var(--outline-variant)] bg-[var(--surface-container-low)] text-[var(--on-surface)]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="color-tertiary" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-2">
              {cp('tertiary')}
            </label>
            <div className="flex items-center gap-4">
              <input
                id="color-tertiary"
                type="color"
                name="tertiary_color"
                value={colors.tertiary_color}
                onChange={handleChange}
                className="w-16 h-16 rounded-lg cursor-pointer border-2 border-[var(--outline-variant)]"
              />
              <input
                type="text"
                name="tertiary_color"
                value={colors.tertiary_color}
                onChange={handleChange}
                className="flex-1 px-4 py-2 rounded-lg border-2 border-[var(--outline-variant)] bg-[var(--surface-container-low)] text-[var(--on-surface)]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="color-background" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-2">
              {cp('background')}
            </label>
            <div className="flex items-center gap-4">
              <input
                id="color-background"
                type="color"
                name="background_color"
                value={colors.background_color}
                onChange={handleChange}
                className="w-16 h-16 rounded-lg cursor-pointer border-2 border-[var(--outline-variant)]"
              />
              <input
                type="text"
                name="background_color"
                value={colors.background_color}
                onChange={handleChange}
                className="flex-1 px-4 py-2 rounded-lg border-2 border-[var(--outline-variant)] bg-[var(--surface-container-low)] text-[var(--on-surface)]"
              />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border-2 border-[var(--outline-variant)]">
          <h4 className="text-sm font-medium text-[var(--on-surface-variant)] mb-4">
            {cp('preview')}
          </h4>
          <div className="flex flex-wrap gap-4">
            <div 
              className="px-6 py-3 rounded-xl text-white font-bold"
              style={{ backgroundColor: colors.primary_color }}
            >
              {cp('primaryBtn')}
            </div>
            <div 
              className="px-6 py-3 rounded-xl text-white font-bold"
              style={{ backgroundColor: colors.secondary_color }}
            >
              {cp('secondaryBtn')}
            </div>
            <div 
              className="px-6 py-3 rounded-xl text-white font-bold"
              style={{ backgroundColor: colors.tertiary_color }}
            >
              {cp('tertiaryBtn')}
            </div>
            <div 
              className="px-6 py-3 rounded-xl font-bold border-2"
              style={{ 
                backgroundColor: colors.surface_color,
                color: colors.primary_color,
                borderColor: colors.primary_color
              }}
            >
              {cp('outlineBtn')}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? cp('saving') : cp('save')}
          </button>
          <button
            type="button"
            onClick={resetColors}
            className="px-8 py-3 bg-[var(--surface-container-high)] text-[var(--on-surface)] font-bold rounded-xl hover:bg-[var(--surface-container-highest)] transition-all"
            aria-label={cp('reset') || 'Restablecer colores por defecto'}
          >
            {cp('reset')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ColorSettings;
