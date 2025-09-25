import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeClasses } from '../../utils/theme';

interface NavegacaoDataProps {
  dataSelecionada: Date;
  onDataAnterior: () => void;
  onProximaData: () => void;
  onAbrirCalendario: () => void;
  onIrParaHoje: () => void;
  mostrarCalendario: boolean;
  onConfirmarData: (data: Date) => void;
  onCancelarCalendario: () => void;
}

export function NavegacaoData({
  dataSelecionada,
  onDataAnterior,
  onProximaData,
  onAbrirCalendario,
  onIrParaHoje,
  mostrarCalendario,
  onConfirmarData,
  onCancelarCalendario,
}: NavegacaoDataProps) {
  const { isDark } = useTheme();
  const themeClasses = getThemeClasses(isDark);
  const formatarDataCompleta = (data: Date) => {
    const hoje = new Date();
    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1);

    if (data.toDateString() === hoje.toDateString()) {
      return 'Hoje';
    } else if (data.toDateString() === amanha.toDateString()) {
      return 'Amanhã';
    } else {
      return data.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
    }
  };

  return (
    <>
      <View className={`border-b px-4 py-3 ${themeClasses.cardBackground} ${themeClasses.border}`}>
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={onDataAnterior} className="p-2">
            <Feather name="chevron-left" size={24} color={isDark ? '#94A3B8' : '#6B7280'} />
          </TouchableOpacity>

          <TouchableOpacity onPress={onAbrirCalendario} className="flex-1 items-center">
            <Text className={`flex-1 text-lg font-semibold ${themeClasses.textPrimary}`}>
              {formatarDataCompleta(dataSelecionada)}{' '}
            </Text>
            <Text className={`flex-1 text-sm ${themeClasses.textSecondary}`}>
              {dataSelecionada.toLocaleDateString('pt-BR')}{' '}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onProximaData} className="p-2">
            <Feather name="chevron-right" size={24} color={isDark ? '#94A3B8' : '#6B7280'} />
          </TouchableOpacity>
        </View>

        {dataSelecionada.toDateString() !== new Date().toDateString() && (
          <TouchableOpacity
            onPress={onIrParaHoje}
            className={`mt-2 self-center rounded-full px-3 py-1 ${isDark ? 'bg-indigo-900' : 'bg-indigo-100'}`}>
            <Text
              className={`text-sm font-medium ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
              Ir para hoje
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <DateTimePickerModal
        isVisible={mostrarCalendario}
        mode="date"
        date={dataSelecionada}
        onConfirm={onConfirmarData}
        onCancel={onCancelarCalendario}
        locale="pt-BR"
        display="calendar"
      />
    </>
  );
}
