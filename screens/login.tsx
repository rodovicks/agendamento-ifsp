import { useForm, Controller } from 'react-hook-form';
import { useEffect, useMemo, useState } from 'react';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import * as ImagePicker from 'expo-image-picker';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '../components/Button';
import { Container } from '../components/Container';
import { Input } from '../components/Input';
import { supabase } from '../utils/supabase';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { useNavigation } from '@react-navigation/native';

// Types
interface SignForm {
  email: string;
  password: string;
  nome?: string;
  telefone?: string;
  endereco?: string;
  ramo?: string;
}

const BIO_FLAG_KEY = 'bio_enabled';
const BIO_REFRESH_TOKEN_KEY = 'bio_refresh_token';
const BIO_PROMPTED_KEY = 'bio_prompted'; // perguntar biometria só no primeiro login

export default function LoginScreen() {
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [logoFile, setLogoFile] = useState<ImagePicker.ImagePickerAsset | null>(null);

  // Biometria
  const [isHardwareAvailable, setIsHardwareAvailable] = useState(false);
  const [bioEnabled, setBioEnabled] = useState(false);
  const [bioPrompted, setBioPrompted] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setIsHardwareAvailable(!!compatible && !!enrolled);

        const flag = (await SecureStore.getItemAsync(BIO_FLAG_KEY)) === 'true';
        setBioEnabled(flag);

        const prompted = (await SecureStore.getItemAsync(BIO_PROMPTED_KEY)) === 'true';
        setBioPrompted(prompted);
      } catch {
        // ignore
      }
    })();
  }, []);

  // manter refresh_token atualizado quando o Supabase rotacionar
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
        const rt = session?.refresh_token;
        if (rt) SecureStore.setItemAsync(BIO_REFRESH_TOKEN_KEY, String(rt));
      }
      // if (event === 'SIGNED_OUT') { SecureStore.deleteItemAsync(BIO_REFRESH_TOKEN_KEY); }
    });
    return () => {
      sub.subscription?.unsubscribe();
    };
  }, []);

  // ✅ Two schemas (login vs signup) and swap the resolver based on isSignUp
  const loginSchema = yup.object({
    email: yup.string().email('Email inválido').required('Email é obrigatório'),
    password: yup.string().min(6, 'Mínimo 6 caracteres').required('Senha é obrigatória'),
  });

  const signUpSchema = loginSchema.shape({
    nome: yup.string().required('Nome do estabelecimento é obrigatório'),
    telefone: yup.string().required('Telefone é obrigatório'),
    endereco: yup.string().required('Endereço é obrigatório'),
    ramo: yup.string().required('Ramo de atividade é obrigatório'),
  });

  const resolver = useMemo(() => yupResolver(isSignUp ? signUpSchema : loginSchema), [isSignUp]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SignForm>({
    resolver,
    defaultValues: {
      email: '',
      password: '',
      nome: '',
      telefone: '',
      endereco: '',
      ramo: '',
    },
  });

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

      const base64 = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const arrayBuffer = decode(base64);

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, arrayBuffer, {
          contentType: mime,
          upsert: true,
        });

      if (uploadError) {
        console.log('Erro ao fazer upload da logo:', uploadError);
        Alert.alert('Erro', 'Falha ao fazer upload da logo.');
        return null;
      }

      const { data: publicData } = supabase.storage.from('logos').getPublicUrl(filePath);
      return publicData?.publicUrl ?? null;
    } catch (err) {
      console.log('Erro inesperado no upload da logo:', err);
      Alert.alert('Erro', 'Não foi possível processar a logo.');
      return null;
    }
  };

  const enableBiometrics = async (sessionRefreshToken?: string) => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !isEnrolled) {
        Alert.alert('Biometria indisponível', 'Seu aparelho não possui biometria configurada.');
        return;
      }

      const auth = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Confirmar biometria',
      });

      if (auth.success) {
        if (sessionRefreshToken) {
          await SecureStore.setItemAsync(BIO_REFRESH_TOKEN_KEY, String(sessionRefreshToken));
        }
        await SecureStore.setItemAsync(BIO_FLAG_KEY, 'true');
        setBioEnabled(true);
        Alert.alert('Pronto!', 'Biometria ativada.');
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível ativar a biometria.');
    }
  };

  const tryBiometricLogin = async () => {
    try {
      if (!isHardwareAvailable || !bioEnabled) return;

      const auth = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Entrar com biometria',
      });
      if (!auth.success) return;

      const refresh_token = await SecureStore.getItemAsync(BIO_REFRESH_TOKEN_KEY);
      if (!refresh_token) {
        Alert.alert('Sessão ausente', 'Faça login com senha para configurar a biometria.');
        return;
      }

      // ✅ Restaurar usando refreshSession (tokens são rotativos)
      const { data, error } = await supabase.auth.refreshSession({ refresh_token });
      if (error || !data?.session) {
        Alert.alert(
          'Não foi possível restaurar a sessão',
          'Faça login com senha para reativar a biometria.'
        );
        return;
      }

      // Salva o novo refresh_token pós-rotação
      const newRefresh = data.session.refresh_token;
      if (newRefresh) {
        await SecureStore.setItemAsync(BIO_REFRESH_TOKEN_KEY, String(newRefresh));
      }

      // navigation.navigate('Home');
      Alert.alert('Sucesso', 'Login realizado com biometria!');
    } catch {
      Alert.alert('Erro', 'Falha ao autenticar com biometria.');
    }
  };

  const handleAuth = async (formData: SignForm) => {
    setLoading(true);
    try {
      if (isSignUp) {
        // 1) Cria o usuário primeiro
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              nome: formData.nome,
              telefone: formData.telefone,
              endereco: formData.endereco,
              ramo: formData.ramo,
            },
            emailRedirectTo: 'https://www.ifsp.edu.br',
          },
        });

        if (error) {
          if (/rate limit/i.test(error.message)) {
            Alert.alert(
              'Limite de envio de email',
              'Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.'
            );
          } else {
            Alert.alert('Erro', error.message);
          }
          return;
        }

        const userId = data.user?.id;
        let logoUrl: string | null = null;

        // 2) Upload da logo (se existir)
        if (userId && logoFile) {
          logoUrl = await uploadLogoAndGetPublicUrl(logoFile, userId);
          if (logoUrl) {
            await supabase.auth.updateUser({ data: { logo: logoUrl } });
          }
        }

        // 3) Salva o estabelecimento
        if (userId) {
          const { error: insertError } = await supabase.from('estabelecimentos').insert({
            user_id: userId,
            nome: formData.nome,
            email: formData.email,
            telefone: formData.telefone,
            endereco: formData.endereco,
            ramo: formData.ramo,
            logo: logoUrl,
          });

          if (insertError) {
            console.error('Erro ao inserir estabelecimento:', insertError);
            Alert.alert(
              'Atenção',
              'Usuário criado, mas houve erro ao salvar dados do estabelecimento. Você pode completar o cadastro depois no perfil.'
            );
          } else {
            // ✅ Após criar a conta, avisa e volta para a tela de login
            Alert.alert(
              'Sucesso',
              'Conta criada! Verifique seu email para confirmar. Você será direcionado ao login.',
              [
                {
                  text: 'Ok',
                  onPress: () => {
                    // Limpa estados e volta para login
                    setLogoFile(null);
                    reset({
                      email: '',
                      password: '',
                      nome: '',
                      telefone: '',
                      endereco: '',
                      ramo: '',
                    });
                    setIsSignUp(false);
                    // navigation.goBack() ou navigation.navigate('Login') se usar rotas separadas
                  },
                },
              ]
            );
          }
        }
      } else {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) {
          Alert.alert('Erro', error.message);
          return;
        }

        // 🔐 Perguntar biometria apenas NO PRIMEIRO LOGIN do app
        if (!bioPrompted && isHardwareAvailable && !bioEnabled) {
          await SecureStore.setItemAsync(BIO_PROMPTED_KEY, 'true');
          setBioPrompted(true);

          Alert.alert('Autenticação Biométrica', 'Deseja utilizar biometria nas próximas vezes?', [
            { text: 'Não', style: 'cancel' },
            {
              text: 'Sim',
              onPress: async () => {
                await enableBiometrics(data.session?.refresh_token || undefined);
              },
            },
          ]);
        }
      }
    } catch (err) {
      console.log(err);
      Alert.alert('Erro', 'Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const onToggleMode = () => {
    setIsSignUp((prev) => !prev);
    setLogoFile(null);
    reset({ email: '', password: '', nome: '', telefone: '', endereco: '', ramo: '' });
  };

  return (
    <Container className="mb-10 mt-10 flex-1 bg-gray-100">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
        style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          className="flex-1">
          <View className="m-6 flex-1 justify-center">
            <View className="mb-8 items-center">
              <Text className="mb-2 text-3xl font-bold text-gray-900">
                {isSignUp ? 'Criar Conta' : 'Entrar'}
              </Text>
              <Text className="text-center text-gray-600">
                {isSignUp
                  ? 'Crie sua conta para começar a usar o sistema de agendamentos'
                  : 'Faça login para acessar o sistema de agendamentos do IFSP'}
              </Text>
            </View>

            <View className="space-y-4">
              {isSignUp && (
                <>
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
                    <Text>{logoFile?.fileName || 'Selecionar Logotipo '}</Text>
                  </TouchableOpacity>
                </>
              )}

              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Email"
                    value={value}
                    onChangeText={onChange}
                    placeholder="Digite seu email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    textContentType="emailAddress"
                    error={errors.email?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Senha"
                    value={value}
                    onChangeText={onChange}
                    placeholder="Digite sua senha"
                    secureTextEntry
                    autoComplete="password"
                    textContentType="password"
                    error={errors.password?.message}
                  />
                )}
              />

              <Button
                title={loading ? 'Carregando...' : isSignUp ? 'Criar Conta' : 'Entrar'}
                onPress={handleSubmit(handleAuth)}
                disabled={loading}
                className={`mt-6 ${loading ? 'opacity-50' : ''}`}
              />

              {/* Botão de login por biometria, quando disponível e habilitada */}
              {!isSignUp && isHardwareAvailable && bioEnabled && (
                <Button
                  title="Entrar com biometria"
                  onPress={tryBiometricLogin}
                  disabled={loading}
                  className="mt-2"
                />
              )}
            </View>

            <View className="mt-8 flex-row items-center justify-center">
              <TouchableOpacity onPress={onToggleMode} className="ml-2">
                <Text className="font-semibold text-indigo-600">
                  {isSignUp ? 'Fazer login' : 'Cadastrar-se'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
}
