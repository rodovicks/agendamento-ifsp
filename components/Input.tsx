import React, { forwardRef } from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/theme';

type InputProps = {
  label?: string;
  error?: string;
} & TextInputProps;

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, className, ...textInputProps }, ref) => {
    const { isDark } = useTheme();
    const themeClasses = getThemeClasses(isDark);

    return (
      <View className="mb-4">
        {label && (
          <Text className={`mb-2 text-base font-medium ${themeClasses.textSecondary}`}>
            {label}
          </Text>
        )}
        <TextInput
          ref={ref}
          {...textInputProps}
          className={`rounded-lg border px-4 py-3 text-base ${themeClasses.inputBackground} ${themeClasses.textPrimary} ${
            error ? 'border-red-500' : `${themeClasses.border} focus:border-indigo-500`
          } ${className}`}
          placeholderTextColor={isDark ? '#64748B' : '#9CA3AF'}
        />
        {error && <Text className="mt-1 text-sm text-red-500">{error}</Text>}
      </View>
    );
  }
);

Input.displayName = 'Input';
