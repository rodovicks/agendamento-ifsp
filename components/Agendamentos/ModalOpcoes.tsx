import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { type Agendamento } from './ItemAgendamento';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeClasses } from '../../utils/theme';

interface ModalOpcoesProps {
  visible: boolean;
  agendamento: Agendamento | null;
  onFechar: () => void;
  onEditar: () => void;
  onFinalizar: () => void;
  onCancelar: () => void;
  onExcluir: () => void;
  onCopiar: () => void;
}

export function ModalOpcoes({
  visible,
  agendamento,
  onFechar,
  onEditar,
  onFinalizar,
  onCancelar,
  onExcluir,
  onCopiar,
}: ModalOpcoesProps) {
  const { isDark } = useTheme();
  const themeClasses = getThemeClasses(isDark);

  const formatarData = (dataStr: string) => {
    const data = new Date(dataStr + 'T00:00:00');
    return data.toLocaleDateString('pt-BR');
  };

  if (!agendamento) return null;

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onFechar}>
      <View className="flex-1 justify-end bg-black/50">
        <View className={`rounded-t-3xl p-6 ${themeClasses.cardBackground}`}>
          <View className="mb-6 items-center">
            <Text className={`text-lg font-semibold ${themeClasses.textPrimary}`}>
              {agendamento.cliente_nome}
            </Text>
            <Text className={`text-sm ${themeClasses.textMuted}`}>
              {agendamento.hora_inicio.slice(0, 5)} -{' '}
              {formatarData(agendamento.data_agendamento)}{' '}
            </Text>
          </View>

          <View className="space-y-6">
            {/* Opção Editar */}
            <TouchableOpacity
              onPress={onEditar}
              className="flex-row items-center rounded-lg bg-blue-50 p-4"
              activeOpacity={0.7}>
              <View className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <Feather name="edit-3" size={20} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-800">Editar</Text>
                <Text className="text-sm text-gray-500">Modificar dados do agendamento</Text>
              </View>
            </TouchableOpacity>

            {/* Opção Finalizar */}
            {agendamento.status !== 'concluido' && agendamento.status !== 'cancelado' && (
              <TouchableOpacity
                onPress={onFinalizar}
                className="flex-row items-center rounded-lg bg-green-50 p-4"
                activeOpacity={0.7}>
                <View className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <Feather name="check-circle" size={20} color="#10B981" />
                </View>
                <View className="flex-1">
                  <Text className={`text-base font-medium ${themeClasses.textPrimary}`}>
                    Finalizar
                  </Text>
                  <Text className={`text-sm ${themeClasses.textMuted}`}>Marcar como concluído</Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Opção Cancelar */}
            {agendamento.status !== 'cancelado' && agendamento.status !== 'concluido' && (
              <TouchableOpacity
                onPress={onCancelar}
                className="flex-row items-center rounded-lg bg-red-50 p-4"
                activeOpacity={0.7}>
                <View className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-red-100">
                  <Feather name="x-circle" size={20} color="#EF4444" />
                </View>
                <View className="flex-1">
                  <Text className={`text-base font-medium ${themeClasses.textPrimary}`}>
                    Cancelar
                  </Text>
                  <Text className={`text-sm ${themeClasses.textMuted}`}>
                    Cancelar este agendamento
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Opção Excluir - Apenas para agendamentos com status "agendado" */}
            {(agendamento.status === 'agendado' || !agendamento.status) && (
              <TouchableOpacity
                onPress={onExcluir}
                className="flex-row items-center rounded-lg bg-red-100 p-4"
                activeOpacity={0.7}>
                <View className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-red-200">
                  <Feather name="trash-2" size={20} color="#DC2626" />
                </View>
                <View className="flex-1">
                  <Text className={`text-base font-medium ${themeClasses.textPrimary}`}>
                    Excluir
                  </Text>
                  <Text className={`text-sm ${themeClasses.textMuted}`}>
                    Excluir permanentemente
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Opção Copiar */}
            <TouchableOpacity
              onPress={onCopiar}
              className="flex-row items-center rounded-lg bg-purple-50 p-4"
              activeOpacity={0.7}>
              <View className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <Feather name="copy" size={20} color="#8B5CF6" />
              </View>
              <View className="flex-1">
                <Text className={`text-base font-medium ${themeClasses.textPrimary}`}>
                  Copiar Dados
                </Text>
                <Text className={`text-sm ${themeClasses.textMuted}`}>
                  Copiar texto para compartilhar
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Botão Fechar */}
          <TouchableOpacity
            onPress={onFechar}
            className={`mt-6 rounded-lg p-4 ${isDark ? 'bg-slate-700' : 'bg-gray-100'}`}
            activeOpacity={0.7}>
            <Text className={`text-center text-base font-medium ${themeClasses.textSecondary}`}>
              Fechar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
