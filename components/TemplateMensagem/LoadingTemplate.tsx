import React from 'react';
import { View, Text } from 'react-native';
import { Container } from '../Container';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeClasses } from '../../utils/theme';

interface LoadingTemplateProps {
  message?: string;
}

export function LoadingTemplate({ message = 'Carregando template...' }: LoadingTemplateProps) {
  const { isDark } = useTheme();
  const themeClasses = getThemeClasses(isDark);

  return (
    <Container className="flex-1">
      <View className="flex-1 items-center justify-center">
        <Text className={themeClasses.textSecondary}>{message}</Text>
      </View>
    </Container>
  );
}
