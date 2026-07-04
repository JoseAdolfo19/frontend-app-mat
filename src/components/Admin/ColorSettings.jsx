import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

const ColorSettings = () => {
  const { 
    primaryColor, 
    secondaryColor, 
    tertiaryColor,
    backgroundColor,
    surfaceColor,
    updateColors 
  } = useTheme();

  const [colors, setColors] = useState({
    primary_color: primaryColor,
    secondary_color: secondaryColor,
    tertiary_color: tertiaryColor,
    background_color: backgroundColor,
    surface_color: surfaceColor
  });

  const [loading, setLoading] = useState(false);

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
      toast.success('Colores actualizados exitosamente');
    } else {
      toast.error('Error al actualizar colores');
    }
  };

  const resetColors = () => {
    const defaultColors = {
      primary_color: '#004AC6',
      secondary_color: '#006C49',
      tertiary_color: '#996100',
      background_color: '#f8f9ff',
      surface_color: '#ffffff'
    };
    setColors(defaultColors);
  };

  return (
    <div className="bg-[var(--surface)] rounded-xl p-8 shadow-lg">
      <h3 className="text-2xl font-bold text-[var(--on-surface)] mb-6">
        Personalización de Colores
      </h3>
      <p className="text-[var(--on-surface-variant)] mb-8">
        Personaliza la identidad visual de tu institución en la plataforma.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Color Primario */}
          <div>
            <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-2">
              Color Primario
            </label>
            <div className="flex items-center gap-4">
              <input
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

          {/* Color Secundario */}
          <div>
            <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-2">
              Color Secundario
            </label>
            <div className="flex items-center gap-4">
              <input
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

          {/* Color Terciario */}
          <div>
            <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-2">
              Color Terciario
            </label>
            <div className="flex items-center gap-4">
              <input
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

          {/* Color de Fondo */}
          <div>
            <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-2">
              Color de Fondo
            </label>
            <div className="flex items-center gap-4">
              <input
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

        {/* Preview */}
        <div className="p-6 rounded-xl border-2 border-[var(--outline-variant)]">
          <h4 className="text-sm font-medium text-[var(--on-surface-variant)] mb-4">
            Vista Previa
          </h4>
          <div className="flex flex-wrap gap-4">
            <div 
              className="px-6 py-3 rounded-xl text-white font-bold"
              style={{ backgroundColor: colors.primary_color }}
            >
              Botón Primario
            </div>
            <div 
              className="px-6 py-3 rounded-xl text-white font-bold"
              style={{ backgroundColor: colors.secondary_color }}
            >
              Botón Secundario
            </div>
            <div 
              className="px-6 py-3 rounded-xl text-white font-bold"
              style={{ backgroundColor: colors.tertiary_color }}
            >
              Botón Terciario
            </div>
            <div 
              className="px-6 py-3 rounded-xl font-bold border-2"
              style={{ 
                backgroundColor: colors.surface_color,
                color: colors.primary_color,
                borderColor: colors.primary_color
              }}
            >
              Botón Outline
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
          <button
            type="button"
            onClick={resetColors}
            className="px-8 py-3 bg-[var(--surface-container-high)] text-[var(--on-surface)] font-bold rounded-xl hover:bg-[var(--surface-container-highest)] transition-all"
          >
            Restaurar Predeterminados
          </button>
        </div>
      </form>
    </div>
  );
};

export default ColorSettings;