import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface EstadosListaProps {
  loading: boolean;
  agendamentos: any[];
  dataSelecionada: Date;
}

export function EstadosLista({ loading, agendamentos, dataSelecionada }: EstadosListaProps) {
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

  if (loading) {
    return (
      <View className="items-center justify-center py-12">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-4 text-center text-lg text-gray-500">Carregando agendamentos...</Text>
      </View>
    );
  }

  if (agendamentos.length === 0) {
    return (
      <View className="items-center justify-center py-12">
        <Feather name="calendar" size={64} color="#9CA3AF" />
        <Text className="mt-4 flex-1 text-center text-lg text-gray-500">Nenhum agendamento </Text>
        <Text className="mt-1 flex-1 text-center text-sm text-gray-400">
          Toque no botão + para criar um novo agendamento{' '}
        </Text>
      </View>
    );
  }

  return null;
}
