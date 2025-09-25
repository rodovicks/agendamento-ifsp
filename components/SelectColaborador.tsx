import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/theme';

interface Colaborador {
  id: number;
  nome: string;
  colaboradores_servicos?: { servico_id: number }[];
}

interface SelectColaboradorProps {
  colaboradores: Colaborador[];
  colaboradorSelecionado: number | null;
  onColaboradorChange: (colaboradorId: number | null) => void;
  servicosSelecionados?: number[];
  placeholder?: string;
  disabled?: boolean;
}

export function SelectColaborador({
  colaboradores,
  colaboradorSelecionado,
  onColaboradorChange,
  servicosSelecionados = [],
  placeholder = 'Selecione um colaborador',
  disabled = false,
}: SelectColaboradorProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const { isDark } = useTheme();
  const themeClasses = getThemeClasses(isDark);

  const colaboradoresOrganizados = React.useMemo(() => {
    if (servicosSelecionados.length === 0) {
      return colaboradores;
    }

    const preferenciais = colaboradores.filter((c) =>
      c.colaboradores_servicos?.some((cs) => servicosSelecionados.includes(cs.servico_id))
    );

    const outros = colaboradores.filter(
      (c) => !c.colaboradores_servicos?.some((cs) => servicosSelecionados.includes(cs.servico_id))
    );

    return [...preferenciais, ...outros];
  }, [colaboradores, servicosSelecionados]);

  const colaboradorSelecionadoObj = colaboradores.find((c) => c.id === colaboradorSelecionado);

  const isPreferencial = (colaborador: Colaborador) => {
    if (servicosSelecionados.length === 0) return false;
    return colaborador.colaboradores_servicos?.some((cs) =>
      servicosSelecionados.includes(cs.servico_id)
    );
  };

  const getDisplayText = () => {
    if (!colaboradorSelecionado) {
      return placeholder;
    }

    return colaboradorSelecionadoObj?.nome || '';
  };

  const limparSelecao = () => {
    onColaboradorChange(null);
  };

  return (
    <View>
      <TouchableOpacity
        onPress={() => !disabled && setModalVisible(true)}
        className={`flex-row items-center justify-between rounded-lg border px-4 py-3 ${
          disabled
            ? `${themeClasses.borderLight} ${isDark ? 'bg-slate-800' : 'bg-gray-50'}`
            : `${themeClasses.border} ${themeClasses.inputBackground}`
        }`}
        disabled={disabled}>
        <Text
          className={`flex-1 ${
            colaboradorSelecionado
              ? themeClasses.textPrimary
              : disabled
                ? themeClasses.textMuted
                : themeClasses.textMuted
          }`}>
          {getDisplayText()}
        </Text>

        <View className="flex-row items-center">
          {colaboradorSelecionado && !disabled && (
            <TouchableOpacity onPress={limparSelecao} className="mr-2">
              <Feather name="x" size={18} color={isDark ? '#94A3B8' : '#6B7280'} />
            </TouchableOpacity>
          )}
          {!disabled && (
            <Feather name="chevron-down" size={18} color={isDark ? '#94A3B8' : '#6B7280'} />
          )}
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <View className="flex-1 justify-end bg-black/50">
          <View className={`max-h-4/5 rounded-t-3xl ${themeClasses.cardBackground}`}>
            <View
              className={`flex-row items-center justify-between border-b p-4 ${themeClasses.borderLight}`}>
              <Text className={`text-lg font-semibold ${themeClasses.textPrimary}`}>
                Selecionar Colaborador
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color={isDark ? '#94A3B8' : '#6B7280'} />
              </TouchableOpacity>
            </View>

            <View className="p-4">
              {servicosSelecionados.length > 0 && (
                <View className="mb-4 rounded-lg bg-indigo-50 p-3">
                  <Text className="text-sm text-indigo-700">
                    💡 Colaboradores especialistas nos serviços selecionados aparecem primeiro
                  </Text>
                </View>
              )}

              <View className="mb-4 flex-row items-center justify-between">
                <Text className={`text-sm font-medium ${themeClasses.textSecondary}`}>
                  Colaboradores disponíveis ({colaboradores.length}):
                </Text>
                {colaboradorSelecionado && (
                  <TouchableOpacity onPress={limparSelecao}>
                    <Text className="text-sm text-indigo-600">Limpar seleção</Text>
                  </TouchableOpacity>
                )}
              </View>

              <FlatList
                data={colaboradoresOrganizados}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => {
                  const isSelected = colaboradorSelecionado === item.id;
                  const isPref = isPreferencial(item);

                  return (
                    <TouchableOpacity
                      onPress={() => {
                        onColaboradorChange(item.id);
                        setModalVisible(false);
                      }}
                      className={`mb-3 rounded-lg border p-3 ${
                        isSelected
                          ? 'border-indigo-300 bg-indigo-50'
                          : `${themeClasses.border} ${themeClasses.cardBackground}`
                      }`}>
                      <View className="flex-row items-start">
                        <View
                          className={`mr-3 h-5 w-5 items-center justify-center rounded-full border-2 ${
                            isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
                          }`}>
                          {isSelected && <Feather name="check" size={12} color="white" />}
                        </View>
                        <View className="flex-1">
                          <Text
                            className={`font-medium ${
                              isSelected ? 'text-indigo-900' : themeClasses.textPrimary
                            }`}>
                            {item.nome}
                          </Text>
                          {isPref && (
                            <Text
                              className={`mt-1 text-sm ${
                                isSelected ? 'text-indigo-600' : themeClasses.textSecondary
                              }`}>
                              ⭐ Especialista nos serviços selecionados
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

              {colaboradores.length === 0 && (
                <View className="items-center py-8">
                  <Text className={`text-center ${themeClasses.textMuted}`}>
                    Nenhum colaborador disponível
                  </Text>
                </View>
              )}
            </View>

            <View className={`border-t p-4 ${themeClasses.borderLight}`}>
              <View className="flex-row items-center justify-between">
                <Text className={`text-sm ${themeClasses.textSecondary}`}>
                  {colaboradorSelecionado
                    ? '1 colaborador selecionado'
                    : 'Nenhum colaborador selecionado'}
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
