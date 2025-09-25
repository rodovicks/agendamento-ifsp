import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EstatisticasClientesProps {
  totalClientes: number;
  clientesUltimoMes: number;
  totalAtendimentos: number;
  loading?: boolean;
}

export const EstatisticasClientes: React.FC<EstatisticasClientesProps> = ({
  totalClientes,
  clientesUltimoMes,
  totalAtendimentos,
  loading = false,
}) => {
  if (loading) {
    return (
      <View className="mb-4 rounded-lg bg-white p-4 shadow-sm">
        <Text className="text-center text-gray-500">Carregando estatísticas...</Text>
      </View>
    );
  }

  return (
    <View className="mb-4 rounded-lg bg-white p-4 shadow-sm">
      <Text className="mb-4 text-lg font-semibold text-gray-900">Resumo dos Clientes</Text>

      <View className="flex-row justify-between">
        {/* Total de clientes */}
        <View className="flex-1 items-center">
          <View className="mb-2 rounded-full bg-blue-50 p-3">
            <Ionicons name="people" size={24} color="#2563EB" />
          </View>
          <Text className="text-2xl font-bold text-blue-600">{totalClientes}</Text>
          <Text className="text-center text-sm text-gray-600">Total de{'\n'}Clientes</Text>
        </View>

        {/* Clientes último mês */}
        <View className="flex-1 items-center">
          <View className="mb-2 rounded-full bg-green-50 p-3">
            <Ionicons name="trending-up" size={24} color="#16A34A" />
          </View>
          <Text className="text-2xl font-bold text-green-600">{clientesUltimoMes}</Text>
          <Text className="text-center text-sm text-gray-600">Último{'\n'}Mês</Text>
        </View>

        {/* Total de atendimentos */}
        <View className="flex-1 items-center">
          <View className="mb-2 rounded-full bg-purple-50 p-3">
            <Ionicons name="calendar" size={24} color="#7C3AED" />
          </View>
          <Text className="text-2xl font-bold text-purple-600">{totalAtendimentos}</Text>
          <Text className="text-center text-sm text-gray-600">Total{'\n'}Atendimentos</Text>
        </View>
      </View>
    </View>
  );
};
