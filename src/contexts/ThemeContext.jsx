import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { getTranslation, getSavedLanguage } from '../utils/i18n';

const translate = (key) => getTranslation(getSavedLanguage(), key);

const THEMES = {
  light: {
    '--primary': '#004AC6',
    '--primary-container': '#e5eeff',
    '--secondary': '#006C49',
    '--tertiary': '#996100',
    '--background': '#f8f9ff',
    '--surface': '#ffffff',
    '--surface-variant': '#d3e4fe',
    '--on-background': '#0b1c30',
    '--on-surface': '#0b1c30',
    '--on-primary': '#ffffff',
    '--outline': '#737686',
    '--outline-variant': '#c3c6d7',
    '--error': '#ba1a1a',
    '--success': '#006C49',
    '--warning': '#996100',
    '--info': '#004AC6',
    '--accent': '#004AC6',
    '--card-shadow': '0 1px 3px rgba(0,0,0,0.08)',
  },
  dark: {
    '--primary': '#4a90d9',
    '--primary-dark': '#2f6cb0',
    '--primary-light': '#1a3a6e',
    '--primary-container': '#1a3a6e',
    '--secondary': '#4caf7e',
    '--secondary-container': '#005236',
    '--tertiary': '#d4a030',
    '--tertiary-container': '#6b4200',
    '--background': '#0b1c30',
    '--surface': '#1a2d44',
    '--surface-dim': '#0f1f33',
    '--surface-bright': '#2a3f58',
    '--surface-container-lowest': '#0b1c30',
    '--surface-container-low': '#1a2d44',
    '--surface-container': '#213145',
    '--surface-container-high': '#2a3f58',
    '--surface-container-highest': '#3a4f68',
    '--surface-variant': '#2a3f58',
    '--on-background': '#eaf1ff',
    '--on-surface': '#eaf1ff',
    '--on-surface-variant': '#a8b8d0',
    '--inverse-surface': '#eaf1ff',
    '--inverse-on-surface': '#0b1c30',
    '--on-primary': '#000000',
    '--on-primary-container': '#dbe1ff',
    '--on-secondary-container': '#6cf8bb',
    '--on-tertiary-container': '#ffddb8',
    '--outline': '#8a9bb0',
    '--outline-variant': '#4a5f78',
    '--error': '#cf6679',
    '--error-container': '#93000a',
    '--on-error-container': '#ffdad6',
    '--success': '#4caf7e',
    '--warning': '#d4a030',
    '--info': '#4a90d9',
    '--accent': '#4a90d9',
    '--card-shadow': '0 1px 3px rgba(0,0,0,0.3)',
  },
  grayscale: {
    '--primary': '#616161',
    '--primary-container': '#e0e0e0',
    '--secondary': '#757575',
    '--tertiary': '#9e9e9e',
    '--background': '#f5f5f5',
    '--surface': '#ffffff',
    '--surface-variant': '#e0e0e0',
    '--on-background': '#212121',
    '--on-surface': '#212121',
    '--on-primary': '#ffffff',
    '--outline': '#9e9e9e',
    '--outline-variant': '#bdbdbd',
    '--error': '#9e9e9e',
    '--success': '#757575',
    '--warning': '#9e9e9e',
    '--info': '#757575',
    '--accent': '#616161',
    '--card-shadow': '0 1px 3px rgba(0,0,0,0.12)',
  },
};

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('sim_theme') || 'light';
  });
  const [primaryColor, setPrimaryColor] = useState('#004AC6');
  const [secondaryColor, setSecondaryColor] = useState('#006C49');
  const [tertiaryColor, setTertiaryColor] = useState('#996100');
  const [backgroundColor, setBackgroundColor] = useState('#f8f9ff');
  const [surfaceColor, setSurfaceColor] = useState('#ffffff');

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    if (theme === 'grayscale') {
      document.body.style.filter = 'grayscale(1)';
      root.classList.add('grayscale-mode');
    } else {
      document.body.style.filter = '';
      root.classList.remove('grayscale-mode');
    }
    return () => {
      document.body.style.filter = '';
      root.classList.remove('grayscale-mode');
    };
  }, [theme]);

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('sim_theme', newTheme);
  }, []);

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

          if (theme === 'grayscale') return;

          applyColors({
            primary: response.data.primary_color || '#004AC6',
            secondary: response.data.secondary_color || '#006C49',
            tertiary: response.data.tertiary_color || '#996100',
            background: response.data.background_color || '#f8f9ff',
            surface: response.data.surface_color || '#ffffff'
          });
        }
      } catch {
        toast.error('Error al cargar el tema');
      }
    };

    fetchColors();
  }, []);

  const applyColors = (colors) => {
    const root = document.documentElement;
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--secondary', colors.secondary);
    root.style.setProperty('--tertiary', colors.tertiary);

    if (theme !== 'dark') {
      root.style.setProperty('--background', colors.background);
      root.style.setProperty('--surface', colors.surface);
    }

    root.style.setProperty('--primary-light', lightenColor(colors.primary, 40));
    root.style.setProperty('--primary-dark', darkenColor(colors.primary, 20));
    root.style.setProperty('--primary-container', lightenColor(colors.primary, 70));
    root.style.setProperty('--on-primary', '#ffffff');
    root.style.setProperty('--on-primary-container', '#eeefff');
  };

  useEffect(() => {
    if (theme !== 'light' && theme !== 'dark') return;
    const palette = THEMES[theme];
    const root = document.documentElement;
    Object.entries(palette).forEach(([prop, val]) => {
      root.style.setProperty(prop, val);
    });
  }, [theme]);

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
      const token = localStorage.getItem('access_token');
      if (!token) return { success: false, error: translate('theme.notAuthenticated') };

      await axios.put('/admin/config', newColors, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
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
      return { success: false, error: error.message };
    }
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
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