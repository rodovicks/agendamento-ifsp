import React from 'react';
import { View } from 'react-native';
import { ItemAgendamento, type Agendamento } from './ItemAgendamento';

interface ListaAgendamentosProps {
  agendamentos: Agendamento[];
  onAbrirModal: (agendamento: Agendamento) => void;
}

export function ListaAgendamentos({ agendamentos, onAbrirModal }: ListaAgendamentosProps) {
  return (
    <View className="space-y-3">
      {agendamentos.map((agendamento) => (
        <ItemAgendamento key={agendamento.id} agendamento={agendamento} onPress={onAbrirModal} />
      ))}
    </View>
  );
}
