import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Container } from '../components/Container';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { ThemeTestComponent } from '../components/ThemeTestComponent';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/theme';

export default function AjustesScreen() {
  const { theme, setTheme, toggleTheme, isDark } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'system'>(theme);
  const themeClasses = getThemeClasses(isDark);

  // Sincroniza o selectedTheme com o theme atual
  useEffect(() => {
    setSelectedTheme(theme);
  }, [theme]);

  const themeOptions = [
    {
      id: 'light',
      name: 'Claro',
      description: 'Tema claro para uso durante o dia',
      icon: '☀️',
    },
    {
      id: 'dark',
      name: 'Escuro',
      description: 'Tema escuro para reduzir o cansaço visual',
      icon: '🌙',
    },
    {
      id: 'system',
      name: 'Sistema',
      description: 'Segue a configuração do dispositivo',
      icon: '⚙️',
    },
  ];

  return (
    <Container>
      <ScrollView className="flex-1 px-4 pt-6">
        {/* Componente de teste - remover depois */}
        <View className="mb-4">
          <ThemeTestComponent />
        </View>

        <View className="mb-8">
          <View className="mb-4 flex-row items-center">
            <ThemedText className="ml-2 text-xl font-semibold">Escolha o tema</ThemedText>
          </View>

          <ThemedView className="rounded-2xl p-4 shadow-sm">
            {themeOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                className={`mb-3 flex-row items-center rounded-xl border-2 p-4 ${
                  selectedTheme === option.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : `${themeClasses.border} ${themeClasses.inputBackground}`
                }`}
                onPress={() => setSelectedTheme(option.id as 'light' | 'dark' | 'system')}>
                <View
                  className={`mr-4 h-12 w-12 items-center justify-center rounded-full ${themeClasses.cardBackground} shadow-sm`}>
                  <Text className="text-2xl">{option.icon}</Text>
                </View>

                <View className="flex-1">
                  <Text
                    className={`text-lg font-medium ${
                      selectedTheme === option.id ? 'text-indigo-900' : themeClasses.textPrimary
                    }`}>
                    {option.name}
                  </Text>
                  <Text
                    className={`text-sm ${
                      selectedTheme === option.id ? 'text-indigo-600' : themeClasses.textSecondary
                    }`}>
                    {option.description}
                  </Text>
                </View>

                <View
                  className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
                    selectedTheme === option.id
                      ? 'border-indigo-500 bg-indigo-500'
                      : `${themeClasses.border}`
                  }`}>
                  {selectedTheme === option.id && <Text className="text-xs text-white">✓</Text>}
                </View>
              </TouchableOpacity>
            ))}
          </ThemedView>
        </View>

        {/* Apply Button */}
        <TouchableOpacity
          className="mb-6 items-center rounded-2xl bg-indigo-500 p-4 shadow-md"
          onPress={() => {
            setTheme(selectedTheme);
            console.log('Tema aplicado:', selectedTheme);
          }}>
          <Text className="text-lg font-semibold text-white">Aplicar Tema</Text>
        </TouchableOpacity>
      </ScrollView>
    </Container>
  );
}
