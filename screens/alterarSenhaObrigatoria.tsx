import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { Container } from '../components/Container';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { supabase } from '../utils/supabase';

export default function AlterarSenhaObrigatoria() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = async () => {
    if (!password || password.length < 6) {
      Alert.alert('Atenção', 'Informe uma nova senha com no mínimo 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Atenção', 'As senhas não conferem.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password,
        data: { must_change_password: false },
      });
      if (error) {
        Alert.alert('Erro', error.message);
        return;
      }
      Alert.alert('Sucesso', 'Senha alterada com sucesso.');
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível alterar a senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
          <View className="mt-8">
            <Text className="mb-2 text-2xl font-bold text-gray-800">Definir nova senha</Text>
            <Text className="mb-6 text-gray-600">Sua conta está com senha temporária. Defina uma nova senha para continuar.</Text>
            <Input
              label="Nova senha"
              value={password}
              onChangeText={setPassword}
              placeholder="Digite a nova senha"
              secureTextEntry
            />
            <Input
              label="Confirmar nova senha"
              value={confirm}
              onChangeText={setConfirm}
              placeholder="Repita a nova senha"
              secureTextEntry
              className="mt-2"
            />
            <Button
              title={loading ? 'Salvando...' : 'Salvar nova senha'}
              onPress={handleChange}
              disabled={loading}
              className="mt-6"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
}

