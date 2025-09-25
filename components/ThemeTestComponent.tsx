import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/theme';

export const ThemeTestComponent: React.FC = () => {
  const { theme, isDark, setTheme } = useTheme();
  const themeClasses = getThemeClasses(isDark);

  return (
    <View className={`p-4 ${themeClasses.cardBackground}`}>
      <Text className={`mb-4 text-lg font-bold ${themeClasses.textPrimary}`}>Teste do Tema</Text>

      <Text className={`mb-2 ${themeClasses.textSecondary}`}>Tema atual: {theme}</Text>

      <Text className={`mb-2 ${themeClasses.textSecondary}`}>
        isDark: {isDark ? 'true' : 'false'}
      </Text>

      <Text className={`mb-4 ${themeClasses.textMuted}`}>
        Classes aplicadas: {themeClasses.background}
      </Text>

      <View className="flex-row gap-2">
        <TouchableOpacity
          className="rounded bg-blue-500 px-4 py-2"
          onPress={() => setTheme('light')}>
          <Text className="text-white">Claro</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="rounded bg-gray-800 px-4 py-2"
          onPress={() => setTheme('dark')}>
          <Text className="text-white">Escuro</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="rounded bg-green-500 px-4 py-2"
          onPress={() => setTheme('system')}>
          <Text className="text-white">Sistema</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
