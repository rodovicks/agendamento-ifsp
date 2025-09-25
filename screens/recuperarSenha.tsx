import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { Container } from '../components/Container';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { BackButton } from '../components/BackButton';
import { supabase } from '../utils/supabase';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/theme';

export default function RecuperarSenha() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { isDark } = useTheme();
  const themeClasses = getThemeClasses(isDark);

  // Validação simples de email
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Método usando apenas a API nativa do Supabase
  const handleSend = async () => {
    if (!email.trim()) {
      Alert.alert('Atenção', 'Informe seu email.');
      return;
    }

    if (!isValidEmail(email.trim())) {
      Alert.alert('Atenção', 'Informe um email válido.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: 'ifsp-agendamentos://reset-password',
      });

      if (error) {
        console.error('Erro no reset:', error);
        Alert.alert(
          'Erro',
          'Não foi possível enviar o email de recuperação. Verifique se o email está cadastrado e tente novamente.'
        );
        return;
      }

      Alert.alert(
        'Email enviado!',
        'Se o email informado estiver cadastrado, você receberá um link para redefinir sua senha. Verifique sua caixa de entrada e spam.',
        [{ text: 'OK', style: 'default' }]
      );
    } catch (e) {
      console.error('Erro no reset:', e);
      Alert.alert('Erro', 'Não foi possível processar sua solicitação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
          <View className="mt-8">
            <Text className={`mb-2 text-2xl font-bold ${themeClasses.textPrimary}`}>
              Recuperar senha
            </Text>
            <Text className={`mb-6 ${themeClasses.textSecondary}`}>
              Informe seu email cadastrado. Se existir em nosso sistema, enviaremos instruções para
              recuperação.
            </Text>

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="seuemail@exemplo.com"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              editable={!loading}
            />

            <Button
              title={loading ? 'Enviando...' : 'Enviar link de recuperação'}
              onPress={handleSend}
              disabled={loading}
              className="mt-6"
            />

            <View className="mt-8">
              <Text className={`text-sm ${themeClasses.textSecondary} text-center`}>
                Lembre-se de verificar sua caixa de spam caso não receba o email em alguns minutos.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
}
