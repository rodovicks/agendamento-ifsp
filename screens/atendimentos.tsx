import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Container } from '../components/Container';
import { ModalIniciarAtendimento } from '../components/ModalIniciarAtendimento';
import { ModalEditarAtendimento } from '../components/ModalEditarAtendimento';
import { useAuthStore } from '../store/authStore';
import { atendimentosService, AtendimentoCompleto, Agendamento } from '../utils/atendimentos';
import { supabase } from '../utils/supabase';

export default function AtendimentosScreen() {
  const { estabelecimento } = useAuthStore();
  const [atendimentos, setAtendimentos] = useState<AtendimentoCompleto[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dataAtual] = useState(new Date().toISOString().split('T')[0]);

  // Estados para modais
  const [modalIniciarVisible, setModalIniciarVisible] = useState(false);
  const [modalEditarVisible, setModalEditarVisible] = useState(false);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<Agendamento | null>(null);
  const [atendimentoSelecionado, setAtendimentoSelecionado] = useState<AtendimentoCompleto | null>(
    null
  );

  const buscarDados = async () => {
    if (!estabelecimento?.id) return;

    try {
      setLoading(true);

      // Buscar atendimentos
      const dadosAtendimentos = await atendimentosService.buscarAtendimentosPorData(
        estabelecimento.id,
        dataAtual
      );
      setAtendimentos(dadosAtendimentos);

      // Buscar agendamentos que ainda não foram convertidos em atendimento
      const { data: dadosAgendamentos, error } = await supabase
        .from('agendamentos')
        .select('*')
        .eq('estabelecimento_id', estabelecimento.id)
        .eq('data_agendamento', dataAtual)
        .eq('status', 'agendado')
        .order('hora_inicio');

      if (error) {
        throw error;
      }

      // Filtrar agendamentos que não foram convertidos em atendimento
      const agendamentosDisponiveis = [];
      for (const agendamento of dadosAgendamentos || []) {
        const jaConvertido = await atendimentosService.verificarAgendamentoConvertido(
          agendamento.id
        );
        if (!jaConvertido) {
          agendamentosDisponiveis.push(agendamento);
        }
      }

      setAgendamentos(agendamentosDisponiveis);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await buscarDados();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      buscarDados();
    }, [estabelecimento?.id])
  );

  const formatarHorario = (hora: string) => {
    return hora.slice(0, 5); // Remove segundos
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado':
        return '#3B82F6'; // azul
      case 'em_andamento':
        return '#F59E0B'; // amarelo
      case 'finalizado':
        return '#10B981'; // verde
      case 'cancelado':
        return '#EF4444'; // vermelho
      default:
        return '#6B7280'; // cinza
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'agendado':
        return 'Agendado';
      case 'em_andamento':
        return 'Em Andamento';
      case 'finalizado':
        return 'Finalizado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const handleIniciarAtendimento = (item: AtendimentoCompleto | Agendamento) => {
    // Se for um atendimento já criado, apenas muda o status
    if ('valor_total' in item) {
      // É um atendimento
      Alert.alert('Atenção', 'Este atendimento já foi iniciado.');
      return;
    }

    // É um agendamento - converter para atendimento
    setAgendamentoSelecionado(item as Agendamento);
    setModalIniciarVisible(true);
  };

  const handleEditarAtendimento = (atendimento: AtendimentoCompleto) => {
    setAtendimentoSelecionado(atendimento);
    setModalEditarVisible(true);
  };

  const handleFinalizarAtendimento = async (atendimento: AtendimentoCompleto) => {
    if (atendimento.servicos.length === 0) {
      Alert.alert('Erro', 'O atendimento deve ter pelo menos um serviço para ser finalizado.');
      return;
    }

    Alert.alert('Finalizar Atendimento', 'Tem certeza que deseja finalizar este atendimento?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Finalizar',
        onPress: async () => {
          try {
            const horaAtual = new Date().toTimeString().slice(0, 8);
            await atendimentosService.finalizarAtendimento(atendimento.id, horaAtual);
            await buscarDados();
            Alert.alert('Sucesso', 'Atendimento finalizado com sucesso!');
          } catch (error) {
            console.error('Erro ao finalizar atendimento:', error);
            Alert.alert('Erro', 'Não foi possível finalizar o atendimento.');
          }
        },
      },
    ]);
  };

  const handleCancelarAtendimento = async (atendimento: AtendimentoCompleto) => {
    Alert.alert('Cancelar Atendimento', 'Tem certeza que deseja cancelar este atendimento?', [
      { text: 'Não', style: 'cancel' },
      {
        text: 'Sim, cancelar',
        style: 'destructive',
        onPress: async () => {
          try {
            await atendimentosService.cancelarAtendimento(atendimento.id);
            await buscarDados();
            Alert.alert('Sucesso', 'Atendimento cancelado.');
          } catch (error) {
            console.error('Erro ao cancelar atendimento:', error);
            Alert.alert('Erro', 'Não foi possível cancelar o atendimento.');
          }
        },
      },
    ]);
  };

  const handleExcluirAgendamento = async (agendamento: Agendamento) => {
    Alert.alert(
      'Excluir Agendamento',
      `Tem certeza que deseja excluir o agendamento de ${agendamento.cliente_nome}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await atendimentosService.excluirAgendamento(agendamento.id);
              await buscarDados();
              Alert.alert('Sucesso', 'Agendamento excluído com sucesso.');
            } catch (error: any) {
              console.error('Erro ao excluir agendamento:', error);
              const mensagem = error.message || 'Não foi possível excluir o agendamento.';
              Alert.alert('Erro', mensagem);
            }
          },
        },
      ]
    );
  };

  const renderAgendamento = ({ item }: { item: Agendamento }) => {
    return (
      <View className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
        {/* Header do agendamento */}
        <View className="mb-3 flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900">{item.cliente_nome}</Text>
            <Text className="text-sm text-gray-600">
              {formatarHorario(item.hora_inicio)} - {formatarHorario(item.hora_fim)}
            </Text>
            {item.cliente_telefone && (
              <Text className="text-sm text-gray-600">📞 {item.cliente_telefone}</Text>
            )}
          </View>
          <View className="rounded-full bg-blue-100 px-3 py-1">
            <Text className="text-xs font-medium text-blue-800">Agendado</Text>
          </View>
        </View>

        {/* Observações */}
        {item.observacoes && (
          <View className="mb-3">
            <Text className="mb-1 text-sm font-medium text-gray-700">Observações:</Text>
            <Text className="text-sm text-gray-600">{item.observacoes}</Text>
          </View>
        )}

        {/* Ações */}
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => handleIniciarAtendimento(item)}
            className="flex-1 flex-row items-center justify-center rounded-lg bg-blue-500 px-3 py-2">
            <Feather name="play" size={16} color="white" />
            <Text className="ml-1 font-medium text-white">Iniciar Atendimento</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleExcluirAgendamento(item)}
            className="flex-row items-center justify-center rounded-lg bg-red-500 px-3 py-2">
            <Feather name="trash-2" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderAtendimento = ({ item }: { item: AtendimentoCompleto }) => {
    const statusColor = getStatusColor(item.status);
    const statusText = getStatusText(item.status);

    return (
      <View className="mb-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        {/* Header do atendimento */}
        <View className="mb-3 flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900">{item.cliente_nome}</Text>
            <Text className="text-sm text-gray-600">
              {formatarHorario(item.hora_inicio)}
              {item.hora_fim && ` - ${formatarHorario(item.hora_fim)}`}
            </Text>
            {item.cliente_telefone && (
              <Text className="text-sm text-gray-600">📞 {item.cliente_telefone}</Text>
            )}
          </View>
          <View className="rounded-full px-3 py-1" style={{ backgroundColor: statusColor + '20' }}>
            <Text className="text-xs font-medium" style={{ color: statusColor }}>
              {statusText}
            </Text>
          </View>
        </View>

        {/* Serviços */}
        {item.servicos.length > 0 && (
          <View className="mb-3">
            <Text className="mb-1 text-sm font-medium text-gray-700">Serviços:</Text>
            {item.servicos.map((servico, index) => (
              <Text key={index} className="text-sm text-gray-600">
                • {servico.servico.nome} - R$ {servico.preco.toFixed(2)}
              </Text>
            ))}
          </View>
        )}

        {/* Colaboradores */}
        {item.colaboradores.length > 0 && (
          <View className="mb-3">
            <Text className="mb-1 text-sm font-medium text-gray-700">Colaboradores:</Text>
            {item.colaboradores.map((colaborador, index) => (
              <Text key={index} className="text-sm text-gray-600">
                • {colaborador.colaborador.nome}
              </Text>
            ))}
          </View>
        )}

        {/* Valor total */}
        <View className="mb-3">
          <Text className="text-sm font-medium text-gray-700">
            Valor Total: R$ {item.valor_total.toFixed(2)}
          </Text>
        </View>

        {/* Observações */}
        {item.observacoes && (
          <View className="mb-3">
            <Text className="mb-1 text-sm font-medium text-gray-700">Observações:</Text>
            <Text className="text-sm text-gray-600">{item.observacoes}</Text>
          </View>
        )}

        {/* Ações */}
        <View className="flex-row gap-2">
          {item.status === 'agendado' && (
            <TouchableOpacity
              onPress={() => handleIniciarAtendimento(item)}
              className="flex-1 flex-row items-center justify-center rounded-lg bg-blue-500 px-3 py-2">
              <Feather name="play" size={16} color="white" />
              <Text className="ml-1 font-medium text-white">Iniciar</Text>
            </TouchableOpacity>
          )}

          {item.status === 'em_andamento' && (
            <>
              <TouchableOpacity
                onPress={() => handleEditarAtendimento(item)}
                className="flex-1 flex-row items-center justify-center rounded-lg bg-orange-500 px-3 py-2">
                <Feather name="edit" size={16} color="white" />
                <Text className="ml-1 font-medium text-white">Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleFinalizarAtendimento(item)}
                className="flex-1 flex-row items-center justify-center rounded-lg bg-green-500 px-3 py-2">
                <Feather name="check" size={16} color="white" />
                <Text className="ml-1 font-medium text-white">Finalizar</Text>
              </TouchableOpacity>
            </>
          )}

          {(item.status === 'agendado' || item.status === 'em_andamento') && (
            <TouchableOpacity
              onPress={() => handleCancelarAtendimento(item)}
              className="flex-row items-center justify-center rounded-lg bg-red-500 px-3 py-2">
              <Feather name="x" size={16} color="white" />
              <Text className="ml-1 font-medium text-white">Cancelar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderItem = ({ item }: { item: AtendimentoCompleto | Agendamento }) => {
    // Verificar se é um atendimento ou agendamento
    if ('valor_total' in item) {
      return renderAtendimento({ item: item as AtendimentoCompleto });
    } else {
      return renderAgendamento({ item: item as Agendamento });
    }
  };

  // Combinar agendamentos e atendimentos em uma lista ordenada por horário
  const todosItens = [...agendamentos, ...atendimentos].sort((a, b) => {
    return a.hora_inicio.localeCompare(b.hora_inicio);
  });

  return (
    <Container>
      <View className="flex-1">
        {/* Header */}
        <View className="mb-4 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-gray-900">Atendimentos</Text>
            <Text className="text-gray-600">
              {new Date().toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
              })}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              // TODO: Implementar criação de atendimento direto
            }}
            className="rounded-lg bg-blue-500 p-3">
            <Feather name="plus" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Lista de atendimentos e agendamentos */}
        <FlatList
          data={todosItens}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-8">
              <Feather name="calendar" size={48} color="#9CA3AF" />
              <Text className="mt-4 text-center text-gray-500">
                Nenhum agendamento ou atendimento encontrado para hoje
              </Text>
              <Text className="mt-2 text-center text-sm text-gray-400">
                Puxe para baixo para atualizar
              </Text>
            </View>
          }
        />
      </View>

      {/* Modais */}
      <ModalIniciarAtendimento
        visible={modalIniciarVisible}
        onClose={() => {
          setModalIniciarVisible(false);
          setAgendamentoSelecionado(null);
        }}
        agendamento={agendamentoSelecionado}
        onAtendimentoCriado={() => {
          buscarDados();
          setModalIniciarVisible(false);
          setAgendamentoSelecionado(null);
        }}
      />

      <ModalEditarAtendimento
        visible={modalEditarVisible}
        onClose={() => {
          setModalEditarVisible(false);
          setAtendimentoSelecionado(null);
        }}
        atendimento={atendimentoSelecionado}
        onAtendimentoAtualizado={() => {
          buscarDados();
          setModalEditarVisible(false);
          setAtendimentoSelecionado(null);
        }}
      />
    </Container>
  );
}
