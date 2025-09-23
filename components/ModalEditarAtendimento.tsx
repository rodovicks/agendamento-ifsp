import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Button } from './Button';
import { Input } from './Input';
import { MultiSelectServicos } from './MultiSelectServicos';
import { supabase } from '../utils/supabase';
import { useAuthStore } from '../store/authStore';
import { atendimentosService, AtendimentoCompleto } from '../utils/atendimentos';

interface ModalEditarAtendimentoProps {
  visible: boolean;
  onClose: () => void;
  atendimento?: AtendimentoCompleto | null;
  onAtendimentoAtualizado: () => void;
}

interface Servico {
  id: string;
  nome: string;
  descricao?: string;
  preco?: number;
  duracao?: number;
}

interface Colaborador {
  id: number;
  nome: string;
  foto_url?: string;
  temPreferencia: boolean;
}

export const ModalEditarAtendimento: React.FC<ModalEditarAtendimentoProps> = ({
  visible,
  onClose,
  atendimento,
  onAtendimentoAtualizado,
}) => {
  const { estabelecimento } = useAuthStore();
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [servicosSelecionados, setServicosSelecionados] = useState<string[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [colaboradoresSelecionados, setColaboradoresSelecionados] = useState<number[]>([]);
  const [observacoes, setObservacoes] = useState('');
  const [loading, setLoading] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(false);

  useEffect(() => {
    if (visible && estabelecimento?.id) {
      carregarDados();
    }
  }, [visible, estabelecimento?.id]);

  useEffect(() => {
    if (atendimento) {
      setObservacoes(atendimento.observacoes || '');
      setServicosSelecionados(atendimento.servicos.map((s) => s.servico_id));
      setColaboradoresSelecionados(atendimento.colaboradores.map((c) => c.colaborador_id));
    }
  }, [atendimento]);

  const carregarDados = async () => {
    if (!estabelecimento?.id) return;

    try {
      setCarregandoDados(true);

      // Carregar serviços
      const { data: servicosData, error: servicosError } = await supabase
        .from('servicos')
        .select('id, nome, descricao, preco, duracao')
        .eq('estabelecimento_id', estabelecimento.id)
        .eq('ativo', true)
        .order('nome');

      if (servicosError) {
        throw servicosError;
      }

      setServicos(servicosData || []);

      // Carregar colaboradores com preferência baseada nos serviços já selecionados
      const servicoPrincipal = atendimento?.servicos[0]?.servico_id;
      const colaboradoresData = await atendimentosService.buscarColaboradoresComPreferencia(
        estabelecimento.id,
        servicoPrincipal
      );

      setColaboradores(colaboradoresData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados necessários.');
    } finally {
      setCarregandoDados(false);
    }
  };

  const handleSalvarAlteracoes = async () => {
    if (servicosSelecionados.length === 0) {
      Alert.alert('Erro', 'Selecione pelo menos um serviço.');
      return;
    }

    if (!atendimento) {
      Alert.alert('Erro', 'Dados do atendimento não encontrados.');
      return;
    }

    try {
      setLoading(true);

      // Atualizar serviços
      await atendimentosService.atualizarServicos(atendimento.id, servicosSelecionados);

      // Atualizar colaboradores
      await atendimentosService.atualizarColaboradores(atendimento.id, colaboradoresSelecionados);

      // Atualizar observações se necessário
      if (observacoes !== atendimento.observacoes) {
        const { error } = await supabase
          .from('atendimentos')
          .update({ observacoes })
          .eq('id', atendimento.id);

        if (error) {
          throw error;
        }
      }

      Alert.alert('Sucesso', 'Atendimento atualizado com sucesso!');
      onAtendimentoAtualizado();
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar atendimento:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o atendimento.');
    } finally {
      setLoading(false);
    }
  };

  const toggleColaborador = (colaboradorId: number) => {
    setColaboradoresSelecionados((prev) => {
      if (prev.includes(colaboradorId)) {
        return prev.filter((id) => id !== colaboradorId);
      } else {
        return [...prev, colaboradorId];
      }
    });
  };

  const resetModal = () => {
    setServicosSelecionados([]);
    setColaboradoresSelecionados([]);
    setObservacoes('');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  // Calcular total dos serviços selecionados
  const calcularTotal = () => {
    return servicosSelecionados.reduce((total, servicoId) => {
      const servico = servicos.find((s) => s.id === servicoId);
      return total + (servico?.preco || 0);
    }, 0);
  };

  if (!atendimento) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}>
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="border-b border-gray-200 bg-white px-4 py-3">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={handleClose}>
              <Feather name="x" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-900">Editar Atendimento</Text>
            <View style={{ width: 24 }} />
          </View>
        </View>

        {carregandoDados ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="mt-4 text-gray-600">Carregando dados...</Text>
          </View>
        ) : (
          <ScrollView className="flex-1 p-4">
            {/* Informações do Cliente */}
            <View className="mb-4 rounded-lg bg-white p-4 shadow-sm">
              <Text className="mb-2 text-lg font-semibold text-gray-900">Cliente</Text>
              <Text className="text-gray-700">
                <Text className="font-medium">Nome:</Text> {atendimento.cliente_nome}
              </Text>
              {atendimento.cliente_telefone && (
                <Text className="text-gray-700">
                  <Text className="font-medium">Telefone:</Text> {atendimento.cliente_telefone}
                </Text>
              )}
              <Text className="text-gray-700">
                <Text className="font-medium">Data:</Text>{' '}
                {new Date(atendimento.data_atendimento).toLocaleDateString('pt-BR')}
              </Text>
              <Text className="text-gray-700">
                <Text className="font-medium">Horário:</Text> {atendimento.hora_inicio.slice(0, 5)}
                {atendimento.hora_fim && ` - ${atendimento.hora_fim.slice(0, 5)}`}
              </Text>
              <View className="mt-2 self-start rounded-full bg-orange-100 px-3 py-1">
                <Text className="text-sm font-medium text-orange-800">Em Andamento</Text>
              </View>
            </View>

            {/* Seleção de Serviços */}
            <View className="mb-4 rounded-lg bg-white p-4 shadow-sm">
              <Text className="mb-3 text-lg font-semibold text-gray-900">
                Serviços do Atendimento *
              </Text>
              <MultiSelectServicos
                servicos={servicos}
                servicosSelecionados={servicosSelecionados}
                onSelectionChange={setServicosSelecionados}
              />

              {/* Mostrar total calculado */}
              <View className="mt-3 rounded-lg bg-gray-50 p-3">
                <Text className="text-lg font-semibold text-gray-900">
                  Total: R$ {calcularTotal().toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Seleção de Colaboradores */}
            <View className="mb-4 rounded-lg bg-white p-4 shadow-sm">
              <Text className="mb-3 text-lg font-semibold text-gray-900">
                Colaboradores (Opcional)
              </Text>
              <Text className="mb-3 text-sm text-gray-600">
                Colaboradores com ⭐ têm preferência para os serviços selecionados
              </Text>

              {colaboradores.length === 0 ? (
                <Text className="py-4 text-center text-gray-500">
                  Nenhum colaborador cadastrado
                </Text>
              ) : (
                colaboradores.map((colaborador) => (
                  <TouchableOpacity
                    key={colaborador.id}
                    onPress={() => toggleColaborador(colaborador.id)}
                    className={`mb-2 flex-row items-center rounded-lg border p-3 ${
                      colaboradoresSelecionados.includes(colaborador.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 bg-white'
                    }`}>
                    <View className="flex-1 flex-row items-center">
                      <Text className="font-medium text-gray-900">{colaborador.nome}</Text>
                      {colaborador.temPreferencia && <Text className="ml-2">⭐</Text>}
                    </View>

                    <View
                      className={`h-5 w-5 rounded border-2 ${
                        colaboradoresSelecionados.includes(colaborador.id)
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      } items-center justify-center`}>
                      {colaboradoresSelecionados.includes(colaborador.id) && (
                        <Feather name="check" size={12} color="white" />
                      )}
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>

            {/* Observações */}
            <View className="mb-4 rounded-lg bg-white p-4 shadow-sm">
              <Text className="mb-3 text-lg font-semibold text-gray-900">Observações</Text>
              <Input
                value={observacoes}
                onChangeText={setObservacoes}
                placeholder="Observações adicionais sobre o atendimento..."
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Botões de Ação */}
            <View className="flex-row gap-3 pb-4">
              <Button
                title="Cancelar"
                onPress={handleClose}
                variant="outline"
                style={{ flex: 1 }}
              />
              <Button
                title="Salvar Alterações"
                onPress={handleSalvarAlteracoes}
                loading={loading}
                disabled={servicosSelecionados.length === 0}
                style={{ flex: 2 }}
              />
            </View>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};
