import React, { useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/theme';
import {
  View,
  Text,
  Alert,
  ScrollView,
  TouchableOpacity,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Container } from '../components/Container';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { MultiSelectServicos } from '../components/MultiSelectServicos';
import { DateTimePicker } from '../components/DateTimePicker';
import { SelectColaborador } from '../components/SelectColaborador';
import { supabase } from '../utils/supabase';
import { useAuthStore } from '../store/authStore';
import { useNavigation, useRoute } from '@react-navigation/native';
import { formatPhoneNumber } from '../utils/phoneMask';

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
  const route = useRoute();
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [servicosSelecionados, setServicosSelecionados] = useState<number[]>([]);
  const [colaboradorSelecionado, setColaboradorSelecionado] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const { isDark } = useTheme();
  const themeClasses = getThemeClasses(isDark);

  // @ts-ignore - Parâmetros de navegação
  const dadosParaEdicao = route.params?.dadosParaEdicao;
  // @ts-ignore - Parâmetros de navegação
  const dadosParaCopiar = route.params?.dadosParaCopiar;
  const isEdicao = !!dadosParaEdicao?.isEdicao;

  const getInitialValues = () => {
    if (dadosParaEdicao) {
      return {
        nome: dadosParaEdicao.nome || '',
        telefone: dadosParaEdicao.telefone || '',
        email: dadosParaEdicao.email || '',
        data: dadosParaEdicao.data ? new Date(dadosParaEdicao.data + 'T00:00:00') : null,
        horario: dadosParaEdicao.horario
          ? new Date(`2000-01-01T${dadosParaEdicao.horario.slice(0, 5)}:00`)
          : null,
        servicos: dadosParaEdicao.servico_id ? [dadosParaEdicao.servico_id] : [],
        colaborador: dadosParaEdicao.colaborador_id || null,
      };
    }
    if (dadosParaCopiar) {
      return {
        nome: dadosParaCopiar.nome || '',
        telefone: dadosParaCopiar.telefone || '',
        email: dadosParaCopiar.email || '',
        data: null,
        horario: null,
        servicos: dadosParaCopiar.servico_id ? [dadosParaCopiar.servico_id] : [],
        colaborador: dadosParaCopiar.colaborador_id || null,
      };
    }
    return {
      nome: '',
      telefone: '',
      email: '',
      data: null,
      horario: null,
      servicos: [],
      colaborador: null,
    };
  };

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: getInitialValues(),
  });

  useEffect(() => {
    buscarServicos();
    buscarColaboradores();

    // Configurar valores iniciais para edição
    if (dadosParaEdicao) {
      // Reset form com valores de edição
      const valoresEdicao = getInitialValues();
      reset(valoresEdicao);

      if (dadosParaEdicao.servico_id) {
        setServicosSelecionados([dadosParaEdicao.servico_id]);
      }
      if (dadosParaEdicao.colaborador_id) {
        setColaboradorSelecionado(dadosParaEdicao.colaborador_id);
      }
    }

    // Configurar valores iniciais para cópia
    if (dadosParaCopiar) {
      if (dadosParaCopiar.servico_id) {
        setServicosSelecionados([dadosParaCopiar.servico_id]);
      }
      if (dadosParaCopiar.colaborador_id) {
        setColaboradorSelecionado(dadosParaCopiar.colaborador_id);
      }
    }

    // Listeners do teclado
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) =>
      setKeyboardHeight(e.endCoordinates.height)
    );
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardHeight(0)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  async function buscarServicos() {
    if (!estabelecimento?.id) return;
    const { data } = await supabase
      .from('servicos')
      .select('id, nome, descricao, favorito')
      .eq('estabelecimento_id', estabelecimento.id);
    if (data) {
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
    const preferenciais = colaboradores.filter((c) =>
      c.colaboradores_servicos?.some((cs: { servico_id: number }) => cs.servico_id === servicoId)
    );
    const outros = colaboradores.filter(
      (c) =>
        !c.colaboradores_servicos?.some((cs: { servico_id: number }) => cs.servico_id === servicoId)
    );
    return [...preferenciais, ...outros];
  }

  async function verificarConflitoAgendamento(
    data: string,
    hora_inicio: string,
    colaborador_id: number | null,
    agendamento_id_para_ignorar?: number
  ) {
    // Se não há colaborador selecionado, não verificar conflito
    if (!colaborador_id) {
      return false;
    }

    let query = supabase
      .from('agendamentos')
      .select('id, status')
      .eq('data_agendamento', data)
      .eq('hora_inicio', hora_inicio)
      .eq('colaborador_id', colaborador_id) // Só verifica conflito para o mesmo colaborador
      .neq('status', 'cancelado'); // Excluir apenas agendamentos cancelados

    // Se estiver editando, excluir o próprio agendamento da verificação
    if (agendamento_id_para_ignorar) {
      query = query.neq('id', agendamento_id_para_ignorar);
    }

    const { data: agendamentos } = await query;

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

    // Verificar conflito apenas se não for edição ou se houve mudanças na data/horário/colaborador
    if (
      !isEdicao ||
      (dadosParaEdicao &&
        (dataFormatada !== dadosParaEdicao.data ||
          horarioFormatado !== dadosParaEdicao.horario ||
          formData.colaborador !== dadosParaEdicao.colaborador_id))
    ) {
      const conflito = await verificarConflitoAgendamento(
        dataFormatada,
        horarioFormatado,
        formData.colaborador,
        isEdicao ? dadosParaEdicao?.id : undefined
      );
      if (conflito) {
        Alert.alert(
          'Conflito',
          'Já existe um agendamento para este colaborador na mesma data e horário.'
        );
        setLoading(false);
        return;
      }
    }

    const horaFim = new Date(`2000-01-01T${horarioFormatado}:00`);
    horaFim.setHours(horaFim.getHours() + 1);
    const horaFimFormatada = horaFim.toTimeString().slice(0, 5);

    const dadosParaSalvar: any = {
      cliente_nome: formData.nome,
      cliente_telefone: formData.telefone,
      cliente_email: formData.email || null,
      data_agendamento: dataFormatada,
      hora_inicio: horarioFormatado,
      hora_fim: horaFimFormatada,
      servico_id: formData.servicos[0] || null,
      colaborador_id: formData.colaborador || null,
      estabelecimento_id: estabelecimento?.id,
    };

    // Só adicionar status se for criação (não edição)
    if (!isEdicao) {
      dadosParaSalvar.status = 'agendado';
    }

    let error;
    if (isEdicao && dadosParaEdicao?.id) {
      // Atualizar agendamento existente
      const { error: updateError } = await supabase
        .from('agendamentos')
        .update(dadosParaSalvar)
        .eq('id', dadosParaEdicao.id);

      error = updateError;
    } else {
      // Criar novo agendamento
      const { error: insertError } = await supabase.from('agendamentos').insert(dadosParaSalvar);

      error = insertError;
    }

    setLoading(false);
    if (error) {
      console.error(`Erro ao ${isEdicao ? 'atualizar' : 'criar'} agendamento:`, error);
      Alert.alert('Erro', `Não foi possível ${isEdicao ? 'atualizar' : 'criar'} o agendamento.`);
    } else {
      const mensagem = isEdicao
        ? 'Agendamento atualizado com sucesso!'
        : 'Agendamento criado com sucesso!';
      Alert.alert('Sucesso', mensagem, [{ text: 'OK', onPress: () => navigation.goBack() }]);
    }
  };

  return (
    <Container className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 40,
            paddingBottom: Math.max(keyboardHeight + 20, 100), // Padding dinâmico
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
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
                  onChangeText={(text) => {
                    const formatted = formatPhoneNumber(text);
                    onChange(formatted);
                  }}
                  error={errors.telefone?.message}
                  keyboardType="phone-pad"
                  placeholder="(11) 99999-9999"
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Email (opcional)"
                  value={value}
                  onChangeText={onChange}
                  error={errors.email?.message}
                  keyboardType="email-address"
                  placeholder="email@exemplo.com"
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
                    // Remove os segundos do horário selecionado
                    const timeWithoutSeconds = new Date(time);
                    timeWithoutSeconds.setSeconds(0, 0);
                    onChange(timeWithoutSeconds);
                    setValue('horario', timeWithoutSeconds);
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

            <Text className="mb-2 mt-4 text-base font-medium text-gray-700">Colaborador</Text>
            <SelectColaborador
              colaboradores={colaboradores}
              colaboradorSelecionado={colaboradorSelecionado}
              onColaboradorChange={(colaboradorId) => {
                setColaboradorSelecionado(colaboradorId);
                setValue('colaborador', colaboradorId);
              }}
              servicosSelecionados={servicosSelecionados}
              placeholder="Selecione um colaborador (opcional)"
            />

            <Button
              title={
                loading
                  ? isEdicao
                    ? 'Atualizando agendamento...'
                    : 'Criando agendamento...'
                  : isEdicao
                    ? 'Atualizar Agendamento'
                    : 'Criar Agendamento'
              }
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
              className="mb-6 mt-8"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
}
