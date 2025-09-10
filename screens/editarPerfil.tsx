import { useForm, Controller } from 'react-hook-form';
import { useEffect, useState } from 'react';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import * as ImagePicker from 'expo-image-picker';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { Button } from '../components/Button';
import { Container } from '../components/Container';
import { Input } from '../components/Input';
import { useAuthStore } from '../store/authStore';
import { estabelecimentoService } from '../utils/estabelecimento';

const schema = yup.object({
  nome: yup.string().required('Nome do estabelecimento é obrigatório'),
  telefone: yup.string().required('Telefone é obrigatório'),
  endereco: yup.string().required('Endereço é obrigatório'),
  ramo: yup.string().required('Ramo de atividade é obrigatório'),
});

export default function EditarPerfilScreen() {
  const { estabelecimento, loadEstabelecimento } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | undefined>(estabelecimento?.logo);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      nome: estabelecimento?.nome || '',
      telefone: estabelecimento?.telefone || '',
      endereco: estabelecimento?.endereco || '',
      ramo: estabelecimento?.ramo || '',
    },
  });

  useEffect(() => {
    if (estabelecimento) {
      reset({
        nome: estabelecimento.nome,
        telefone: estabelecimento.telefone,
        endereco: estabelecimento.endereco,
        ramo: estabelecimento.ramo,
      });
      setLogoPreview(estabelecimento.logo);
    }
  }, [estabelecimento, reset]);

  const handlePickLogo = async () => {
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
      setLogoFile(result.assets[0]);
      setLogoPreview(result.assets[0].uri);
    }
  };

  const uploadLogoAndGetPublicUrl = async (
    file: ImagePicker.ImagePickerAsset,
    userId: string
  ): Promise<string | null> => {
    try {
      const mime = (file as any).mimeType || 'image/jpeg';
      const fromUriExt = file.uri.split('.').pop()?.toLowerCase();
      const ext = fromUriExt || (mime.includes('png') ? 'png' : 'jpg');
      const fileName = `logo_${Date.now()}.${ext}`;
      const filePath = `${userId}/${fileName}`;
      const base64 = await (
        await import('expo-file-system')
      ).readAsStringAsync(file.uri, {
        encoding: (await import('expo-file-system')).EncodingType.Base64,
      });
      const { decode } = await import('base64-arraybuffer');
      const arrayBuffer = decode(base64);
      const { error: uploadError } = await (await import('../utils/supabase')).supabase.storage
        .from('logos')
        .upload(filePath, arrayBuffer, {
          contentType: mime,
          upsert: true,
        });
      if (uploadError) {
        Alert.alert('Erro', 'Falha ao fazer upload da logo.');
        return null;
      }
      const { data: publicData } = (await import('../utils/supabase')).supabase.storage
        .from('logos')
        .getPublicUrl(filePath);
      return publicData?.publicUrl ?? null;
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível processar a logo.');
      return null;
    }
  };

  const onSubmit = async (formData: any) => {
    setLoading(true);
    try {
      let logoUrl = estabelecimento?.logo || null;
      if (logoFile && estabelecimento?.user_id) {
        logoUrl = await uploadLogoAndGetPublicUrl(logoFile, estabelecimento.user_id);
      }
      await estabelecimentoService.atualizarEstabelecimento({
        nome: formData.nome,
        telefone: formData.telefone,
        endereco: formData.endereco,
        ramo: formData.ramo,
        logo: logoUrl || undefined,
      });
      await loadEstabelecimento();
      Alert.alert('Sucesso', 'Dados atualizados com sucesso!');
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível atualizar os dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mb-10 mt-5 flex-1 bg-gray-100">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
        style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          className="flex-1">
          <View className="m-6 flex-1">
            <View className="mb-8 w-full items-center">
              <Text
                className="mb-2 w-full text-center text-3xl font-bold text-gray-900"
                numberOfLines={2}
                ellipsizeMode="tail"
                style={{ flexWrap: 'wrap' }}>
                Editar Perfil
              </Text>
              <Text className="w-full text-center text-gray-600" style={{ flexWrap: 'wrap' }}>
                Atualize os dados do seu estabelecimento
              </Text>
            </View>
            <View className="space-y-4">
              <Controller
                control={control}
                name="nome"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Nome do Estabelecimento"
                    value={value}
                    onChangeText={onChange}
                    placeholder="Nome do estabelecimento"
                    error={errors.nome?.message}
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
                    placeholder="Telefone"
                    keyboardType="phone-pad"
                    error={errors.telefone?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="endereco"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Endereço"
                    value={value}
                    onChangeText={onChange}
                    placeholder="Endereço"
                    error={errors.endereco?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="ramo"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Ramo de Atividade"
                    value={value}
                    onChangeText={onChange}
                    placeholder="Ramo de atividade"
                    error={errors.ramo?.message}
                  />
                )}
              />
              <Text className="mb-2 text-base font-medium text-gray-700">Logotipo</Text>
              <TouchableOpacity
                className="mb-4 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-3"
                onPress={handlePickLogo}>
                <Text className="flex-1 text-center text-base font-medium text-gray-700">
                  {logoFile?.fileName || 'Selecionar Logotipo'}
                </Text>
              </TouchableOpacity>
              {logoPreview ? (
                <Image
                  source={{ uri: logoPreview }}
                  className="mb-4 h-20 w-20 self-center rounded-full"
                />
              ) : null}
              <Button
                title={loading ? 'Salvando...' : 'Salvar Alterações'}
                onPress={handleSubmit(onSubmit)}
                disabled={loading}
                className={`mt-6 ${loading ? 'opacity-50' : ''}`}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
}
