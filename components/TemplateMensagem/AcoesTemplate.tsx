import React from 'react';
import { View } from 'react-native';
import { Button } from '../Button';

interface AcoesTemplateProps {
  loading: boolean;
  onSalvar: () => void;
  onRestaurarPadrao: () => void;
}

export function AcoesTemplate({ loading, onSalvar, onRestaurarPadrao }: AcoesTemplateProps) {
  return (
    <View className="space-y-8">
      <Button
        title={loading ? 'Salvando...' : 'Salvar Template'}
        onPress={onSalvar}
        disabled={loading}
        className="mt-8"
      />

      <Button
        title="Restaurar Template Padrão"
        onPress={onRestaurarPadrao}
        className="mt-8 bg-gray-500"
      />
    </View>
  );
}
