import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { RAMOS_ATIVIDADE, RamoAtividade, ServicoTemplate } from '../data/ramosAtividade';
import { SelectRamoAtividade } from './SelectRamoAtividade';
import { servicoService } from '../utils/servicos';

interface ImportarServicosProps {
  estabelecimentoId: string;
  ramoAtualNome?: string; // Nome do ramo atual do estabelecimento
  onServicosImportados: () => void; // Callback para atualizar a lista de serviços
  renderAsIcon?: boolean; // Se deve renderizar como ícone
}

export function ImportarServicos({
  estabelecimentoId,
  ramoAtualNome,
  onServicosImportados,
  renderAsIcon = false,
}: ImportarServicosProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [ramoSelecionado, setRamoSelecionado] = useState<RamoAtividade | null>(null);
  const [servicosSelecionados, setServicosSelecionados] = useState<ServicoTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [ramosDisponiveis, setRamosDisponiveis] = useState<RamoAtividade[]>([]);
  const [loadingRamos, setLoadingRamos] = useState(false);

  // Encontrar o ID do ramo atual baseado no nome
  const ramoAtualId = ramoAtualNome
    ? RAMOS_ATIVIDADE.find((r) => r.nomeRamoAtividade === ramoAtualNome)?.id
    : undefined;

  // Carregar ramos filtrados quando a modal abrir
  useEffect(() => {
    if (modalVisible && estabelecimentoId) {
      carregarRamosDisponiveis();
    }
  }, [modalVisible, estabelecimentoId, ramoAtualId]);

  const carregarRamosDisponiveis = async () => {
    setLoadingRamos(true);
    try {
      // Por enquanto, usar uma versão simplificada até corrigir o utils/servicos.ts
      const servicosExistentes = await servicoService.buscarServicos(estabelecimentoId);
      const nomesServicosExistentes = servicosExistentes.map((s: any) =>
        s.nome.toLowerCase().trim()
      );

      const ramosFiltered = RAMOS_ATIVIDADE.filter((ramo) => ramo.id !== ramoAtualId) // Excluir ramo atual
        .map((ramo) => {
          // Filtrar serviços que ainda não foram importados
          const servicosDisponiveis = ramo.servicos.filter(
            (servico) => !nomesServicosExistentes.includes(servico.nomeServico.toLowerCase().trim())
          );

          return {
            ...ramo,
            servicos: servicosDisponiveis,
          };
        })
        .filter((ramo) => ramo.servicos.length > 0); // Remover ramos sem serviços disponíveis

      setRamosDisponiveis(ramosFiltered);
    } catch (error) {
      console.error('Erro ao carregar ramos disponíveis:', error);
      // Fallback para todos os ramos exceto o atual
      setRamosDisponiveis(RAMOS_ATIVIDADE.filter((ramo) => ramo.id !== ramoAtualId));
    } finally {
      setLoadingRamos(false);
    }
  };

  const handleImportarServicos = async () => {
    if (!ramoSelecionado || servicosSelecionados.length === 0) {
      Alert.alert('Atenção', 'Selecione pelo menos um serviço para importar.');
      return;
    }

    setLoading(true);
    try {
      const result = await servicoService.importarServicosEspecificos(
        servicosSelecionados,
        estabelecimentoId
      );

      if (result.success) {
        Alert.alert('Sucesso', `${result.count} serviço(s) importado(s) com sucesso!`, [
          {
            text: 'OK',
            onPress: () => {
              setModalVisible(false);
              setRamoSelecionado(null);
              setServicosSelecionados([]);
              onServicosImportados();
            },
          },
        ]);
      } else {
        Alert.alert('Erro', result.error || 'Erro ao importar serviços');
      }
    } catch (error) {
      console.error('Erro ao importar serviços:', error);
      Alert.alert('Erro', 'Não foi possível importar os serviços');
    } finally {
      setLoading(false);
    }
  };

  const toggleServicoSelecionado = (servico: ServicoTemplate) => {
    const isSelected = servicosSelecionados.some((s) => s.idServico === servico.idServico);

    if (isSelected) {
      setServicosSelecionados((prev) => prev.filter((s) => s.idServico !== servico.idServico));
    } else {
      setServicosSelecionados((prev) => [...prev, servico]);
    }
  };

  const selecionarTodos = () => {
    if (ramoSelecionado) {
      setServicosSelecionados(ramoSelecionado.servicos);
    }
  };

  const deselecionarTodos = () => {
    setServicosSelecionados([]);
  };

  const handleFecharModal = () => {
    setModalVisible(false);
    setRamoSelecionado(null);
    setServicosSelecionados([]);
  };

  const handleAbrirModal = () => {
    console.log('Abrindo modal de importar serviços');
    setModalVisible(true);
  };

  return (
    <>
      <TouchableOpacity
        onPress={handleAbrirModal}
        style={
          renderAsIcon
            ? { padding: 8 }
            : {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#C7D2FE',
                backgroundColor: '#EEF2FF',
                paddingHorizontal: 16,
                paddingVertical: 12,
              }
        }>
        <Feather
          name="download"
          size={renderAsIcon ? 24 : 18}
          color={renderAsIcon ? '#1f2937' : '#4F46E5'}
        />
        {!renderAsIcon && (
          <Text style={{ marginLeft: 8, fontWeight: '500', color: '#4F46E5' }}>
            Importar Serviços
          </Text>
        )}
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleFecharModal}>
        <View style={{ flex: 1, backgroundColor: 'white' }}>
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#E5E7EB',
            }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827' }}>
              Importar Serviços
            </Text>
            <TouchableOpacity onPress={handleFecharModal}>
              <Feather name="x" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1, padding: 16 }}>
            {/* Seleção de Ramo */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  marginBottom: 8,
                  fontSize: 14,
                  fontWeight: '500',
                  color: '#374151',
                }}>
                Selecione o ramo de atividade:
              </Text>
              <SelectRamoAtividade
                value={ramoSelecionado}
                onValueChange={setRamoSelecionado}
                placeholder={loadingRamos ? 'Carregando ramos...' : 'Escolha um ramo de atividade'}
                disabled={loadingRamos}
                customRamos={ramosDisponiveis}
              />
            </View>

            {/* Mensagem quando não há ramos disponíveis */}
            {!loadingRamos && ramosDisponiveis.length === 0 && (
              <View
                style={{
                  padding: 20,
                  alignItems: 'center',
                  backgroundColor: '#F9FAFB',
                  borderRadius: 8,
                  marginBottom: 16,
                }}>
                <Feather
                  name="check-circle"
                  size={48}
                  color="#10B981"
                  style={{ marginBottom: 12 }}
                />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#065F46',
                    textAlign: 'center',
                    marginBottom: 4,
                  }}>
                  Todos os serviços foram importados!
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: '#047857',
                    textAlign: 'center',
                  }}>
                  Não há mais serviços disponíveis para importar de outros ramos de atividade.
                </Text>
              </View>
            )}

            {/* Lista de Serviços */}
            {ramoSelecionado && (
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    marginBottom: 12,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151' }}>
                    Serviços disponíveis ({ramoSelecionado.servicos.length}):
                  </Text>
                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity onPress={selecionarTodos} style={{ marginRight: 8 }}>
                      <Text style={{ fontSize: 14, color: '#4F46E5' }}>Todos</Text>
                    </TouchableOpacity>
                    <Text style={{ color: '#9CA3AF' }}>|</Text>
                    <TouchableOpacity onPress={deselecionarTodos} style={{ marginLeft: 8 }}>
                      <Text style={{ fontSize: 14, color: '#4F46E5' }}>Nenhum</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <FlatList
                  data={ramoSelecionado.servicos}
                  keyExtractor={(item) => item.idServico.toString()}
                  renderItem={({ item }) => {
                    const isSelected = servicosSelecionados.some(
                      (s) => s.idServico === item.idServico
                    );

                    return (
                      <TouchableOpacity
                        onPress={() => toggleServicoSelecionado(item)}
                        style={{
                          marginBottom: 12,
                          padding: 12,
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: isSelected ? '#C7D2FE' : '#E5E7EB',
                          backgroundColor: isSelected ? '#EEF2FF' : 'white',
                        }}>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                          <View
                            style={{
                              marginRight: 12,
                              width: 20,
                              height: 20,
                              borderRadius: 4,
                              borderWidth: 2,
                              borderColor: isSelected ? '#4F46E5' : '#D1D5DB',
                              backgroundColor: isSelected ? '#4F46E5' : 'transparent',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            {isSelected && <Feather name="check" size={12} color="white" />}
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text
                              style={{
                                fontWeight: '500',
                                color: isSelected ? '#312E81' : '#111827',
                              }}>
                              {item.nomeServico}
                            </Text>
                            <Text
                              style={{
                                marginTop: 4,
                                fontSize: 14,
                                color: isSelected ? '#4338CA' : '#6B7280',
                              }}>
                              {item.descricao}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  }}
                  showsVerticalScrollIndicator={false}
                  style={{ flex: 1 }}
                />
              </View>
            )}
          </View>

          {/* Footer com botões */}
          {ramoSelecionado && (
            <View style={{ borderTopWidth: 1, borderTopColor: '#E5E7EB', padding: 16 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Text style={{ fontSize: 14, color: '#6B7280' }}>
                  {servicosSelecionados.length} serviço(s) selecionado(s)
                </Text>
                <TouchableOpacity
                  onPress={handleImportarServicos}
                  disabled={servicosSelecionados.length === 0 || loading}
                  style={{
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    borderRadius: 8,
                    backgroundColor:
                      servicosSelecionados.length === 0 || loading ? '#D1D5DB' : '#4F46E5',
                  }}>
                  {loading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text
                      style={{
                        fontWeight: '500',
                        color: servicosSelecionados.length === 0 || loading ? '#6B7280' : 'white',
                      }}>
                      Importar
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}
