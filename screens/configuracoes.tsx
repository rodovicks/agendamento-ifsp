import React, { useMemo } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Container } from '../components/Container';
import { useAuthStore } from '../store/authStore';

export default function ConfiguracoesScreen() {
  const navigation = useNavigation();
  const { user, estabelecimento, signOut } = useAuthStore();

  const displayLogo = useMemo(() => {
    if (estabelecimento?.logo) return estabelecimento.logo;
    return '';
  }, [estabelecimento?.logo]);

  const options: {
    label: string;
    icon: React.ComponentProps<typeof Feather>['name'];
    route: string;
  }[] = [
    { label: 'Ramo de Atividade', icon: 'briefcase', route: 'RamoAtividade' },
    { label: 'Serviços', icon: 'tool', route: 'Servicos' },
    { label: 'Colaboradores', icon: 'users', route: 'Colaboradores' },
    { label: 'Agendamento', icon: 'calendar', route: 'Agendamento' },
    { label: 'Ajustes', icon: 'settings', route: 'Ajustes' },
  ];

  const handleSignOut = () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: signOut },
    ]);
  };

  const HeaderCard = () => (
    <View className="m-6 overflow-hidden rounded-2xl bg-indigo-600">
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
          <View className="ml-4 flex-1">
            <Text className="text-indigo-100">Usuário</Text>
            <Text className="font-medium text-white">{user?.email}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('EditarPerfil' as never)}
          className="mt-4 self-start rounded-full bg-white/15 px-4 py-2">
          <Text className="font-medium text-white">Editar perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Container className="bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <HeaderCard />

        <View className="mx-6 mb-6 overflow-hidden rounded-2xl bg-white shadow-sm">
          {options.map((item) => (
            <TouchableOpacity
              key={item.label}
              className="flex-row items-center justify-between border-b border-gray-100 p-4"
              onPress={() => navigation.navigate(item.route as never)}>
              <View className="flex-1 flex-row items-center">
                <Feather name={item.icon} size={20} color="#4B5563" />
                <Text className="ml-3 flex-1 text-base text-gray-900">{item.label}</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#D1D5DB" />
            </TouchableOpacity>
          ))}

          <TouchableOpacity className="flex-row items-center p-4" onPress={handleSignOut}>
            <Feather name="log-out" size={20} />
            <Text className="ml-3 text-base font-semibold">Sair</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Container>
  );
}
