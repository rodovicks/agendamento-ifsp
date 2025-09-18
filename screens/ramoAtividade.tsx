import React, { useState, useEffect } from 'react';
import { View, Text, Alert, ActivityIndicator } from 'react-native';
import { Container } from '../components/Container';
import { Button } from '../components/Button';
import { SelectRamoAtividade } from '../components/SelectRamoAtividade';
import { RamoAtividade } from '../data/ramosAtividade';
import { useAuthStore } from '../store/authStore';
import { estabelecimentoService } from '../utils/estabelecimento';
import { servicoService } from '../utils/servicos';
import { supabase } from '../utils/supabase';
import { useNavigation } from '@react-navigation/native';

export default function RamoAtividadeScreen() {
  const navigation = useNavigation();
  const { estabelecimento, loadEstabelecimento } = useAuthStore();
  const [ramoSelecionado, setRamoSelecionado] = useState<RamoAtividade | null>(null);
  const [loading, setLoading] = useState(false);
  const [ramoAtualId, setRamoAtualId] = useState<number | null>(null);

  useEffect(() => {
    // Verificar se o estabelecimento já tem um ramo de atividade definido
    if (estabelecimento?.ramo) {
      // Por enquanto, não fazemos match automático pois o ramo é salvo como string livre
      // No futuro, podemos salvar o ID do ramo para fazer o match direto
    }
  }, [estabelecimento]);

  const handleSalvarRamo = async () => {
    if (!ramoSelecionado || !estabelecimento?.id) {
      Alert.alert('Atenção', 'Selecione um ramo de atividade antes de continuar.');
      return;
    }

    setLoading(true);
    try {
      // Verificar se já existem serviços
      const temServicos = await servicoService.verificarServicosExistentes(estabelecimento.id);

      if (temServicos) {
        Alert.alert(
          'Serviços Existentes',
          'Você já possui serviços cadastrados. Deseja substituir todos pelos serviços do novo ramo de atividade?',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Sim, substituir',
              style: 'destructive',
              onPress: () => importarServicosDoRamo(true),
            },
          ]
        );
      } else {
        await importarServicosDoRamo(false);
      }
    } catch (error) {
      console.error('Erro ao verificar serviços:', error);
      Alert.alert('Erro', 'Não foi possível verificar os serviços existentes.');
    } finally {
      setLoading(false);
    }
  };

  const importarServicosDoRamo = async (substituir: boolean = false) => {
    if (!ramoSelecionado || !estabelecimento?.id) return;

    setLoading(true);
    try {
      // Se deve substituir, primeiro limpar todos os serviços existentes
      if (substituir) {
        const { error: deleteError } = await supabase
          .from('servicos')
          .delete()
          .eq('estabelecimento_id', estabelecimento.id);

        if (deleteError) {
          throw deleteError;
        }
      }

      // Atualizar o ramo de atividade do estabelecimento
      await estabelecimentoService.atualizarEstabelecimento({
        ramo: ramoSelecionado.nomeRamoAtividade,
      });

      // Importar todos os serviços do ramo selecionado
      const result = await servicoService.importarServicosDoRamo(
        ramoSelecionado.id,
        estabelecimento.id
      );

      if (result.success) {
        Alert.alert(
          'Sucesso!',
          `Ramo de atividade definido como "${ramoSelecionado.nomeRamoAtividade}" e ${result.count} serviços foram importados.`,
          [
            {
              text: 'Ver Serviços',
              onPress: () => navigation.navigate('Servicos' as never),
            },
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );

        // Recarregar dados do estabelecimento
        await loadEstabelecimento();
        setRamoAtualId(ramoSelecionado.id);
      } else {
        Alert.alert('Erro', result.error || 'Não foi possível importar os serviços.');
      }
    } catch (error: any) {
      console.error('Erro ao salvar ramo e importar serviços:', error);
      Alert.alert('Erro', 'Não foi possível salvar o ramo de atividade.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="flex-1 bg-gray-50">
      <View className="m-6 flex-1">
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900">Ramo de Atividade</Text>
          <Text className="mt-2 text-gray-600">
            Selecione o ramo de atividade principal do seu estabelecimento. Todos os serviços padrão
            desse ramo serão automaticamente adicionados.
          </Text>
        </View>

        {estabelecimento?.ramo && (
          <View className="mb-4 rounded-lg bg-blue-50 p-4">
            <Text className="font-medium text-blue-900">Ramo atual: {estabelecimento.ramo}</Text>
            <Text className="mt-1 text-sm text-blue-600">
              Você pode alterar o ramo de atividade a qualquer momento.
            </Text>
          </View>
        )}

        <View className="mb-6">
          <Text className="mb-3 text-base font-medium text-gray-700">
            Selecione o ramo de atividade:
          </Text>
          <SelectRamoAtividade
            value={ramoSelecionado}
            onValueChange={setRamoSelecionado}
            placeholder="Escolha um ramo de atividade"
          />
        </View>

        {ramoSelecionado && (
          <View className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
            <Text className="mb-2 font-medium text-gray-900">Serviços que serão adicionados:</Text>
            <Text className="mb-3 text-sm text-gray-600">
              {ramoSelecionado.servicos.length} serviços padrão do ramo "
              {ramoSelecionado.nomeRamoAtividade}"
            </Text>

            <View className="space-y-2">
              {ramoSelecionado.servicos.slice(0, 3).map((servico) => (
                <View key={servico.idServico} className="flex-row items-start">
                  <Text className="mr-2 text-gray-400">•</Text>
                  <View className="flex-1">
                    <Text className="font-medium text-gray-900">{servico.nomeServico}</Text>
                    <Text className="text-sm text-gray-600">{servico.descricao}</Text>
                  </View>
                </View>
              ))}
              {ramoSelecionado.servicos.length > 3 && (
                <Text className="text-sm italic text-gray-500">
                  + {ramoSelecionado.servicos.length - 3} outros serviços...
                </Text>
              )}
            </View>
          </View>
        )}

        <Button
          title={loading ? 'Salvando...' : 'Salvar Ramo de Atividade'}
          onPress={handleSalvarRamo}
          disabled={!ramoSelecionado || loading}
          className={`${!ramoSelecionado || loading ? 'bg-gray-300' : 'bg-indigo-600'}`}>
          {loading && <ActivityIndicator size="small" color="white" className="mr-2" />}
        </Button>

        {ramoSelecionado && !loading && (
          <Text className="mt-3 text-center text-sm text-gray-500">
            Após salvar, você poderá adicionar mais serviços personalizados na tela de Serviços.
          </Text>
        )}
      </View>
    </Container>
  );
}
