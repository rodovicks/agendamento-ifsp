import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { Container } from '../components/Container';
import { useAuthStore } from '../store/authStore';

type FormShape = {
  nome: string;
  telefone: string;
  endereco: string;
  ramo: string;
  logo: string;
};

export default function ConfiguracoesScreen() {
  const { user, estabelecimento, signOut, loadEstabelecimento } = useAuthStore();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<FormShape>({
    nome: estabelecimento?.nome || '',
    telefone: estabelecimento?.telefone || '',
    endereco: estabelecimento?.endereco || '',
    ramo: estabelecimento?.ramo || '',
    logo: estabelecimento?.logo || '',
  });
  const [logoFile, setLogoFile] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [loading, setLoading] = useState(false);

  const displayLogo = useMemo(() => {
    if (logoFile?.uri) return logoFile.uri;
    if (form.logo) return form.logo;
    if (estabelecimento?.logo) return estabelecimento.logo;
    return '';
  }, [logoFile, form.logo, estabelecimento?.logo]);

  const handlePickLogo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setLogoFile(result.assets[0]);
    }
  };

  const uploadLogoToSupabase = async (
    file: ImagePicker.ImagePickerAsset
  ): Promise<string | null> => {
    try {
      const response = await fetch(file.uri);
      const blob = await response.blob();
      const fileName = `logo_${Date.now()}.jpg`;
      const { error } = await import('../utils/supabase').then((m) =>
        m.supabase.storage.from('logos').upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: true,
        })
      );
      if (error) throw error;
      const url = await import('../utils/supabase').then(
        (m) => m.supabase.storage.from('logos').getPublicUrl(fileName).data.publicUrl
      );
      return url;
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Falha ao fazer upload da logo');
      return null;
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let logoUrl = form.logo;
      if (logoFile) {
        logoUrl = (await uploadLogoToSupabase(logoFile)) || form.logo;
      }
      await import('../utils/estabelecimento').then((m) =>
        m.estabelecimentoService.atualizarEstabelecimento({
          nome: form.nome.trim(),
          telefone: form.telefone.trim(),
          endereco: form.endereco.trim(),
          ramo: form.ramo.trim(),
          logo: logoUrl,
        })
      );
      await import('../utils/supabase').then((m) =>
        m.supabase.auth.updateUser({
          data: {
            nome: form.nome.trim(),
            telefone: form.telefone.trim(),
            endereco: form.endereco.trim(),
            ramo: form.ramo.trim(),
            logo: logoUrl,
          },
        })
      );
      setForm((f) => ({ ...f, logo: logoUrl }));
      await loadEstabelecimento();
      setEditMode(false);
      setLogoFile(null);
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Falha ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: signOut },
    ]);
  };

  const HeaderCard = () => (
    <View className="mb-6 overflow-hidden rounded-2xl bg-indigo-600">
      <View className="p-5">
        <Text className="text-sm text-indigo-100">Configurações</Text>
        <Text className="mt-0.5 text-2xl font-bold text-white">
          {estabelecimento?.nome || 'Seu Estabelecimento'}
        </Text>

        <View className="mt-4 flex-row items-center">
          <View className="h-16 w-16 overflow-hidden rounded-full border-2 border-white/70 bg-white">
            {displayLogo ? (
              <Image source={{ uri: displayLogo }} className="h-full w-full" />
            ) : (
              <View className="h-full w-full items-center justify-center bg-indigo-50">
                <Text className="text-lg font-semibold text-indigo-600">
                  {(estabelecimento?.nome || 'E').slice(0, 1).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <View className="ml-4">
            <Text className="text-indigo-100">Usuário</Text>
            <Text className="font-medium text-white">{user?.email}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => setEditMode(true)}
          className="mt-4 self-start rounded-full bg-white/15 px-4 py-2">
          <Text className="font-medium text-white">Editar perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const InfoRow = ({ label, value }: { label: string; value?: string }) => (
    <View className="mb-3">
      <Text className="text-xs uppercase tracking-wide text-gray-500">{label}</Text>
      <Text className="mt-0.5 text-base text-gray-900">{value || '—'}</Text>
    </View>
  );

  const Field = ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType,
  }: {
    label: string;
    value: string;
    onChangeText: (t: string) => void;
    placeholder?: string;
    keyboardType?: 'default' | 'numeric' | 'phone-pad' | 'email-address';
  }) => (
    <View className="mb-4">
      <Text className="mb-1 text-sm font-medium text-gray-700">{label}</Text>
      <TextInput
        className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-base text-gray-900"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboardType || 'default'}
      />
    </View>
  );

  const options: {
    label: string;
    icon: React.ComponentProps<typeof Feather>['name'];
    onPress: () => void;
  }[] = [
    { label: 'Notificações', icon: 'bell', onPress: () => {} },
    { label: 'Preferências', icon: 'sliders', onPress: () => {} },
    { label: 'Ajuda', icon: 'help-circle', onPress: () => {} },
    { label: 'Sobre', icon: 'info', onPress: () => {} },
  ];

  return (
    <Container className="bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <HeaderCard />

        {/* Bloco principal */}
        <View className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          {editMode ? (
            <>
              <Text className="mb-4 text-lg font-semibold text-gray-900">
                Editar estabelecimento
              </Text>

              {/* Preview + trocar logo */}
              <View className="mb-5 flex-row items-center">
                <View className="h-14 w-14 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
                  {displayLogo ? (
                    <Image source={{ uri: displayLogo }} className="h-full w-full" />
                  ) : (
                    <View className="h-full w-full items-center justify-center">
                      <Text className="font-semibold text-gray-500">LOGO</Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  onPress={handlePickLogo}
                  className="ml-3 rounded-full border border-gray-300 px-4 py-2">
                  <Text className="text-gray-700">
                    {logoFile ? 'Logo selecionada ✓' : 'Selecionar nova logo'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Field
                label="Nome"
                value={form.nome}
                onChangeText={(v) => setForm((f) => ({ ...f, nome: v }))}
                placeholder="Nome do estabelecimento"
              />
              <Field
                label="Telefone"
                value={form.telefone}
                onChangeText={(v) => setForm((f) => ({ ...f, telefone: v }))}
                placeholder="(11) 99999-9999"
                keyboardType="phone-pad"
              />
              <Field
                label="Endereço"
                value={form.endereco}
                onChangeText={(v) => setForm((f) => ({ ...f, endereco: v }))}
                placeholder="Rua, número, bairro"
              />
              <Field
                label="Ramo"
                value={form.ramo}
                onChangeText={(v) => setForm((f) => ({ ...f, ramo: v }))}
                placeholder="Ex.: Clínica, Oficina, Salão..."
              />

              {/* Ações */}
              <View className="mt-2 flex-row">
                <TouchableOpacity
                  onPress={handleSave}
                  disabled={loading}
                  className={`flex-1 items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 ${
                    loading ? 'opacity-60' : ''
                  }`}>
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text className="font-semibold text-white">Salvar alterações</Text>
                  )}
                </TouchableOpacity>

                <View className="w-3" />

                <TouchableOpacity
                  onPress={() => {
                    setEditMode(false);
                    setForm({
                      nome: estabelecimento?.nome || '',
                      telefone: estabelecimento?.telefone || '',
                      endereco: estabelecimento?.endereco || '',
                      ramo: estabelecimento?.ramo || '',
                      logo: estabelecimento?.logo || '',
                    });
                    setLogoFile(null);
                  }}
                  disabled={loading}
                  className="flex-1 items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-3">
                  <Text className="font-semibold text-gray-800">Cancelar</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : estabelecimento ? (
            <>
              <Text className="mb-4 text-lg font-semibold text-gray-900">Estabelecimento</Text>
              <InfoRow label="Nome" value={estabelecimento.nome} />
              <InfoRow label="Telefone" value={estabelecimento.telefone} />
              <InfoRow label="Endereço" value={estabelecimento.endereco} />
              <InfoRow label="Ramo" value={estabelecimento.ramo} />
              {estabelecimento.logo ? (
                <View className="mt-2 flex-row items-center">
                  <Text className="mr-2 text-xs uppercase tracking-wide text-gray-500">Logo</Text>
                  <View className="h-10 w-10 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
                    <Image source={{ uri: estabelecimento.logo }} className="h-full w-full" />
                  </View>
                </View>
              ) : null}

              <TouchableOpacity
                onPress={() => setEditMode(true)}
                className="mt-5 self-start rounded-xl bg-indigo-600 px-4 py-2">
                <Text className="font-semibold text-white">Editar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
              <Text className="mb-1 font-medium text-yellow-900">Dados incompletos</Text>
              <Text className="text-yellow-800">
                Complete o cadastro do seu estabelecimento para usar todas as funcionalidades.
              </Text>
              <TouchableOpacity
                onPress={() => setEditMode(true)}
                className="mt-3 self-start rounded-full bg-yellow-900/10 px-3 py-1.5">
                <Text className="text-yellow-900">Completar cadastro</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Opções */}
        <View className="overflow-hidden rounded-2xl bg-white shadow-sm">
          {options.map((item, idx) => (
            <TouchableOpacity
              key={item.label}
              className={`flex-row items-center justify-between p-4 ${
                idx !== options.length - 1 ? 'border-b border-gray-100' : ''
              }`}
              onPress={item.onPress}>
              <View className="flex-row items-center">
                <Feather name={item.icon} size={20} color="#4B5563" />
                <Text className="ml-3 text-base text-gray-900">{item.label}</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#D1D5DB" />
            </TouchableOpacity>
          ))}

          <TouchableOpacity className="flex-row items-center p-4" onPress={handleSignOut}>
            <Feather name="log-out" size={20} color="#DC2626" />
            <Text className="ml-3 text-base font-semibold text-red-600">Sair</Text>
          </TouchableOpacity>
        </View>

        <View className="h-6" />
      </ScrollView>
    </Container>
  );
}
