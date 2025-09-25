import React from 'react';
import { View, ViewProps } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/theme';

interface ThemedViewProps extends ViewProps {
  variant?: 'background' | 'card' | 'input';
  children?: React.ReactNode;
}

export const ThemedView: React.FC<ThemedViewProps> = ({
  variant = 'card',
  className = '',
  children,
  ...props
}) => {
  const { isDark } = useTheme();
  const themeClasses = getThemeClasses(isDark);

  const getBackgroundClass = () => {
    switch (variant) {
      case 'background':
        return themeClasses.background;
      case 'input':
        return themeClasses.inputBackground;
      default:
        return themeClasses.cardBackground;
    }
  };

  // Remove any existing bg-white, bg-gray classes and apply theme
  const cleanClassName = className
    .replace(/bg-(white|gray-\d+)/g, '')
    .replace(/border-gray-\d+/g, themeClasses.border);

  const finalClassName = `${cleanClassName} ${getBackgroundClass()}`.trim();

  return (
    <View className={finalClassName} {...props}>
      {children}
    </View>
  );
};
