import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeClasses } from '../../utils/theme';

const VARIAVEIS = [
  { key: '{NOME_CLIENTE}', descricao: 'Nome do cliente' },
  { key: '{TELEFONE_CLIENTE}', descricao: 'Telefone do cliente' },
  { key: '{DATA_AGENDAMENTO}', descricao: 'Data do agendamento' },
  { key: '{HORARIO_AGENDAMENTO}', descricao: 'Horário do agendamento' },
  { key: '{NOME_SERVICO}', descricao: 'Nome do serviço' },
  { key: '{NOME_COLABORADOR}', descricao: 'Nome do colaborador' },
  { key: '{NOME_ESTABELECIMENTO}', descricao: 'Nome do estabelecimento' },
];

export function VariaveisDisponiveis() {
  const { isDark } = useTheme();
  const themeClasses = getThemeClasses(isDark);

  return (
    <View className={`mb-6 rounded-lg p-4 shadow-sm ${themeClasses.cardBackground}`}>
      <Text className={`mb-3 text-base font-medium ${themeClasses.textSecondary}`}>
        Variáveis Disponíveis:
      </Text>
      <View className="space-y-1">
        {VARIAVEIS.map((variavel, index) => (
          <Text key={index} className={`text-sm ${themeClasses.textSecondary}`}>
            • {variavel.key} - {variavel.descricao}
          </Text>
        ))}
      </View>
    </View>
  );
}
