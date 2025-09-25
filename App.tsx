import './global.css';

import 'react-native-gesture-handler';

import { useEffect } from 'react';
import { Linking, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RootNavigator from './navigation/RootNavigator';
import { ThemeProvider } from './contexts/ThemeContext';
import { supabase } from './utils/supabase';

export default function App() {
  useEffect(() => {
    // Handler para deep links quando o app já está aberto
    const handleDeepLink = (event: { url: string }) => {
      handleResetPasswordLink(event.url);
    };

    // Handler para deep links quando o app é aberto pelo link
    const getInitialURL = async () => {
      const url = await Linking.getInitialURL();
      if (url) {
        handleResetPasswordLink(url);
      }
    };

    // Processa URLs de reset de senha
    const handleResetPasswordLink = async (url: string) => {
      console.log('Deep link recebido:', url);

      // Verifica se é um link de reset de senha
      if (!url.includes('reset-password')) {
        return;
      }

      try {
        // Extrai os parâmetros da URL
        const urlObj = new URL(url);
        const accessToken = urlObj.searchParams.get('access_token');
        const refreshToken = urlObj.searchParams.get('refresh_token');
        const type = urlObj.searchParams.get('type');

        console.log('Parâmetros do link:', {
          accessToken: !!accessToken,
          refreshToken: !!refreshToken,
          type,
        });

        if (type === 'recovery' && accessToken && refreshToken) {
          // Define a sessão com os tokens recebidos
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('Erro ao definir sessão:', error);
            Alert.alert('Erro', 'Link inválido ou expirado.');
            return;
          }

          console.log('Sessão definida com sucesso:', data);

          // Salva flag para mostrar tela de reset ao entrar no app
          await AsyncStorage.setItem('@pending_password_reset', 'true');

          Alert.alert(
            'Link de reset válido!',
            'Você será redirecionado para definir uma nova senha.',
            [
              {
                text: 'OK',
                onPress: () => {
                  // A navegação será feita pelo RootNavigator ao detectar a flag
                },
              },
            ]
          );
        } else {
          console.log('Link de reset inválido ou incompleto');
          Alert.alert('Erro', 'Link de reset inválido ou incompleto.');
        }
      } catch (error) {
        console.error('Erro ao processar deep link:', error);
        Alert.alert('Erro', 'Não foi possível processar o link de reset.');
      }
    };

    // Registra os listeners
    const subscription = Linking.addEventListener('url', handleDeepLink);
    getInitialURL();

    // Cleanup
    return () => {
      subscription?.remove();
    };
  }, []);

  return (
    <ThemeProvider>
      <RootNavigator />
    </ThemeProvider>
  );
}
