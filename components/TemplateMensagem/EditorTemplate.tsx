import React from 'react';
import { View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeClasses } from '../../utils/theme';

interface EditorTemplateProps {
  template: string;
  onTemplateChange: (text: string) => void;
  placeholder?: string;
}

export function EditorTemplate({
  template,
  onTemplateChange,
  placeholder = 'Digite seu template personalizado...',
}: EditorTemplateProps) {
  const { isDark } = useTheme();
  const themeClasses = getThemeClasses(isDark);

  return (
    <KeyboardAvoidingView
      className="mb-6 flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Text className={`mb-2 text-base font-medium ${themeClasses.textSecondary}`}>
        Template da Mensagem
      </Text>
      <View
        className={`rounded-lg border ${themeClasses.border} ${themeClasses.inputBackground}`}
        style={{ height: 250 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled">
          <TextInput
            value={template}
            onChangeText={onTemplateChange}
            multiline
            className={`p-4 text-base ${themeClasses.textPrimary}`}
            placeholder={placeholder}
            placeholderTextColor={isDark ? '#64748B' : '#9CA3AF'}
            textAlignVertical="top"
            style={{
              minHeight: 230,
              fontSize: 14,
              lineHeight: 20,
              flex: 1,
            }}
            scrollEnabled={false}
            blurOnSubmit={false}
            returnKeyType="default"
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
