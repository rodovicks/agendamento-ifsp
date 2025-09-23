import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface Servico {
  id: number;
  nome: string;
  descricao?: string;
}

interface MultiSelectServicosProps {
  servicos: Servico[];
  servicosSelecionados: number[];
  onServicosChange: (servicosIds: number[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MultiSelectServicos({
  servicos,
  servicosSelecionados,
  onServicosChange,
  placeholder = 'Selecione os serviços',
  disabled = false,
}: MultiSelectServicosProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const toggleServico = (servicoId: number) => {
    const isSelected = servicosSelecionados.includes(servicoId);

    if (isSelected) {
      onServicosChange(servicosSelecionados.filter((id) => id !== servicoId));
    } else {
      onServicosChange([...servicosSelecionados, servicoId]);
    }
  };

  const selecionarTodos = () => {
    onServicosChange(servicos.map((s) => s.id));
  };

  const deselecionarTodos = () => {
    onServicosChange([]);
  };

  const getDisplayText = () => {
    if (servicosSelecionados.length === 0) {
      return placeholder;
    }

    if (servicosSelecionados.length === 1) {
      const servico = servicos.find((s) => s.id === servicosSelecionados[0]);
      return servico?.nome || '';
    }

    return `${servicosSelecionados.length} serviços selecionados`;
  };

  return (
    <View>
      <TouchableOpacity
        onPress={() => !disabled && setModalVisible(true)}
        className={`flex-row items-center justify-between rounded-lg border px-4 py-3 ${
          disabled ? 'border-gray-200 bg-gray-50' : 'border-gray-300 bg-white'
        }`}
        disabled={disabled}>
        <Text
          className={`flex-1 ${
            servicosSelecionados.length > 0
              ? 'text-gray-900'
              : disabled
                ? 'text-gray-400'
                : 'text-gray-500'
          }`}>
          {getDisplayText()}
        </Text>

        <View className="flex-row items-center">
          {servicosSelecionados.length > 0 && !disabled && (
            <TouchableOpacity onPress={deselecionarTodos} className="mr-2">
              <Feather name="x" size={18} color="#6B7280" />
            </TouchableOpacity>
          )}
          {!disabled && <Feather name="chevron-down" size={18} color="#6B7280" />}
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="max-h-4/5 rounded-t-3xl bg-white">
            <View className="flex-row items-center justify-between border-b border-gray-200 p-4">
              <Text className="text-lg font-semibold text-gray-900">Selecionar Serviços</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View className="p-4">
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-sm font-medium text-gray-700">
                  Serviços disponíveis ({servicos.length}):
                </Text>
                <View className="flex-row space-x-2">
                  <TouchableOpacity onPress={selecionarTodos}>
                    <Text className="text-sm text-indigo-600">Todos</Text>
                  </TouchableOpacity>
                  <Text className="text-gray-400">|</Text>
                  <TouchableOpacity onPress={deselecionarTodos}>
                    <Text className="text-sm text-indigo-600">Nenhum</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <FlatList
                data={servicos}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => {
                  const isSelected = servicosSelecionados.includes(item.id);

                  return (
                    <TouchableOpacity
                      onPress={() => toggleServico(item.id)}
                      className={`mb-3 rounded-lg border p-3 ${
                        isSelected ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200 bg-white'
                      }`}>
                      <View className="flex-row items-start">
                        <View
                          className={`mr-3 h-5 w-5 items-center justify-center rounded border-2 ${
                            isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
                          }`}>
                          {isSelected && <Feather name="check" size={12} color="white" />}
                        </View>
                        <View className="flex-1">
                          <Text
                            className={`font-medium ${
                              isSelected ? 'text-indigo-900' : 'text-gray-900'
                            }`}>
                            {item.nome}
                          </Text>
                          {item.descricao && (
                            <Text
                              className={`mt-1 text-sm ${
                                isSelected ? 'text-indigo-600' : 'text-gray-600'
                              }`}>
                              {item.descricao}
                            </Text>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                }}
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: 400 }}
              />

              {servicos.length === 0 && (
                <View className="items-center py-8">
                  <Text className="text-center text-gray-500">Nenhum serviço disponível</Text>
                </View>
              )}
            </View>

            <View className="border-t border-gray-200 p-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-gray-600">
                  {servicosSelecionados.length} serviço(s) selecionado(s)
                </Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  className="rounded-lg bg-indigo-600 px-6 py-3">
                  <Text className="font-medium text-white">Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
