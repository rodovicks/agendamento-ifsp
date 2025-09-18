import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { RAMOS_ATIVIDADE, RamoAtividade } from '../data/ramosAtividade';

interface SelectRamoAtividadeProps {
  value?: RamoAtividade | null;
  onValueChange: (ramo: RamoAtividade | null) => void;
  placeholder?: string;
  disabled?: boolean;
  excludeIds?: number[]; // Para excluir ramos específicos da lista
  customRamos?: RamoAtividade[]; // Lista customizada de ramos (substitui a lista padrão)
}

export function SelectRamoAtividade({
  value,
  onValueChange,
  placeholder = 'Selecione um ramo de atividade',
  disabled = false,
  excludeIds = [],
  customRamos,
}: SelectRamoAtividadeProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const filteredRamos = customRamos
    ? customRamos.filter((ramo) => !excludeIds.includes(ramo.id))
    : RAMOS_ATIVIDADE.filter((ramo) => !excludeIds.includes(ramo.id));

  const handleSelect = (ramo: RamoAtividade) => {
    onValueChange(ramo);
    setModalVisible(false);
  };

  const handleClear = () => {
    onValueChange(null);
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
            value ? 'text-gray-900' : disabled ? 'text-gray-400' : 'text-gray-500'
          }`}>
          {value ? value.nomeRamoAtividade : placeholder}
        </Text>

        <View className="flex-row items-center">
          {value && !disabled && (
            <TouchableOpacity onPress={handleClear} className="mr-2">
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
          <View className="max-h-96 rounded-t-3xl bg-white">
            <View className="flex-row items-center justify-between border-b border-gray-200 p-4">
              <Text className="text-lg font-semibold text-gray-900">
                Selecionar Ramo de Atividade
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={filteredRamos}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelect(item)}
                  className={`border-b border-gray-100 p-4 ${
                    value?.id === item.id ? 'bg-indigo-50' : ''
                  }`}>
                  <Text
                    className={`text-base ${
                      value?.id === item.id ? 'font-semibold text-indigo-600' : 'text-gray-900'
                    }`}>
                    {item.nomeRamoAtividade}
                  </Text>
                  <Text className="mt-1 text-sm text-gray-500">
                    {item.servicos.length} serviços disponíveis
                  </Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
