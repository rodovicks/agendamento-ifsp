import React from 'react';
import { View, Text, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ClienteAtendido } from '../../services/clientesService';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeClasses } from '../../utils/theme';

interface ItemClienteProps {
  cliente: ClienteAtendido;
  onPress?: (cliente: ClienteAtendido) => void;
}

export const ItemCliente: React.FC<ItemClienteProps> = ({ cliente, onPress }) => {
  const { isDark } = useTheme();
  const themeClasses = getThemeClasses(isDark);

  const formatarTelefone = (telefone: string) => {
    // Remove caracteres não numéricos
    const apenasNumeros = telefone.replace(/\D/g, '');

    // Formatar como (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
    if (apenasNumeros.length === 11) {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 7)}-${apenasNumeros.slice(7)}`;
    } else if (apenasNumeros.length === 10) {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 6)}-${apenasNumeros.slice(6)}`;
    }
    return telefone;
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const ligarParaCliente = () => {
    const telefoneFormatado = cliente.telefone.replace(/\D/g, '');
    const url = `tel:${telefoneFormatado}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Erro', 'Não foi possível abrir o aplicativo de telefone.');
        }
      })
      .catch(() => {
        Alert.alert('Erro', 'Não foi possível realizar a ligação.');
      });
  };

  const enviarWhatsApp = () => {
    const telefoneFormatado = cliente.telefone.replace(/\D/g, '');
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

  return (
    <TouchableOpacity
      className={`mb-3 rounded-lg border p-4 shadow-sm ${themeClasses.cardBackground} ${themeClasses.borderLight}`}
      onPress={() => onPress?.(cliente)}
      activeOpacity={0.7}>
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          {/* Nome do cliente */}
          <Text className={`mb-1 text-lg font-semibold ${themeClasses.textPrimary}`}>
            {cliente.nome}
          </Text>

          {/* Telefone */}
          <View className="mb-2 flex-row items-center">
            <Ionicons name="call" size={16} color={isDark ? '#94A3B8' : '#6B7280'} />
            <Text className={`ml-2 ${themeClasses.textSecondary}`}>
              {formatarTelefone(cliente.telefone)}
            </Text>
          </View>

          {/* Email (se disponível) */}
          {cliente.email && (
            <View className="mb-2 flex-row items-center">
              <Ionicons name="mail" size={16} color={isDark ? '#94A3B8' : '#6B7280'} />
              <Text className={`ml-2 ${themeClasses.textSecondary}`} numberOfLines={1}>
                {cliente.email}
              </Text>
            </View>
          )}

          {/* Informações de atendimento */}
          <View className="mt-2 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="calendar" size={16} color={isDark ? '#94A3B8' : '#6B7280'} />
              <Text className={`ml-2 text-sm ${themeClasses.textMuted}`}>
                Último: {formatarData(cliente.ultimoAtendimento)}
              </Text>
            </View>

            <View className="flex-row items-center">
              <Ionicons name="repeat" size={16} color={isDark ? '#94A3B8' : '#6B7280'} />
              <Text className={`ml-1 text-sm ${themeClasses.textMuted}`}>
                {cliente.totalAtendimentos}{' '}
                {cliente.totalAtendimentos === 1 ? 'atendimento' : 'atendimentos'}
              </Text>
            </View>
          </View>
        </View>

        {/* Botões de ação */}
        <View className="ml-3 flex-row space-x-2">
          <TouchableOpacity className="rounded-full bg-green-50 p-2" onPress={enviarWhatsApp}>
            <Ionicons name="logo-whatsapp" size={20} color="#16A34A" />
          </TouchableOpacity>

          <TouchableOpacity className="rounded-full bg-blue-50 p-2" onPress={ligarParaCliente}>
            <Ionicons name="call" size={20} color="#2563EB" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Indicador de cliente frequente */}
      {cliente.totalAtendimentos >= 5 && (
        <View className={`mt-3 flex-row items-center border-t pt-3 ${themeClasses.borderLight}`}>
          <View className="flex-row items-center rounded-full bg-yellow-100 px-2 py-1">
            <Ionicons name="star" size={14} color="#D97706" />
            <Text className="ml-1 text-xs font-medium text-yellow-700">Cliente Frequente</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};
