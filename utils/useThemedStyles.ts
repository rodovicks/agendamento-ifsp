import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from './theme';

export const useThemedStyles = () => {
  const { isDark } = useTheme();
  const themeClasses = getThemeClasses(isDark);

  const getThemedClassName = (baseClasses: string) => {
    // Remove existing background and text classes, then apply theme classes
    let cleanClasses = baseClasses;

    // Replace background classes
    cleanClasses = cleanClasses.replace(
      /bg-(white|gray-50|gray-100)/g,
      themeClasses.cardBackground
    );
    cleanClasses = cleanClasses.replace(/bg-(gray-50)/g, themeClasses.background);

    // Replace text classes
    cleanClasses = cleanClasses.replace(/text-gray-900/g, themeClasses.textPrimary);
    cleanClasses = cleanClasses.replace(/text-gray-600/g, themeClasses.textSecondary);
    cleanClasses = cleanClasses.replace(/text-gray-500/g, themeClasses.textMuted);

    // Replace border classes
    cleanClasses = cleanClasses.replace(/border-gray-200/g, themeClasses.border);
    cleanClasses = cleanClasses.replace(/border-gray-100/g, themeClasses.borderLight);

    return cleanClasses;
  };

  return {
    themeClasses,
    getThemedClassName,
    ...themeClasses,
  };
};
