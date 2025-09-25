import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DateTimePicker } from '../DateTimePicker';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeClasses } from '../../utils/theme';

export interface FiltrosClientes {
  nomeCliente?: string;
  dataInicio?: string;
  dataFim?: string;
  mes?: number;
  ano?: number;
}

interface FiltroClientesProps {
  filtros: FiltrosClientes;
  onFiltrosChange: (filtros: FiltrosClientes) => void;
  onLimparFiltros: () => void;
}

export const FiltroClientes: React.FC<FiltroClientesProps> = ({
  filtros,
  onFiltrosChange,
  onLimparFiltros,
}) => {
  const [modalVisivel, setModalVisivel] = useState(false);
  const [tipoFiltroData, setTipoFiltroData] = useState<'mes' | 'ano' | 'intervalo'>('mes');
  const [mesTemp, setMesTemp] = useState(filtros.mes || new Date().getMonth() + 1);
  const [anoTemp, setAnoTemp] = useState(filtros.ano || new Date().getFullYear());
  const [dataInicioTemp, setDataInicioTemp] = useState(filtros.dataInicio || '');
  const [dataFimTemp, setDataFimTemp] = useState(filtros.dataFim || '');
  const { isDark } = useTheme();
  const themeClasses = getThemeClasses(isDark);

  const meses = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  const anos = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  const aplicarFiltros = () => {
    const novosFiltros: FiltrosClientes = {
      nomeCliente: filtros.nomeCliente,
    };

    if (tipoFiltroData === 'mes') {
      novosFiltros.mes = mesTemp;
      novosFiltros.ano = anoTemp;
    } else if (tipoFiltroData === 'ano') {
      novosFiltros.ano = anoTemp;
    } else if (tipoFiltroData === 'intervalo') {
      if (!dataInicioTemp || !dataFimTemp) {
        Alert.alert('Erro', 'Selecione tanto a data de início quanto a data de fim.');
        return;
      }
      if (new Date(dataInicioTemp) > new Date(dataFimTemp)) {
        Alert.alert('Erro', 'A data de início deve ser anterior à data de fim.');
        return;
      }
      novosFiltros.dataInicio = dataInicioTemp;
      novosFiltros.dataFim = dataFimTemp;
    }

    onFiltrosChange(novosFiltros);
    setModalVisivel(false);
  };

  const limparFiltrosData = () => {
    setMesTemp(new Date().getMonth() + 1);
    setAnoTemp(new Date().getFullYear());
    setDataInicioTemp('');
    setDataFimTemp('');
    setTipoFiltroData('mes');
  };

  const getFiltroAtivo = () => {
    if (filtros.mes && filtros.ano) {
      return `${meses[filtros.mes - 1]} ${filtros.ano}`;
    }
    if (filtros.ano && !filtros.mes) {
      return `Ano ${filtros.ano}`;
    }
    if (filtros.dataInicio && filtros.dataFim) {
      return `${new Date(filtros.dataInicio).toLocaleDateString('pt-BR')} - ${new Date(filtros.dataFim).toLocaleDateString('pt-BR')}`;
    }
    return 'Todos os períodos';
  };

  const temFiltrosAtivos = () => {
    return !!(
      filtros.nomeCliente ||
      filtros.mes ||
      filtros.ano ||
      filtros.dataInicio ||
      filtros.dataFim
    );
  };

  return (
    <View className={`mb-4 rounded-lg p-4 shadow-sm ${themeClasses.cardBackground}`}>
      {/* Busca por nome */}
      <View className="mb-4">
        <Text className={`mb-2 font-medium ${themeClasses.textPrimary}`}>Buscar por nome</Text>
        <View
          className={`flex-row items-center rounded-lg px-3 py-2 ${themeClasses.inputBackground}`}>
          <Ionicons name="search" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
          <TextInput
            className={`ml-2 flex-1 ${themeClasses.textPrimary}`}
            placeholder="Digite o nome do cliente..."
            placeholderTextColor={isDark ? '#64748B' : '#9CA3AF'}
            value={filtros.nomeCliente || ''}
            onChangeText={(texto) => onFiltrosChange({ ...filtros, nomeCliente: texto })}
          />
          {filtros.nomeCliente && (
            <TouchableOpacity
              onPress={() => onFiltrosChange({ ...filtros, nomeCliente: undefined })}>
              <Ionicons name="close-circle" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filtros de data */}
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className={`mb-2 font-medium ${themeClasses.textPrimary}`}>Período</Text>
          <TouchableOpacity
            className={`flex-row items-center justify-between rounded-lg px-3 py-3 ${themeClasses.inputBackground}`}
            onPress={() => setModalVisivel(true)}>
            <Text className={`flex-1 ${themeClasses.textPrimary}`}>{getFiltroAtivo()}</Text>
            <Ionicons name="calendar" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
          </TouchableOpacity>
        </View>

        {temFiltrosAtivos() && (
          <TouchableOpacity
            className={`ml-3 mt-7 rounded-lg px-3 py-3 ${isDark ? 'bg-red-900' : 'bg-red-50'}`}
            onPress={onLimparFiltros}>
            <Ionicons name="trash" size={20} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>

      {/* Modal de filtros de data */}
      <Modal visible={modalVisivel} animationType="slide" presentationStyle="pageSheet">
        <View className={`flex-1 ${themeClasses.background}`}>
          <View
            className={`flex-row items-center justify-between border-b p-4 ${themeClasses.border}`}>
            <TouchableOpacity onPress={() => setModalVisivel(false)}>
              <Text className="font-medium text-blue-600">Cancelar</Text>
            </TouchableOpacity>
            <Text className={`text-lg font-semibold ${themeClasses.textPrimary}`}>
              Filtrar por período
            </Text>
            <TouchableOpacity onPress={aplicarFiltros}>
              <Text className="font-medium text-blue-600">Aplicar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4">
            {/* Tipo de filtro */}
            <View className="mb-6">
              <Text className="mb-3 font-medium text-gray-700">Tipo de filtro</Text>
              <View className="space-y-2">
                {[
                  { value: 'mes', label: 'Por mês e ano' },
                  { value: 'ano', label: 'Por ano' },
                  { value: 'intervalo', label: 'Intervalo personalizado' },
                ].map((opcao) => (
                  <TouchableOpacity
                    key={opcao.value}
                    className={`flex-row items-center rounded-lg p-3 ${
                      tipoFiltroData === opcao.value
                        ? 'border border-blue-200 bg-blue-50'
                        : 'bg-gray-50'
                    }`}
                    onPress={() => setTipoFiltroData(opcao.value as any)}>
                    <View
                      className={`mr-3 h-5 w-5 rounded-full border-2 ${
                        tipoFiltroData === opcao.value
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-300'
                      }`}>
                      {tipoFiltroData === opcao.value && (
                        <View className="m-0.5 flex-1 rounded-full bg-white" />
                      )}
                    </View>
                    <Text
                      className={
                        tipoFiltroData === opcao.value
                          ? 'font-medium text-blue-600'
                          : 'text-gray-700'
                      }>
                      {opcao.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Filtro por mês e ano */}
            {tipoFiltroData === 'mes' && (
              <View className="space-y-4">
                <View>
                  <Text className="mb-2 font-medium text-gray-700">Mês</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row space-x-2">
                      {meses.map((mes, index) => (
                        <TouchableOpacity
                          key={index}
                          className={`mr-2 rounded-lg px-4 py-2 ${
                            mesTemp === index + 1 ? 'bg-blue-600' : 'bg-gray-100'
                          }`}
                          onPress={() => setMesTemp(index + 1)}>
                          <Text className={mesTemp === index + 1 ? 'text-white' : 'text-gray-700'}>
                            {mes}{' '}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
                <View>
                  <Text className="mb-2 font-medium text-gray-700">Ano</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row space-x-2">
                      {anos.map((ano) => (
                        <TouchableOpacity
                          key={ano}
                          className={`mr-2 rounded-lg px-4 py-2 ${
                            anoTemp === ano ? 'bg-blue-600' : 'bg-gray-100'
                          }`}
                          onPress={() => setAnoTemp(ano)}>
                          <Text className={anoTemp === ano ? 'text-white' : 'text-gray-700'}>
                            {ano}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              </View>
            )}

            {/* Filtro por ano */}
            {tipoFiltroData === 'ano' && (
              <View>
                <Text className="mb-2 font-medium text-gray-700">Ano</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row space-x-2">
                    {anos.map((ano) => (
                      <TouchableOpacity
                        key={ano}
                        className={`mr-2 rounded-lg px-4 py-2 ${
                          anoTemp === ano ? 'bg-blue-600' : 'bg-gray-100'
                        }`}
                        onPress={() => setAnoTemp(ano)}>
                        <Text className={anoTemp === ano ? 'text-white' : 'text-gray-700'}>
                          {ano}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* Filtro por intervalo */}
            {tipoFiltroData === 'intervalo' && (
              <View className="space-y-2">
                <View>
                  <DateTimePicker
                    label="Data de início"
                    mode="date"
                    value={dataInicioTemp ? new Date(dataInicioTemp) : null}
                    onChange={(data) => {
                      if (data) {
                        setDataInicioTemp(data.toISOString().split('T')[0]);
                      }
                    }}
                  />
                </View>
                <View>
                  <DateTimePicker
                    label="Data de fim"
                    mode="date"
                    value={dataFimTemp ? new Date(dataFimTemp) : null}
                    onChange={(data) => {
                      if (data) {
                        setDataFimTemp(data.toISOString().split('T')[0]);
                      }
                    }}
                  />
                </View>
              </View>
            )}

            <TouchableOpacity
              className="mt-6 rounded-lg bg-gray-100 p-3"
              onPress={limparFiltrosData}>
              <Text className="text-center font-medium text-gray-700">Limpar filtros de data</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};
