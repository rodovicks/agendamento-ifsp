import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../components/Button';
import { Container } from '../components/Container';
import { Input } from '../components/Input';
import { ImportarServicos } from '../components/ImportarServicos';
import { supabase } from '../utils/supabase';
import { useAuthStore } from '../store/authStore';

interface Servico {
  id: number;
  nome: string;
  descricao: string;
}

const schema = yup.object({
  nome: yup.string().required('Nome do serviço é obrigatório'),
  descricao: yup.string().required('Descrição é obrigatória'),
});

export default function ServicosScreen() {
  const navigation = useNavigation();
  const { estabelecimento } = useAuthStore();
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingServico, setEditingServico] = useState<Servico | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      nome: '',
      descricao: '',
    },
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
          <ImportarServicos
            estabelecimentoId={estabelecimento?.id || ''}
            ramoAtualNome={estabelecimento?.ramo}
            onServicosImportados={buscarServicos}
            renderAsIcon={true}
          />
          <TouchableOpacity onPress={() => abrirModal()} style={{ marginLeft: 15 }}>
            <Feather name="plus" size={24} color="#1f2937" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, estabelecimento]);

  useEffect(() => {
    buscarServicos();
  }, []);

  async function buscarServicos() {
    if (!estabelecimento?.id) return;
    const { data } = await supabase
      .from('servicos')
      .select('id, nome, descricao')
      .eq('estabelecimento_id', estabelecimento.id);
    if (data) setServicos(data);
  }

  function abrirModal(servico?: Servico) {
    if (servico) {
      setEditingServico(servico);
      reset({ nome: servico.nome, descricao: servico.descricao });
    } else {
      setEditingServico(null);
      reset({ nome: '', descricao: '' });
    }
    setModalVisible(true);
  }

  const onSubmit = async (formData: { nome: string; descricao: string }) => {
    if (!estabelecimento?.id) return;
    setLoading(true);
    try {
      if (editingServico) {
        // Atualizar serviço existente
        const { error } = await supabase
          .from('servicos')
          .update({ nome: formData.nome, descricao: formData.descricao })
          .eq('id', editingServico.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('servicos').insert({
          nome: formData.nome,
          descricao: formData.descricao,
          estabelecimento_id: estabelecimento.id,
        });
        if (error) throw error;
      }
      setModalVisible(false);
      buscarServicos();
      Alert.alert('Sucesso', editingServico ? 'Serviço atualizado!' : 'Serviço criado!');
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível salvar o serviço.');
    } finally {
      setLoading(false);
    }
  };

  async function excluirServico(id: number) {
    Alert.alert('Confirmar exclusão', 'Tem certeza que deseja excluir este serviço?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await supabase.from('servicos').delete().eq('id', id);
          buscarServicos();
        },
      },
    ]);
  }

  return (
    <Container className="mb-10 mt-1 flex-1 bg-gray-100">
      <View className="m-6 flex-1">
        <FlatList
          data={servicos}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View className="mb-4 flex-row items-center rounded-lg border border-gray-200 bg-white p-4">
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900">{item.nome}</Text>
                <Text className="text-sm text-gray-600">{item.descricao}</Text>
              </View>
              <View className="ml-2 flex-row items-center">
                <TouchableOpacity
                  onPress={() => abrirModal(item)}
                  className="mr-2 flex-row items-center justify-center rounded-lg bg-indigo-500 p-2">
                  <Feather name="edit-2" size={16} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => excluirServico(item.id)}
                  className="flex-row items-center justify-center rounded-lg bg-red-500 p-2">
                  <Feather name="trash-2" size={16} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-12">
              <Text className="text-center text-gray-500">
                Nenhum serviço cadastrado ainda.{'\n'}Adicione um novo serviço para começar.
              </Text>
            </View>
          }
        />
      </View>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <Container className="flex-1 bg-gray-100">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}>
            <ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
              className="flex-1">
              <View className="m-6 flex-1">
                <View className="mb-8 w-full items-center">
                  <Text className="mb-2 w-full text-center text-3xl font-bold text-gray-900">
                    {editingServico ? 'Editar Serviço' : 'Novo Serviço'}
                  </Text>
                  <Text className="w-full text-center text-gray-600">
                    {editingServico ? 'Atualize os dados do serviço' : 'Adicione um novo serviço'}
                  </Text>
                </View>

                <View>
                  <Controller
                    control={control}
                    name="nome"
                    render={({ field: { onChange, value } }) => (
                      <Input
                        label="Nome do Serviço"
                        value={value}
                        onChangeText={onChange}
                        placeholder="Nome do serviço"
                        error={errors.nome?.message}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="descricao"
                    render={({ field: { onChange, value } }) => (
                      <Input
                        label="Descrição"
                        value={value}
                        onChangeText={onChange}
                        placeholder="Descrição do serviço"
                        error={errors.descricao?.message}
                        multiline
                        numberOfLines={3}
                      />
                    )}
                  />

                  <View className="mt-8 flex-row">
                    <Button
                      title={loading ? 'Salvando...' : 'Salvar'}
                      onPress={handleSubmit(onSubmit)}
                      disabled={loading}
                      className={`mr-4 flex-1 ${loading ? 'opacity-50' : ''}`}
                    />
                    <Button
                      title="Cancelar"
                      onPress={() => setModalVisible(false)}
                      className="flex-1 bg-gray-500"
                    />
                  </View>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Container>
      </Modal>
    </Container>
  );
}
