import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { Container } from '../components/Container';
import { ClientesService, type ClienteAtendido } from '../services/clientesService';
import { FiltroClientes, type FiltrosClientes } from '../components/Clientes';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/theme';

interface ClienteSimples {
  id: string;
  nome: string;
  telefone: string;
}

export default function ClientesScreen() {
  const { estabelecimento } = useAuthStore();
  const { isDark } = useTheme();
  const themeClasses = getThemeClasses(isDark);
  const [clientes, setClientes] = useState<ClienteSimples[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosClientes>({});

  const carregarClientes = async (showLoading = true) => {
    if (!estabelecimento?.id) return;

    if (showLoading) setLoading(true);

    try {
      const clientesData = await ClientesService.buscarClientesAtendidos(
        estabelecimento.id,
        filtros
      );

      // Converter para formato simples e ordenar alfabeticamente
      const clientesSimples: ClienteSimples[] = clientesData
        .map((cliente) => ({
          id: cliente.id,
          nome: cliente.nome,
          telefone: cliente.telefone,
        }))
        .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

      setClientes(clientesSimples);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      Alert.alert('Erro', 'Não foi possível carregar a lista de clientes.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarClientes(false);
    setRefreshing(false);
  };

  const formatarTelefone = (telefone: string) => {
    const apenasNumeros = telefone.replace(/\D/g, '');

    if (apenasNumeros.length === 11) {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 7)}-${apenasNumeros.slice(7)}`;
    } else if (apenasNumeros.length === 10) {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 6)}-${apenasNumeros.slice(6)}`;
    }
    return telefone;
  };

  const enviarWhatsApp = (telefone: string) => {
    const telefoneFormatado = telefone.replace(/\D/g, '');
    const url = `whatsapp://send?phone=55${telefoneFormatado}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('WhatsApp não instalado', 'O WhatsApp não está instalado neste dispositivo.');
        }
      })
      .catch(() => {
        Alert.alert('Erro', 'Não foi possível abrir o WhatsApp.');
      });
  };

  const handleFiltrosChange = (novosFiltros: FiltrosClientes) => {
    setFiltros(novosFiltros);
  };

  const limparFiltros = () => {
    setFiltros({});
  };

  useFocusEffect(
    useCallback(() => {
      carregarClientes();
    }, [estabelecimento?.id])
  );

  // Recarregar clientes quando os filtros mudarem
  useEffect(() => {
    if (estabelecimento?.id) {
      carregarClientes();
    }
  }, [filtros, estabelecimento?.id]);

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center py-8">
      <Text className={`mb-2 text-lg ${themeClasses.textMuted}`}>Nenhum cliente encontrado </Text>
      <Text className={`px-4 text-center ${themeClasses.textMuted}`}>
        {Object.keys(filtros).length > 0
          ? 'Tente ajustar os filtros para encontrar clientes.'
          : 'Ainda não há clientes atendidos no seu estabelecimento.'}
      </Text>
    </View>
  );

  const renderItem = ({ item }: { item: ClienteSimples }) => (
    <View
      className={`mb-2 rounded-lg border p-4 shadow-sm ${themeClasses.cardBackground} ${themeClasses.borderLight}`}>
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className={`mb-1 text-base font-medium ${themeClasses.textPrimary}`}>
            {item.nome}
          </Text>
          <Text className={themeClasses.textSecondary}>{formatarTelefone(item.telefone)}</Text>
        </View>

        <TouchableOpacity
          className="ml-3 rounded-full bg-green-50 p-2"
          onPress={() => enviarWhatsApp(item.telefone)}>
          <Ionicons name="logo-whatsapp" size={20} color="#16A34A" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!estabelecimento) {
    return (
      <Container>
        <View className="flex-1 items-center justify-center">
          <Text className={themeClasses.textMuted}>Erro: Estabelecimento não encontrado</Text>
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <FlatList
        data={clientes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <FiltroClientes
            filtros={filtros}
            onFiltrosChange={handleFiltrosChange}
            onLimparFiltros={limparFiltros}
          />
        }
        ListEmptyComponent={!loading ? renderEmpty : null}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 20,
        }}
      />

      {loading && (
        <View className="absolute inset-0 items-center justify-center bg-white bg-opacity-75">
          <Text className="mt-2 text-gray-500">Carregando clientes... </Text>
        </View>
      )}
    </Container>
  );
}
