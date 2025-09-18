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
import { atendimentosService, Agendamento } from '../utils/atendimentos';

interface ModalIniciarAtendimentoProps {
  visible: boolean;
  onClose: () => void;
  agendamento?: Agendamento | null;
  onAtendimentoCriado: () => void;
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

export const ModalIniciarAtendimento: React.FC<ModalIniciarAtendimentoProps> = ({
  visible,
  onClose,
  agendamento,
  onAtendimentoCriado,
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
    if (agendamento) {
      setObservacoes(agendamento.observacoes || '');
      if (agendamento.servico_id) {
        setServicosSelecionados([agendamento.servico_id]);
      }
      if (agendamento.colaborador_id) {
        setColaboradoresSelecionados([agendamento.colaborador_id]);
      }
    }
  }, [agendamento]);

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

      // Carregar colaboradores com preferência para o serviço do agendamento
      const colaboradoresData = await atendimentosService.buscarColaboradoresComPreferencia(
        estabelecimento.id,
        agendamento?.servico_id
      );

      setColaboradores(colaboradoresData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados necessários.');
    } finally {
      setCarregandoDados(false);
    }
  };

  const handleIniciarAtendimento = async () => {
    if (servicosSelecionados.length === 0) {
      Alert.alert('Erro', 'Selecione pelo menos um serviço.');
      return;
    }

    if (!agendamento) {
      Alert.alert('Erro', 'Dados do agendamento não encontrados.');
      return;
    }

    try {
      setLoading(true);

      await atendimentosService.criarAtendimentoDeAgendamento(
        agendamento,
        servicosSelecionados,
        colaboradoresSelecionados,
        observacoes
      );

      Alert.alert('Sucesso', 'Atendimento iniciado com sucesso!');
      onAtendimentoCriado();
      onClose();
    } catch (error) {
      console.error('Erro ao iniciar atendimento:', error);
      Alert.alert('Erro', 'Não foi possível iniciar o atendimento.');
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

  if (!agendamento) {
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
            <Text className="text-lg font-semibold text-gray-900">Iniciar Atendimento</Text>
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
                <Text className="font-medium">Nome:</Text> {agendamento.cliente_nome}
              </Text>
              {agendamento.cliente_telefone && (
                <Text className="text-gray-700">
                  <Text className="font-medium">Telefone:</Text> {agendamento.cliente_telefone}
                </Text>
              )}
              <Text className="text-gray-700">
                <Text className="font-medium">Data:</Text>{' '}
                {new Date(agendamento.data_agendamento).toLocaleDateString('pt-BR')}
              </Text>
              <Text className="text-gray-700">
                <Text className="font-medium">Horário:</Text> {agendamento.hora_inicio.slice(0, 5)}{' '}
                - {agendamento.hora_fim.slice(0, 5)}
              </Text>
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

            {/* Botão de Ação */}
            <View className="pb-4">
              <Button
                title="Iniciar Atendimento"
                onPress={handleIniciarAtendimento}
                loading={loading}
                disabled={servicosSelecionados.length === 0}
              />
            </View>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};
