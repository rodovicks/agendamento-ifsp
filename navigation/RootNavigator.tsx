import { createStaticNavigation, StaticParamList } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '../store/authStore';
import LoginScreen from '../screens/login';
import TabNavigator from './tab-navigator';
import Modal from '../screens/modal';

// Stack para usuários autenticados
const AuthenticatedStack = createStackNavigator({
  screens: {
    TabNavigator: {
      screen: TabNavigator,
      options: {
        headerShown: false,
      },
    },
    Modal: {
      screen: Modal,
      options: {
        presentation: 'modal',
        headerLeft: () => null,
      },
    },
  },
});

// Stack para usuários não autenticados
const UnauthenticatedStack = createStackNavigator({
  screens: {
    Login: {
      screen: LoginScreen,
      options: {
        headerShown: false,
      },
    },
  },
});

// Componente que decide qual stack mostrar
function RootNavigator() {
  const { user, loading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (user) {
    const AuthenticatedNavigation = createStaticNavigation(AuthenticatedStack);
    return <AuthenticatedNavigation />;
  } else {
    const UnauthenticatedNavigation = createStaticNavigation(UnauthenticatedStack);
    return <UnauthenticatedNavigation />;
  }
}

export default RootNavigator;
