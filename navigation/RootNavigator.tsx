// navigation/RootNavigator.tsx
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createStaticNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Store de auth (ajuste caminho se o seu estiver em src/)
import { useAuthStore } from '../store/authStore';

// Telas autenticadas
import TabNavigator from './tab-navigator';
import Modal from '../screens/modal';
import { estabelecimentoScreens } from './estabelecimento-screens';

// Telas não autenticadas
import LoginScreen from '../screens/login';
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
    ...estabelecimentoScreens,
  },
});

// NÃO autenticado – começa em Intro
const UnauthIntroFirst = createStackNavigator({
  initialRouteName: 'Intro',
  screens: {
    Intro: { screen: IntroScreen, options: { headerShown: false } },
    Login: { screen: LoginScreen, options: { headerShown: false } },
  },
});

// NÃO autenticado – começa em Login
const UnauthLoginOnly = createStackNavigator({
  initialRouteName: 'Login',
  screens: {
    Intro: { screen: IntroScreen, options: { headerShown: false } },
    Login: { screen: LoginScreen, options: { headerShown: false } },
  },
});

// Navegadores estáticos
const AuthenticatedNavigation = createStaticNavigation(AuthenticatedStack);
const UnauthIntroFirstNav = createStaticNavigation(UnauthIntroFirst);
const UnauthLoginOnlyNav = createStaticNavigation(UnauthLoginOnly);

export default function RootNavigator() {
  const { user, loading, initialize } = useAuthStore();
  const [introSeen, setIntroSeen] = useState<boolean | null>(null);

  // Inicializa auth
  useEffect(() => {
    initialize();
  }, [initialize]);


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
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (user) {
    return <AuthenticatedNavigation />;
  }

  // Escolhe qual stack não-autenticado renderizar (sem passar prop no JSX)
  return introSeen ? <UnauthLoginOnlyNav /> : <UnauthIntroFirstNav />;
}
