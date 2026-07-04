import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../api/axios';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [primaryColor, setPrimaryColor] = useState('#004AC6');
  const [secondaryColor, setSecondaryColor] = useState('#006C49');
  const [tertiaryColor, setTertiaryColor] = useState('#996100');
  const [backgroundColor, setBackgroundColor] = useState('#f8f9ff');
  const [surfaceColor, setSurfaceColor] = useState('#ffffff');
  
  // Cargar colores desde el backend
  useEffect(() => {
    const fetchColors = async () => {
      try {
        const response = await axios.get('/config');
        if (response.data) {
          setPrimaryColor(response.data.primary_color || '#004AC6');
          setSecondaryColor(response.data.secondary_color || '#006C49');
          setTertiaryColor(response.data.tertiary_color || '#996100');
          setBackgroundColor(response.data.background_color || '#f8f9ff');
          setSurfaceColor(response.data.surface_color || '#ffffff');
          
          // Aplicar colores al CSS
          applyColors({
            primary: response.data.primary_color || '#004AC6',
            secondary: response.data.secondary_color || '#006C49',
            tertiary: response.data.tertiary_color || '#996100',
            background: response.data.background_color || '#f8f9ff',
            surface: response.data.surface_color || '#ffffff'
          });
        }
      } catch (error) {
        console.error('Error cargando colores:', error);
      }
    };
    
    fetchColors();
  }, []);

  const applyColors = (colors) => {
    const root = document.documentElement;
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--secondary', colors.secondary);
    root.style.setProperty('--tertiary', colors.tertiary);
    root.style.setProperty('--background', colors.background);
    root.style.setProperty('--surface', colors.surface);
    
    // Derivados
    root.style.setProperty('--primary-light', lightenColor(colors.primary, 40));
    root.style.setProperty('--primary-dark', darkenColor(colors.primary, 20));
    root.style.setProperty('--primary-container', lightenColor(colors.primary, 70));
    root.style.setProperty('--on-primary', '#ffffff');
    root.style.setProperty('--on-primary-container', '#eeefff');
  };

  const lightenColor = (hex, percent) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
  };

  const darkenColor = (hex, percent) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
  };

  const updateColors = async (newColors) => {
    try {
      await axios.put('/admin/config', newColors);
      
      if (newColors.primary_color) setPrimaryColor(newColors.primary_color);
      if (newColors.secondary_color) setSecondaryColor(newColors.secondary_color);
      if (newColors.tertiary_color) setTertiaryColor(newColors.tertiary_color);
      if (newColors.background_color) setBackgroundColor(newColors.background_color);
      if (newColors.surface_color) setSurfaceColor(newColors.surface_color);
      
      applyColors({
        primary: newColors.primary_color || primaryColor,
        secondary: newColors.secondary_color || secondaryColor,
        tertiary: newColors.tertiary_color || tertiaryColor,
        background: newColors.background_color || backgroundColor,
        surface: newColors.surface_color || surfaceColor
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error actualizando colores:', error);
      return { success: false, error: error.message };
    }
  };

  return (
    <ThemeContext.Provider value={{
      primaryColor,
      secondaryColor,
      tertiaryColor,
      backgroundColor,
      surfaceColor,
      updateColors
    }}>
      {children}
    </ThemeContext.Provider>
  );
};