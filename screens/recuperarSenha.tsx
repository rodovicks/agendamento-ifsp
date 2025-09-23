import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { Container } from '../components/Container';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { supabase } from '../utils/supabase';

export default function RecuperarSenha() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!email) {
      Alert.alert('Atenção', 'Informe seu email.');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-temp-password', {
        body: { email },
      });
      if (error) {
        const anyErr: any = error as any;
        const status = anyErr?.context?.response?.status;
        if (status === 404) {
          Alert.alert('Erro', 'Função não encontrada (404). Realize o deploy no Supabase.');
        } else if (status === 401) {
          Alert.alert('Erro', 'A função exige autenticação. Deploy com --no-verify-jwt ou chame autenticado.');
        } else {
          Alert.alert('Erro', anyErr?.message || 'Falha ao solicitar senha temporária.');
        }
        return;
      }
      Alert.alert(
        'Solicitação enviada',
        'Se o email existir, enviaremos uma senha temporária para seu email.'
      );
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível processar sua solicitação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
          <View className="mt-8">
            <Text className="mb-2 text-2xl font-bold text-gray-800">Recuperar senha</Text>
            <Text className="mb-6 text-gray-600">Informe seu email. Se existir, enviaremos uma senha temporária.</Text>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="seuemail@exemplo.com"
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <Button
              title={loading ? 'Enviando...' : 'Enviar senha temporária'}
              onPress={handleSend}
              disabled={loading}
              className="mt-6"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
}

