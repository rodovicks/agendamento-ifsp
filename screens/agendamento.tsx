import React, { useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { View, Text, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { Container } from '../components/Container';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { MultiSelectServicos } from '../components/MultiSelectServicos';
import { DateTimePicker } from '../components/DateTimePicker';
import { supabase } from '../utils/supabase';
import { useAuthStore } from '../store/authStore';
import { useNavigation } from '@react-navigation/native';

interface FormData {
  nome: string;
  telefone: string;
  email?: string;
  data: Date | null;
  horario: Date | null;
  servicos: number[];
  colaborador: number | null;
}

interface Servico {
  id: number;
  nome: string;
  descricao?: string;
  favorito?: boolean;
}

interface Colaborador {
  id: number;
  nome: string;
  colaboradores_servicos?: { servico_id: number }[];
}

const schema = yup
  .object({
    nome: yup.string().required('Nome do cliente é obrigatório'),
    telefone: yup.string().required('Telefone é obrigatório'),
    data: yup.date().nullable().required('Data é obrigatória'),
    horario: yup.date().nullable().required('Horário é obrigatório'),
    servicos: yup
      .array()
      .of(yup.number().required())
      .min(1, 'Selecione ao menos um serviço')
      .required()
      .defined(),
    colaborador: yup.number().nullable().default(null),
  })
  .required();

export default function AgendamentoScreen() {
  const { estabelecimento } = useAuthStore();
  const navigation = useNavigation();
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [servicosSelecionados, setServicosSelecionados] = useState<number[]>([]);
  const [colaboradorSelecionado, setColaboradorSelecionado] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      nome: '',
      telefone: '',
      data: null,
      horario: null,
      servicos: [],
      colaborador: null,
    },
  });

  const watchedData = watch('data');
  const watchedHorario = watch('horario');

  useEffect(() => {
    buscarServicos();
    buscarColaboradores();
  }, []);

  async function buscarServicos() {
    if (!estabelecimento?.id) return;
    const { data } = await supabase
      .from('servicos')
      .select('id, nome, descricao, favorito')
      .eq('estabelecimento_id', estabelecimento.id);
    if (data) {
      // Favoritos primeiro
      setServicos([...data.filter((s) => s.favorito), ...data.filter((s) => !s.favorito)]);
    }
  }

  async function buscarColaboradores() {
    if (!estabelecimento?.id) return;
    const { data } = await supabase
      .from('colaboradores')
      .select('id, nome, colaboradores_servicos(servico_id)')
      .eq('estabelecimento_id', estabelecimento.id);
    if (data) setColaboradores(data);
  }

  function colaboradoresPreferenciais(servicoId: number) {
    // Colaboradores que têm preferência pelo serviço
    const preferenciais = colaboradores.filter((c) =>
      c.colaboradores_servicos?.some((cs: { servico_id: number }) => cs.servico_id === servicoId)
    );
    const outros = colaboradores.filter(
      (c) =>
        !c.colaboradores_servicos?.some((cs: { servico_id: number }) => cs.servico_id === servicoId)
    );
    return [...preferenciais, ...outros];
  }

  async function verificarConflitoAgendamento(data: string, hora_inicio: string) {
    // Verifica se já existe agendamento para data/horário
    const { data: agendamentos } = await supabase
      .from('agendamentos')
      .select('id')
      .eq('data_agendamento', data)
      .eq('hora_inicio', hora_inicio);
    return agendamentos && agendamentos.length > 0;
  }

  const onSubmit = async (formData: FormData) => {
    setLoading(true);

    if (!formData.data || !formData.horario) {
      Alert.alert('Erro', 'Data e horário são obrigatórios.');
      setLoading(false);
      return;
    }

    const dataFormatada = formData.data.toISOString().split('T')[0];
    const horarioFormatado = formData.horario.toTimeString().slice(0, 5);

    const conflito = await verificarConflitoAgendamento(dataFormatada, horarioFormatado);
    if (conflito) {
      Alert.alert('Conflito', 'Já existe um agendamento para esta data e horário.');
      setLoading(false);
      return;
    }

    // Calcular hora_fim (1 hora após hora_inicio por padrão)
    const horaFim = new Date(`2000-01-01T${horarioFormatado}:00`);
    horaFim.setHours(horaFim.getHours() + 1);
    const horaFimFormatada = horaFim.toTimeString().slice(0, 5);

    // Salvar agendamento
    const { error } = await supabase.from('agendamentos').insert({
      cliente_nome: formData.nome,
      cliente_telefone: formData.telefone,
      data_agendamento: dataFormatada,
      hora_inicio: horarioFormatado,
      hora_fim: horaFimFormatada,
      servico_id: formData.servicos[0] || null, // Primeiro serviço selecionado
      colaborador_id: formData.colaborador || null,
      estabelecimento_id: estabelecimento?.id,
      status: 'agendado',
    });

    setLoading(false);
    if (error) {
      console.error('Erro ao criar agendamento:', error);
      Alert.alert('Erro', 'Não foi possível criar o agendamento.');
    } else {
      Alert.alert('Sucesso', 'Agendamento criado com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  };

  return (
    <Container className="mb-10 mt-1 flex-1 bg-gray-50">
      <View className="flex-row items-center px-6 pb-2 pt-4">
        <Text className="ml-4 text-2xl font-bold text-gray-800">Novo Agendamento</Text>
      </View>

      <ScrollView className="flex-1 px-6">
        <View className="mb-6">
          <Controller
            control={control}
            name="nome"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Nome do cliente"
                value={value}
                onChangeText={onChange}
                error={errors.nome?.message}
                placeholder="Digite o nome completo"
              />
            )}
          />

          <Controller
            control={control}
            name="telefone"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Telefone"
                value={value}
                onChangeText={onChange}
                error={errors.telefone?.message}
                keyboardType="phone-pad"
                placeholder="(11) 99999-9999"
              />
            )}
          />

          <Controller
            control={control}
            name="data"
            render={({ field: { onChange, value } }) => (
              <DateTimePicker
                label="Data do agendamento"
                value={value}
                onChange={(date) => {
                  onChange(date);
                  setValue('data', date);
                }}
                mode="date"
                error={errors.data?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="horario"
            render={({ field: { onChange, value } }) => (
              <DateTimePicker
                label="Horário do agendamento"
                value={value}
                onChange={(time) => {
                  onChange(time);
                  setValue('horario', time);
                }}
                mode="time"
                error={errors.horario?.message}
              />
            )}
          />

          <Text className="mb-2 text-base font-medium text-gray-700">Serviços</Text>
          <MultiSelectServicos
            servicos={servicos}
            servicosSelecionados={servicosSelecionados}
            onServicosChange={(ids) => {
              setServicosSelecionados(ids);
              setValue('servicos', ids);
            }}
          />
          {errors.servicos && (
            <Text className="mt-1 text-sm text-red-500">{errors.servicos.message}</Text>
          )}

          {servicosSelecionados.length > 0 && (
            <View className="mt-4">
              <Text className="mb-2 text-base font-medium text-gray-700">
                Colaborador (opcional)
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row">
                  {colaboradoresPreferenciais(servicosSelecionados[0]).map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      className={`mr-2 rounded-lg border px-4 py-2 ${
                        colaboradorSelecionado === c.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-300 bg-white'
                      }`}
                      onPress={() => {
                        setColaboradorSelecionado(c.id);
                        setValue('colaborador', c.id);
                      }}>
                      <Text
                        className={`text-base ${
                          colaboradorSelecionado === c.id ? 'text-indigo-700' : 'text-gray-800'
                        }`}>
                        {c.nome}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          <Button
            title={loading ? 'Criando agendamento...' : 'Criar Agendamento'}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
            className="mb-6 mt-8"
          />
        </View>
      </ScrollView>
    </Container>
  );
}
