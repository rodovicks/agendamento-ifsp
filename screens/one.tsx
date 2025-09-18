import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Container } from '../components/Container';
import { supabase } from '../utils/supabase';
import { useAuthStore } from '../store/authStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Feather } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

interface Agendamento {
  id: string;
  cliente_nome: string;
  cliente_telefone: string;
  cliente_email?: string;
  data_agendamento: string;
  hora_inicio: string;
  hora_fim: string;
  status?: string;
  servico_id?: number;
  colaborador_id?: number;
  observacoes?: string;
  servicos?: { nome: string }[];
  colaboradores?: { nome: string }[];
}

export default function TabOneScreen() {
  const { estabelecimento } = useAuthStore();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [servicosLookup, setServicosLookup] = useState<Record<number, string>>({});

  useEffect(() => {
    buscarServicos();
    buscarAgendamentos();
  }, [estabelecimento, dataSelecionada]);

  const buscarServicos = async () => {
    if (!estabelecimento?.id) return;

    try {
      const { data, error } = await supabase
        .from('servicos')
        .select('id, nome')
        .eq('estabelecimento_id', estabelecimento.id);

      if (error) {
        console.error('Erro ao buscar serviços:', error);
      } else if (data) {
        const lookup = data.reduce(
          (acc, servico) => {
            acc[servico.id] = servico.nome;
            return acc;
          },
          {} as Record<number, string>
        );
        setServicosLookup(lookup);
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const buscarAgendamentos = async () => {
    if (!estabelecimento?.id) return;

    setLoading(true);
    try {
      const dataFormatada = dataSelecionada.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('agendamentos')
        .select(
          `
          id,
          cliente_nome,
          cliente_telefone,
          cliente_email,
          data_agendamento,
          hora_inicio,
          hora_fim,
          status,
          servico_id,
          colaborador_id,
          observacoes,
          servicos (nome),
          colaboradores (nome)
        `
        )
        .eq('estabelecimento_id', estabelecimento.id)
        .eq('data_agendamento', dataFormatada)
        .order('hora_inicio', { ascending: true });

      if (error) {
        console.error('Erro ao buscar agendamentos:', error);
      } else {
        setAgendamentos(data || []);
      }
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (dataStr: string) => {
    const data = new Date(dataStr + 'T00:00:00');
    return data.toLocaleDateString('pt-BR');
  };

  const formatarDataCompleta = (data: Date) => {
    const hoje = new Date();
    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1);

    if (data.toDateString() === hoje.toDateString()) {
      return 'Hoje';
    } else if (data.toDateString() === amanha.toDateString()) {
      return 'Amanhã';
    } else {
      return data.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
    }
  };

  const isAgendamentoAtrasado = (data: string, horario: string) => {
    const agora = new Date();
    const dataAgendamento = new Date(data + 'T' + horario);
    return dataAgendamento < agora;
  };

  const obterCorStatus = (status?: string, isAtrasado?: boolean) => {
    if (isAtrasado) {
      return 'bg-red-100 text-red-800 border-red-200';
    }

    switch (status) {
      case 'confirmado':
        return 'bg-green-100 text-green-800';
      case 'cancelado':
        return 'bg-gray-100 text-gray-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

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

  return (
    <Container className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={loading} onRefresh={buscarAgendamentos} />}>
        <View className="border-b border-gray-200 bg-white px-4 py-3">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={() => navegarData('anterior')} className="p-2">
              <Feather name="chevron-left" size={24} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity onPress={abrirCalendario} className="flex-1 items-center">
              <Text className="flex-1 text-lg font-semibold text-gray-800">
                {formatarDataCompleta(dataSelecionada)}
              </Text>
              <Text className="flex-1 text-sm text-gray-500">
                {dataSelecionada.toLocaleDateString('pt-BR')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navegarData('proxima')} className="p-2">
              <Feather name="chevron-right" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {dataSelecionada.toDateString() !== new Date().toDateString() && (
            <TouchableOpacity
              onPress={irParaHoje}
              className="mt-2 self-center rounded-full bg-indigo-100 px-3 py-1">
              <Text className="text-sm font-medium text-indigo-700">Ir para hoje</Text>
            </TouchableOpacity>
          )}
        </View>

        <DateTimePickerModal
          isVisible={mostrarCalendario}
          mode="date"
          date={dataSelecionada}
          onConfirm={confirmarData}
          onCancel={cancelarCalendario}
          locale="pt-BR"
          display="calendar"
        />

        <View className="p-4">
          {agendamentos.length === 0 ? (
            <View className="items-center justify-center py-12">
              <FontAwesome name="calendar-o" size={64} color="#9CA3AF" />
              <Text className="mt-4 flex-1 text-center text-lg text-gray-500">
                Nenhum agendamento para este dia
              </Text>
              <Text className="mt-2 flex-1 text-center text-sm text-gray-400">
                Toque no botão + para criar um novo agendamento
              </Text>
            </View>
          ) : (
            <View className="space-y-3">
              {agendamentos.map((agendamento) => {
                const isAtrasado = isAgendamentoAtrasado(
                  agendamento.data_agendamento,
                  agendamento.hora_inicio
                );
                return (
                  <TouchableOpacity
                    key={agendamento.id}
                    className={`rounded-lg border bg-white p-4 shadow-sm ${
                      isAtrasado ? 'border-red-200 bg-red-50' : 'border-gray-200'
                    }`}
                    activeOpacity={0.7}>
                    {isAtrasado && (
                      <View className="mb-2 flex-row items-center">
                        <Feather name="clock" size={16} color="#DC2626" />
                        <Text className="ml-1 flex-1 text-sm font-medium text-red-600">
                          Agendamento em atraso
                        </Text>
                      </View>
                    )}

                    <View className="mb-2 flex-row items-start justify-between">
                      <Text className="flex-1 text-lg font-semibold text-gray-800">
                        {agendamento.cliente_nome}
                      </Text>
                      <View
                        className={`ml-2 rounded-full px-2 py-1 ${obterCorStatus(agendamento.status, isAtrasado)}`}>
                        <Text className="flex-1 text-xs font-medium">
                          {agendamento.status || 'agendado'}
                        </Text>
                      </View>
                    </View>

                    <View className="mb-1 flex-row items-center">
                      <FontAwesome name="clock-o" size={14} color="#6B7280" />
                      <Text
                        className={`ml-2 flex-1 ${isAtrasado ? 'font-medium text-red-600' : 'text-gray-600'}`}>
                        {agendamento.hora_inicio} - {agendamento.hora_fim}
                      </Text>
                    </View>

                    <View className="mb-1 flex-row items-center">
                      <FontAwesome name="phone" size={14} color="#6B7280" />
                      <Text className="ml-2 flex-1 text-gray-600">
                        {agendamento.cliente_telefone}
                      </Text>
                    </View>

                    {agendamento.servicos && agendamento.servicos.length > 0 && (
                      <View className="mb-1 flex-row items-center">
                        <FontAwesome name="scissors" size={14} color="#6B7280" />
                        <Text className="ml-2 flex-1 text-gray-600">
                          {agendamento.servicos.map((servico) => servico.nome).join(', ')}
                        </Text>
                      </View>
                    )}

                    {agendamento.colaboradores && agendamento.colaboradores.length > 0 && (
                      <View className="flex-row items-center">
                        <FontAwesome name="user" size={14} color="#6B7280" />
                        <Text className="ml-2 flex-1 text-gray-600">
                          {agendamento.colaboradores[0].nome}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </Container>
  );
}
