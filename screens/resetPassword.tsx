import React, { useState, useEffect } from 'react';
import { Alert, View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Container } from '../components/Container';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { BackButton } from '../components/BackButton';
import { supabase } from '../utils/supabase';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/theme';
import { useNavigation, CommonActions } from '@react-navigation/native';

export default function ResetPasswordScreen() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { isDark } = useTheme();
  const themeClasses = getThemeClasses(isDark);
  const navigation = useNavigation<any>();

  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      Alert.alert('Atenção', 'Informe a nova senha.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Atenção', 'As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        Alert.alert('Erro', error.message);
        return;
      }

      Alert.alert('Senha atualizada!', 'Sua senha foi alterada com sucesso.', [
        {
          text: 'OK',
          onPress: () => {
            // Navega para a tela principal
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'TabNavigator' }],
              })
            );
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível alterar a senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <BackButton onPress={() => navigation.goBack()} />
        <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
          <View className="mt-8">
            <Text className={`mb-2 text-2xl font-bold ${themeClasses.textPrimary}`}>
              🔐 Definir Nova Senha
            </Text>
            <Text className={`mb-6 ${themeClasses.textSecondary}`}>
              Crie uma nova senha segura para sua conta.
            </Text>

            <Input
              label="Nova senha"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Digite sua nova senha"
              secureTextEntry
              autoComplete="new-password"
              editable={!loading}
            />

            <Input
              label="Confirmar senha"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirme sua nova senha"
              secureTextEntry
              autoComplete="new-password"
              editable={!loading}
              className="mt-4"
            />

            <Button
              title={loading ? 'Salvando...' : 'Salvar Nova Senha'}
              onPress={handleResetPassword}
              disabled={loading}
              className="mt-6"
            />

            <View className="mt-8">
              <Text className={`text-sm ${themeClasses.textSecondary} text-center`}>
                💡 Use uma senha com pelo menos 6 caracteres, incluindo letras e números.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
}
