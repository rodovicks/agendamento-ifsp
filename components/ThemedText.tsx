import React from 'react';
import { Text, TextProps } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/theme';

interface ThemedTextProps extends TextProps {
  variant?: 'primary' | 'secondary' | 'muted';
  children: React.ReactNode;
}

export const ThemedText: React.FC<ThemedTextProps> = ({
  variant = 'primary',
  className = '',
  children,
  ...props
}) => {
  const { isDark } = useTheme();
  const themeClasses = getThemeClasses(isDark);

  const getTextColorClass = () => {
    switch (variant) {
      case 'secondary':
        return themeClasses.textSecondary;
      case 'muted':
        return themeClasses.textMuted;
      default:
        return themeClasses.textPrimary;
    }
  };

  // Remove any existing text-gray classes and apply theme
  const cleanClassName = className.replace(/text-gray-\d+/g, '');
  const finalClassName = `${cleanClassName} ${getTextColorClass()}`.trim();

  return (
    <Text className={finalClassName} {...props}>
      {children}
    </Text>
  );
};
