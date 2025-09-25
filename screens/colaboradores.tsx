import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '../components/Button';
import { Container } from '../components/Container';
import { Input } from '../components/Input';
import { MultiSelectServicos } from '../components/MultiSelectServicos';
import { supabase } from '../utils/supabase';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/theme';

interface Colaborador {
  id: number;
  nome: string;
  foto_url?: string;
  servicos: number[];
}

interface Servico {
  id: number;
  nome: string;
  descricao?: string;
}

const schema = yup.object({
  nome: yup.string().required('Nome do colaborador é obrigatório'),
});

export default function ColaboradoresScreen() {
  const navigation = useNavigation();
  const { estabelecimento } = useAuthStore();
  const { isDark } = useTheme();
  const themeClasses = getThemeClasses(isDark);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingColaborador, setEditingColaborador] = useState<Colaborador | null>(null);
  const [loading, setLoading] = useState(false);
  const [fotoFile, setFotoFile] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | undefined>();
  const [servicosSelecionados, setServicosSelecionados] = useState<number[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      nome: '',
    },
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => abrirModal()} style={{ marginRight: 15 }}>
          <Feather name="plus" size={24} color={isDark ? '#D1D5DB' : '#1f2937'} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, isDark]);

  useEffect(() => {
    buscarColaboradores();
    buscarServicos();
  }, []);

  async function buscarColaboradores() {
    if (!estabelecimento?.id) return;

    const { data, error } = await supabase
      .from('colaboradores')
      .select('id, nome, foto_url, colaboradores_servicos(servico_id)')
      .eq('estabelecimento_id', estabelecimento.id);

    if (data) {
      setColaboradores(
        data.map((c: any) => ({
          id: c.id,
          nome: c.nome,
          foto_url: c.foto_url,
          servicos: c.colaboradores_servicos?.map((cs: any) => cs.servico_id) || [],
        }))
      );
    }
  }

  async function buscarServicos() {
    if (!estabelecimento?.id) return;

    const { data, error } = await supabase
      .from('servicos')
      .select('id, nome, descricao')
      .eq('estabelecimento_id', estabelecimento.id);

    if (data) setServicos(data);
  }

  const handlePickFoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão negada', 'É necessário permitir acesso à galeria.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setFotoFile(result.assets[0]);
      setFotoPreview(result.assets[0].uri);
    }
  };

  const uploadFotoAndGetPublicUrl = async (
    file: ImagePicker.ImagePickerAsset,
    userId: string
  ): Promise<string | null> => {
    try {
      const mime = (file as any).mimeType || 'image/jpeg';
      const fromUriExt = file.uri.split('.').pop()?.toLowerCase();
      const ext = fromUriExt || (mime.includes('png') ? 'png' : 'jpg');
      const fileName = `colaborador_${Date.now()}.${ext}`;
      const filePath = `${userId}/${fileName}`;
      const base64 = await (
        await import('expo-file-system')
      ).readAsStringAsync(file.uri, {
        encoding: (await import('expo-file-system')).EncodingType.Base64,
      });
      const { decode } = await import('base64-arraybuffer');
      const arrayBuffer = decode(base64);
      const { error: uploadError } = await (await import('../utils/supabase')).supabase.storage
        .from('colaboradores')
        .upload(filePath, arrayBuffer, {
          contentType: mime,
          upsert: true,
        });
      if (uploadError) {
        Alert.alert('Erro', 'Falha ao fazer upload da foto.');
        return null;
      }
      const { data: publicData } = (await import('../utils/supabase')).supabase.storage
        .from('colaboradores')
        .getPublicUrl(filePath);
      return publicData?.publicUrl ?? null;
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível processar a foto.');
      return null;
    }
  };

  function abrirModal(colaborador?: Colaborador) {
    if (colaborador) {
      setEditingColaborador(colaborador);
      reset({ nome: colaborador.nome });
      setFotoPreview(colaborador.foto_url);
      setServicosSelecionados(colaborador.servicos);
      setFotoFile(null);
    } else {
      setEditingColaborador(null);
      reset({ nome: '' });
      setFotoPreview(undefined);
      setServicosSelecionados([]);
      setFotoFile(null);
    }
    setModalVisible(true);
  }

  const onSubmit = async (formData: { nome: string }) => {
    if (!estabelecimento?.id) return;

    setLoading(true);
    try {
      let colaboradorId = editingColaborador?.id;
      let fotoUrl = editingColaborador?.foto_url || null;

      if (editingColaborador) {
        // Atualizar colaborador existente
        const { error } = await supabase
          .from('colaboradores')
          .update({ nome: formData.nome })
          .eq('id', colaboradorId);

        if (error) throw error;
      } else {
        // Criar novo colaborador
        const { data, error } = await supabase
          .from('colaboradores')
          .insert({
            nome: formData.nome,
            estabelecimento_id: estabelecimento.id,
          })
          .select();

        if (error) throw error;
        colaboradorId = data?.[0]?.id;
      }

      // Upload da foto se houver
      if (fotoFile && colaboradorId && estabelecimento?.user_id) {
        fotoUrl = await uploadFotoAndGetPublicUrl(fotoFile, estabelecimento.user_id);
        if (fotoUrl) {
          await supabase
            .from('colaboradores')
            .update({ foto_url: fotoUrl })
            .eq('id', colaboradorId);
        }
      }

      // Atualizar vínculos de serviços
      if (colaboradorId) {
        await supabase.from('colaboradores_servicos').delete().eq('colaborador_id', colaboradorId);

        for (const servicoId of servicosSelecionados) {
          await supabase
            .from('colaboradores_servicos')
            .insert({ colaborador_id: colaboradorId, servico_id: servicoId });
        }
      }

      setModalVisible(false);
      buscarColaboradores();
      Alert.alert(
        'Sucesso',
        editingColaborador ? 'Colaborador atualizado!' : 'Colaborador criado!'
      );
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível salvar o colaborador.');
    } finally {
      setLoading(false);
    }
  };

  async function excluirColaborador(id: number) {
    Alert.alert('Confirmar exclusão', 'Tem certeza que deseja excluir este colaborador?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await supabase.from('colaboradores_servicos').delete().eq('colaborador_id', id);
          await supabase.from('colaboradores').delete().eq('id', id);
          buscarColaboradores();
        },
      },
    ]);
  }

  return (
    <Container className="flex-1 bg-gray-100">
      <View className="m-6 flex-1">
        <FlatList
          data={colaboradores}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View
              className={`mb-4 flex-row items-center rounded-lg border p-4 ${themeClasses.cardBackground} ${themeClasses.border}`}>
              <View className="mr-4">
                {item.foto_url ? (
                  <Image source={{ uri: item.foto_url }} className="h-12 w-12 rounded-full" />
                ) : (
                  <View
                    className={`h-12 w-12 items-center justify-center rounded-full ${isDark ? 'bg-slate-600' : 'bg-gray-300'}`}>
                    <Text
                      className={`text-lg font-bold ${isDark ? 'text-slate-200' : 'text-gray-600'}`}>
                      {item.nome.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>

              <View className="flex-1">
                <Text className={`text-lg font-semibold ${themeClasses.textPrimary}`}>
                  {item.nome}
                </Text>
                <Text className={`text-sm ${themeClasses.textSecondary}`}>
                  {item.servicos.length > 0
                    ? `Serviços: ${item.servicos
                        .map((id) => servicos.find((s) => s.id === id)?.nome)
                        .filter(Boolean)
                        .join(', ')}`
                    : 'Nenhum serviço vinculado'}
                </Text>
              </View>

              <View className="flex-row">
                <TouchableOpacity
                  onPress={() => abrirModal(item)}
                  className="mr-2 flex-row items-center justify-center rounded-lg bg-indigo-500 p-2">
                  <Feather name="edit-2" size={16} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => excluirColaborador(item.id)}
                  className="flex-row items-center justify-center rounded-lg bg-red-500 p-2">
                  <Feather name="trash-2" size={16} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-12">
              <Text className={`text-center ${themeClasses.textMuted}`}>
                Nenhum colaborador cadastrado ainda.{'\n'}
                Adicione um novo colaborador para começar.
              </Text>
            </View>
          }
        />
      </View>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <Container className={`flex-1 ${themeClasses.background}`}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}>
            <ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
              className="flex-1">
              <View className="m-6 flex-1">
                <View className="mb-8 w-full items-center">
                  <Text
                    className={`mb-2 w-full text-center text-3xl font-bold ${themeClasses.textPrimary}`}>
                    {editingColaborador ? 'Editar Colaborador' : 'Novo Colaborador'}
                  </Text>
                  <Text className={`w-full text-center ${themeClasses.textSecondary}`}>
                    {editingColaborador
                      ? 'Atualize os dados do colaborador'
                      : 'Adicione um novo colaborador'}
                  </Text>
                </View>

                <View>
                  <Controller
                    control={control}
                    name="nome"
                    render={({ field: { onChange, value } }) => (
                      <Input
                        label="Nome do Colaborador"
                        value={value}
                        onChangeText={onChange}
                        placeholder="Nome completo"
                        error={errors.nome?.message}
                      />
                    )}
                  />

                  <View className="mb-4">
                    <Text className={`mb-2 text-base font-medium ${themeClasses.textSecondary}`}>
                      Foto do Colaborador
                    </Text>
                    <TouchableOpacity
                      className={`mb-4 flex-row items-center justify-center rounded-lg border px-4 py-3 ${themeClasses.border} ${themeClasses.inputBackground}`}
                      onPress={handlePickFoto}>
                      <Feather name="camera" size={20} color={isDark ? '#94A3B8' : '#4B5563'} />
                      <Text
                        className={`ml-2 text-center text-base font-medium ${themeClasses.textSecondary}`}>
                        {fotoFile?.fileName || 'Selecionar Foto'}
                      </Text>
                    </TouchableOpacity>
                    {fotoPreview && (
                      <Image
                        source={{ uri: fotoPreview }}
                        className="mb-4 h-20 w-20 self-center rounded-full"
                      />
                    )}
                  </View>

                  <View className="mb-4">
                    <Text className="mb-2 text-base font-medium text-gray-700">
                      Serviços Preferidos
                    </Text>
                    <MultiSelectServicos
                      servicos={servicos}
                      servicosSelecionados={servicosSelecionados}
                      onServicosChange={setServicosSelecionados}
                      placeholder="Selecione os serviços preferidos"
                    />
                  </View>

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
