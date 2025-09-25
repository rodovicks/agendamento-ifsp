import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/theme';

interface Props {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  mode: 'date' | 'time';
  error?: string;
}

export const DateTimePicker = ({ label, value, onChange, mode, error }: Props) => {
  const [visible, setVisible] = useState(false);
  const { isDark } = useTheme();
  const themeClasses = getThemeClasses(isDark);

  return (
    <View className="mb-4">
      <Text className={`mb-2 text-base font-medium ${themeClasses.textSecondary}`}>{label}</Text>
      <TouchableOpacity
        className={`rounded-lg border px-4 py-3 text-base ${themeClasses.inputBackground} ${error ? 'border-red-500' : `${themeClasses.border} focus:border-indigo-500`}`}
        onPress={() => setVisible(true)}>
        <Text className={value ? themeClasses.textPrimary : themeClasses.textMuted}>
          {value
            ? mode === 'date'
              ? value.toLocaleDateString()
              : value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
            : `Selecione ${mode === 'date' ? 'a data' : 'o horário'}`}
        </Text>
      </TouchableOpacity>
      {error && <Text className="mt-1 text-sm text-red-500">{error}</Text>}
      <DateTimePickerModal
        isVisible={visible}
        mode={mode}
        date={value || new Date()}
        onConfirm={(date) => {
          setVisible(false);
          onChange(date);
        }}
        onCancel={() => setVisible(false)}
        locale="pt-BR"
      />
    </View>
  );
};
