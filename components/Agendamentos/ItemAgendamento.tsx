import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeClasses } from '../../utils/theme';

export interface Agendamento {
  id: string;
  cliente_nome: string;
  cliente_telefone: string;
  cliente_email?: string;
  data_agendamento: string;
  hora_inicio: string;
  hora_fim: string;
  status?: string;
  servico_id?: number;
  colaborador_id?: number;
  observacoes?: string;
  servicos?: { nome: string }[];
  colaboradores?: { nome: string }[];
}

interface ItemAgendamentoProps {
  agendamento: Agendamento;
  onPress: (agendamento: Agendamento) => void;
}

export function ItemAgendamento({ agendamento, onPress }: ItemAgendamentoProps) {
  const { isDark } = useTheme();
  const themeClasses = getThemeClasses(isDark);

  const isAgendamentoAtrasado = (data: string, horario: string) => {
    const agora = new Date();
    const dataAgendamento = new Date(data + 'T' + horario);
    return dataAgendamento < agora;
  };

  const obterCorStatus = (status?: string, isAtrasado?: boolean) => {
    if (isAtrasado) {
      return 'bg-red-100 text-red-800 border-red-200';
    }

    switch (status) {
      case 'confirmado':
        return 'bg-green-100 text-green-800';
      case 'cancelado':
        return 'bg-gray-100 text-gray-800';
      case 'concluido':
        return 'bg-emerald-100 text-emerald-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const isAtrasado = isAgendamentoAtrasado(agendamento.data_agendamento, agendamento.hora_inicio);

  return (
    <TouchableOpacity
      className={`rounded-lg border p-4 shadow-sm ${themeClasses.cardBackground} ${
        isAtrasado ? 'border-red-200 bg-red-50' : themeClasses.border
      }`}
      activeOpacity={0.7}
      onPress={() => onPress(agendamento)}>
      {isAtrasado && (
        <View className="mb-2 flex-row items-center">
          <Feather name="clock" size={16} color="#DC2626" />
          <Text className="ml-1 flex-1 text-sm font-medium text-red-600">
            Agendamento em atraso
          </Text>
        </View>
      )}

      <View className="mb-2 flex-row items-start justify-between">
        <Text className={`flex-1 text-lg font-semibold ${themeClasses.textPrimary}`}>
          {agendamento.cliente_nome}
        </Text>
        <View
          className={`ml-2 rounded-full px-2 py-1 ${obterCorStatus(agendamento.status, isAtrasado)}`}>
          <Text className="flex-1 text-xs font-medium">{agendamento.status || 'agendado'}</Text>
        </View>
      </View>

      <View className="mb-1 flex-row items-center">
        <FontAwesome name="clock-o" size={14} color={isDark ? '#94A3B8' : '#6B7280'} />
        <Text
          className={`ml-2 flex-1 ${isAtrasado ? 'font-medium text-red-600' : themeClasses.textSecondary}`}>
          {agendamento.hora_inicio.slice(0, 5)}
        </Text>
      </View>

      <View className="mb-1 flex-row items-center">
        <FontAwesome name="phone" size={14} color={isDark ? '#94A3B8' : '#6B7280'} />
        <Text className={`ml-2 flex-1 ${themeClasses.textSecondary}`}>
          {agendamento.cliente_telefone}
        </Text>
      </View>

      {agendamento.servicos && agendamento.servicos.length > 0 && (
        <View className="mb-1 flex-row items-center">
          <FontAwesome name="scissors" size={14} color={isDark ? '#94A3B8' : '#6B7280'} />
          <Text className={`ml-2 flex-1 ${themeClasses.textSecondary}`}>
            {agendamento.servicos.map((servico) => servico.nome).join(', ')}
          </Text>
        </View>
      )}

      {agendamento.colaboradores && agendamento.colaboradores.length > 0 && (
        <View className="flex-row items-center">
          <FontAwesome name="user" size={14} color={isDark ? '#94A3B8' : '#6B7280'} />
          <Text className={`ml-2 flex-1 ${themeClasses.textSecondary}`}>
            {agendamento.colaboradores[0].nome}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
