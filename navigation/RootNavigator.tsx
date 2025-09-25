// navigation/RootNavigator.tsx
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createStaticNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../contexts/ThemeContext';

// Store de auth (ajuste caminho se o seu estiver em src/)
import { useAuthStore } from '../store/authStore';

// Telas autenticadas
import TabNavigator from './tab-navigator';
import Modal from '../screens/modal';
import { estabelecimentoScreens } from './estabelecimento-screens';

// Telas não autenticadas
import LoginScreen from '../screens/login';
import RecuperarSenha from '../screens/recuperarSenha';
import AlterarSenhaObrigatoria from '../screens/alterarSenhaObrigatoria';
import ResetPasswordScreen from '../screens/resetPassword';
import IntroScreen from '../screens/intro';

// ====== STACKS ======

// Autenticado
const AuthenticatedStack = createStackNavigator({
  screens: {
    TabNavigator: { screen: TabNavigator, options: { headerShown: false } },
    Modal: {
      screen: Modal,
      options: { presentation: 'modal', headerLeft: () => null },
    },
    AlterarSenhaObrigatoria: {
      screen: AlterarSenhaObrigatoria,
      options: { title: 'Alterar senha' },
    },
    ResetPassword: {
      screen: ResetPasswordScreen,
      options: { title: 'Nova senha' },
    },
    ...estabelecimentoScreens,
  },
});

// NÃO autenticado – começa em Intro
const UnauthIntroFirst = createStackNavigator({
  initialRouteName: 'Intro',
  screens: {
    Intro: { screen: IntroScreen, options: { headerShown: false } },
    Login: { screen: LoginScreen, options: { headerShown: false } },
    RecuperarSenha: { screen: RecuperarSenha, options: { title: 'Recuperar senha' } },
  },
});

// NÃO autenticado – começa em Login
const UnauthLoginOnly = createStackNavigator({
  initialRouteName: 'Login',
  screens: {
    Intro: { screen: IntroScreen, options: { headerShown: false } },
    Login: { screen: LoginScreen, options: { headerShown: false } },
    RecuperarSenha: { screen: RecuperarSenha, options: { title: 'Recuperar senha' } },
  },
});

// Navegadores estáticos
const AuthenticatedNavigation = createStaticNavigation(AuthenticatedStack);
const UnauthIntroFirstNav = createStaticNavigation(UnauthIntroFirst);
const UnauthLoginOnlyNav = createStaticNavigation(UnauthLoginOnly);

export default function RootNavigator() {
  const { user, loading, initialize } = useAuthStore();
  const [introSeen, setIntroSeen] = useState<boolean | null>(null);
  const [pendingReset, setPendingReset] = useState<boolean>(false);

  // Inicializa auth
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Verifica se há reset de senha pendente
  useEffect(() => {
    (async () => {
      try {
        const resetFlag = await AsyncStorage.getItem('@pending_password_reset');
        if (resetFlag === 'true' && user) {
          setPendingReset(true);
          await AsyncStorage.removeItem('@pending_password_reset');
        }
      } catch (error) {
        console.error('Erro ao verificar reset pendente:', error);
      }
    })();
  }, [user]);

  // RootNavigator.tsx (antes de ler @onboarding_seen)
  const ONBOARDING_VERSION = '2';

  useEffect(() => {
    (async () => {
      const current = await AsyncStorage.getItem('@onboarding_version');
      if (current !== ONBOARDING_VERSION) {
        await AsyncStorage.removeItem('@onboarding_seen'); // força reaparecer
        await AsyncStorage.setItem('@onboarding_version', ONBOARDING_VERSION);
      }
    })();
  }, []);

  // Lê a flag do tutorial
  useEffect(() => {
    (async () => {
      try {
        const seen = await AsyncStorage.getItem('@onboarding_seen');
        setIntroSeen(seen === '1');
      } catch {
        setIntroSeen(false);
      }
    })();
  }, []);

  if (loading || introSeen === null) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc',
        }}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (user) {
    // Se há reset pendente, mostra tela de reset diretamente
    if (pendingReset) {
      const ResetStack = createStackNavigator({
        initialRouteName: 'ResetPassword',
        screens: {
          ResetPassword: {
            screen: ResetPasswordScreen,
            options: { title: 'Definir Nova Senha', headerLeft: () => null },
          },
          TabNavigator: { screen: TabNavigator, options: { headerShown: false } },
        },
      });
      const ResetNavigation = createStaticNavigation(ResetStack);
      return <ResetNavigation />;
    }

    return <AuthenticatedNavigation />;
  }

  // Escolhe qual stack não-autenticado renderizar (sem passar prop no JSX)
  return introSeen ? <UnauthLoginOnlyNav /> : <UnauthIntroFirstNav />;
}
