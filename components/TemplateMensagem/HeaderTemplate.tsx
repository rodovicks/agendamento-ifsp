import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeClasses } from '../../utils/theme';

export function HeaderTemplate() {
  const { isDark } = useTheme();
  const themeClasses = getThemeClasses(isDark);

  return (
    <View className="mb-6 mt-4">
      <Text className={`mt-2 ${themeClasses.textSecondary}`}>
        Personalize o texto que será copiado ao compartilhar agendamentos
      </Text>
    </View>
  );
}
