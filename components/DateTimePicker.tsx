import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

interface Props {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  mode: 'date' | 'time';
  error?: string;
}

export const DateTimePicker = ({ label, value, onChange, mode, error }: Props) => {
  const [visible, setVisible] = useState(false);

  return (
    <View className="mb-4">
      <Text className="mb-2 text-base font-medium text-gray-700">{label}</Text>
      <TouchableOpacity
        className={`rounded-lg border border-gray-300 bg-white px-4 py-3 text-base ${error ? 'border-red-500' : 'focus:border-indigo-500'}`}
        onPress={() => setVisible(true)}>
        <Text className="text-gray-800">
          {value
            ? mode === 'date'
              ? value.toLocaleDateString()
              : value.toLocaleTimeString()
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
