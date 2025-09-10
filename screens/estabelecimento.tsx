import { useAuthStore } from '../store/authStore';
import { View, Text, Image } from 'react-native';

export default function EstabelecimentoScreen() {
  const { estabelecimento } = useAuthStore();

  return (
    <View className="flex-1 bg-white p-6">
      <Text className="mb-6 text-2xl font-bold">Perfil do Estabelecimento</Text>
      {estabelecimento ? (
        <>
          {estabelecimento.logo ? (
            <Image
              source={{ uri: estabelecimento.logo }}
              className="mb-4 h-20 w-20 self-center rounded-full"
            />
          ) : null}
          <Text className="mt-3 text-base font-bold">Nome:</Text>
          <Text className="mb-2 text-base">{estabelecimento.nome}</Text>
          <Text className="mt-3 text-base font-bold">Telefone:</Text>
          <Text className="mb-2 text-base">{estabelecimento.telefone}</Text>
          <Text className="mt-3 text-base font-bold">Endereço:</Text>
          <Text className="mb-2 text-base">{estabelecimento.endereco}</Text>
          <Text className="mt-3 text-base font-bold">Ramo:</Text>
          <Text className="mb-2 text-base">{estabelecimento.ramo}</Text>
        </>
      ) : (
        <Text>Nenhum dado de estabelecimento encontrado.</Text>
      )}
    </View>
  );
}

// Removido StyleSheet, agora usando NativeWind CSS
