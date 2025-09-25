import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, Alert } from 'react-native';
import { Container } from '../components/Container';
import { useAuthStore } from '../store/authStore';
import { useNavigation } from '@react-navigation/native';
import {
  NavegacaoData,
  ListaAgendamentos,
  EstadosLista,
  ModalOpcoes,
  AgendamentosService,
  type Agendamento,
} from '../components/Agendamentos';

export default function TabOneScreen() {
  const { estabelecimento } = useAuthStore();
  const navigation = useNavigation();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [servicosLookup, setServicosLookup] = useState<Record<number, string>>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<Agendamento | null>(null);

  useEffect(() => {
    if (estabelecimento?.id) {
      buscarServicos();
      buscarAgendamentos();
    }
  }, [estabelecimento, dataSelecionada]);

  const buscarServicos = async () => {
    if (!estabelecimento?.id) return;

    const servicos = await AgendamentosService.buscarServicos(estabelecimento.id);
    setServicosLookup(servicos);
  };

  const buscarAgendamentos = async (isRefreshing = false) => {
    if (!estabelecimento?.id) return;

    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const agendamentos = await AgendamentosService.buscarAgendamentos(
        estabelecimento.id,
        dataSelecionada
      );
      setAgendamentos(agendamentos);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      if (isRefreshing) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  // Funções de navegação de data
  const navegarData = (direcao: 'anterior' | 'proxima') => {
    const novaData = new Date(dataSelecionada);
    if (direcao === 'anterior') {
      novaData.setDate(novaData.getDate() - 1);
    } else {
      novaData.setDate(novaData.getDate() + 1);
    }
    setDataSelecionada(novaData);
  };

  const irParaHoje = () => {
    setDataSelecionada(new Date());
  };

  const abrirCalendario = () => {
    setMostrarCalendario(true);
  };

  const confirmarData = (data: Date) => {
    setMostrarCalendario(false);
    setDataSelecionada(data);
  };

  const cancelarCalendario = () => {
    setMostrarCalendario(false);
  };

  // Funções do modal
  const abrirModalOpcoes = (agendamento: Agendamento) => {
    setAgendamentoSelecionado(agendamento);
    setModalVisible(true);
  };

  const fecharModal = () => {
    setModalVisible(false);
    setAgendamentoSelecionado(null);
  };

  const editarAgendamento = () => {
    if (!agendamentoSelecionado) return;

    fecharModal();

    // Navegação para tela de agendamento com dados para edição
    const dadosParaEdicao = {
      id: agendamentoSelecionado.id,
      nome: agendamentoSelecionado.cliente_nome,
      telefone: agendamentoSelecionado.cliente_telefone,
      email: agendamentoSelecionado.cliente_email,
      data: agendamentoSelecionado.data_agendamento,
      horario: agendamentoSelecionado.hora_inicio,
      servico_id: agendamentoSelecionado.servico_id,
      colaborador_id: agendamentoSelecionado.colaborador_id,
      observacoes: agendamentoSelecionado.observacoes,
      isEdicao: true,
    };

    // @ts-ignore - Navegação específica do projeto
    navigation.navigate('Agendamento', { dadosParaEdicao });
  };

  const cancelarAgendamento = async () => {
    if (!agendamentoSelecionado) return;

    fecharModal();
    Alert.alert(
      'Cancelar Agendamento',
      `Tem certeza que deseja cancelar o agendamento de ${agendamentoSelecionado.cliente_nome}?`,
      [
        {
          text: 'Não',
          style: 'cancel',
        },
        {
          text: 'Sim, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              const sucesso = await AgendamentosService.atualizarStatusAgendamento(
                agendamentoSelecionado.id,
                'cancelado'
              );

              if (sucesso) {
                Alert.alert('Sucesso', 'Agendamento cancelado com sucesso!');
                buscarAgendamentos();
              } else {
                Alert.alert('Erro', 'Não foi possível cancelar o agendamento.');
              }
            } catch (error) {
              console.error('Erro:', error);
              Alert.alert('Erro', 'Ocorreu um erro inesperado.');
            }
          },
        },
      ]
    );
  };

  const finalizarAgendamento = async () => {
    if (!agendamentoSelecionado) return;

    fecharModal();
    Alert.alert(
      'Finalizar Agendamento',
      `Confirma que o agendamento de ${agendamentoSelecionado.cliente_nome} foi concluído?`,
      [
        {
          text: 'Não',
          style: 'cancel',
        },
        {
          text: 'Sim, finalizar',
          onPress: async () => {
            try {
              const sucesso = await AgendamentosService.atualizarStatusAgendamento(
                agendamentoSelecionado.id,
                'concluido'
              );

              if (sucesso) {
                Alert.alert('Sucesso', 'Agendamento finalizado com sucesso!');
                buscarAgendamentos();
              } else {
                Alert.alert('Erro', 'Não foi possível finalizar o agendamento.');
              }
            } catch (error) {
              console.error('Erro:', error);
              Alert.alert('Erro', 'Ocorreu um erro inesperado.');
            }
          },
        },
      ]
    );
  };

  const copiarTextoAgendamento = async () => {
    if (!agendamentoSelecionado || !estabelecimento?.id) return;

    try {
      const textoAgendamento = await AgendamentosService.gerarTextoAgendamento(
        agendamentoSelecionado,
        estabelecimento.id,
        estabelecimento.nome || 'Nosso estabelecimento',
        servicosLookup
      );

      await AgendamentosService.copiarTextoAgendamento(textoAgendamento);
    } catch (error) {
      console.error('Erro ao copiar texto:', error);
      Alert.alert('Erro', 'Não foi possível copiar o texto.');
    }

    fecharModal();
  };

  const excluirAgendamento = async () => {
    if (!agendamentoSelecionado) return;

    fecharModal();
    Alert.alert(
      'Excluir Agendamento',
      `Tem certeza que deseja excluir PERMANENTEMENTE o agendamento de ${agendamentoSelecionado.cliente_nome}?\n\nEsta ação não pode ser desfeita.`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sim, excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const sucesso = await AgendamentosService.excluirAgendamento(
                agendamentoSelecionado.id
              );

              if (sucesso) {
                Alert.alert('Sucesso', 'Agendamento excluído com sucesso!');
                buscarAgendamentos();
              } else {
                Alert.alert('Erro', 'Não foi possível excluir o agendamento.');
              }
            } catch (error) {
              console.error('Erro:', error);
              Alert.alert('Erro', 'Ocorreu um erro inesperado.');
            }
          },
        },
      ]
    );
  };

  return (
    <Container className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => buscarAgendamentos(true)} />
        }>
        <NavegacaoData
          dataSelecionada={dataSelecionada}
          onDataAnterior={() => navegarData('anterior')}
          onProximaData={() => navegarData('proxima')}
          onAbrirCalendario={abrirCalendario}
          onIrParaHoje={irParaHoje}
          mostrarCalendario={mostrarCalendario}
          onConfirmarData={confirmarData}
          onCancelarCalendario={cancelarCalendario}
        />

        <View className="p-4">
          <EstadosLista
            loading={loading}
            agendamentos={agendamentos}
            dataSelecionada={dataSelecionada}
          />

          {!loading && agendamentos.length > 0 && (
            <ListaAgendamentos agendamentos={agendamentos} onAbrirModal={abrirModalOpcoes} />
          )}
        </View>
      </ScrollView>

      <ModalOpcoes
        visible={modalVisible}
        agendamento={agendamentoSelecionado}
        onFechar={fecharModal}
        onEditar={editarAgendamento}
        onFinalizar={finalizarAgendamento}
        onCancelar={cancelarAgendamento}
        onExcluir={excluirAgendamento}
        onCopiar={copiarTextoAgendamento}
      />
    </Container>
  );
}
