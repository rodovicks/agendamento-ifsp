import { supabase } from './supabase';
import { RAMOS_ATIVIDADE, RamoAtividade, ServicoTemplate } from '../data/ramosAtividade';

export interface ServicoImportado {
  nome: string;
  descricao: string;
  estabelecimento_id: string;
}

export const servicoService = {
  // Importar todos os serviços de um ramo de atividade
  async importarServicosDoRamo(
    ramoId: number,
    estabelecimentoId: string
  ): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      const ramo = RAMOS_ATIVIDADE.find((r) => r.id === ramoId);

      if (!ramo) {
        return { success: false, count: 0, error: 'Ramo de atividade não encontrado' };
      }

      // Converter serviços template para o formato do banco
      const servicosParaImportar: ServicoImportado[] = ramo.servicos.map((servico) => ({
        nome: servico.nomeServico,
        descricao: servico.descricao,
        estabelecimento_id: estabelecimentoId,
      }));

      // Inserir todos os serviços de uma vez
      const { data, error } = await supabase.from('servicos').insert(servicosParaImportar).select();

      if (error) {
        throw error;
      }

      return {
        success: true,
        count: data?.length || 0,
      };
    } catch (error: any) {
      console.error('Erro ao importar serviços:', error);
      return {
        success: false,
        count: 0,
        error: error.message || 'Erro desconhecido',
      };
    }
  },

  // Importar serviços específicos selecionados pelo usuário
  async importarServicosEspecificos(
    servicosTemplate: ServicoTemplate[],
    estabelecimentoId: string
  ): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      // Converter serviços template para o formato do banco
      const servicosParaImportar: ServicoImportado[] = servicosTemplate.map((servico) => ({
        nome: servico.nomeServico,
        descricao: servico.descricao,
        estabelecimento_id: estabelecimentoId,
      }));

      // Inserir os serviços selecionados
      const { data, error } = await supabase.from('servicos').insert(servicosParaImportar).select();

      if (error) {
        throw error;
      }

      return {
        success: true,
        count: data?.length || 0,
      };
    } catch (error: any) {
      console.error('Erro ao importar serviços específicos:', error);
      return {
        success: false,
        count: 0,
        error: error.message || 'Erro desconhecido',
      };
    }
  },

  // Verificar se já existem serviços para o estabelecimento
  async verificarServicosExistentes(estabelecimentoId: string): Promise<boolean> {
    try {
      const { count, error } = await supabase
        .from('servicos')
        .select('id', { count: 'exact', head: true })
        .eq('estabelecimento_id', estabelecimentoId);

      if (error) {
        throw error;
      }

      return (count || 0) > 0;
    } catch (error) {
      console.error('Erro ao verificar serviços existentes:', error);
      return false;
    }
  },

  // Buscar todos os serviços do estabelecimento
  async buscarServicos(estabelecimentoId: string) {
    try {
      const { data, error } = await supabase
        .from('servicos')
        .select('id, nome, descricao')
        .eq('estabelecimento_id', estabelecimentoId)
        .order('nome');

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      return [];
    }
  },

  // Filtrar ramos e serviços removendo os já importados
  async filtrarRamosEServicosDisponiveis(estabelecimentoId: string, ramoAtualId?: number) {
    try {
      const servicosExistentes = await this.buscarServicos(estabelecimentoId);
      const nomesServicosExistentes = servicosExistentes.map((s: any) =>
        s.nome.toLowerCase().trim()
      );

      const ramosDisponiveis = RAMOS_ATIVIDADE.filter(
        (ramo: RamoAtividade) => ramo.id !== ramoAtualId
      ) // Excluir ramo atual
        .map((ramo: RamoAtividade) => {
          // Filtrar serviços que ainda não foram importados
          const servicosDisponiveis = ramo.servicos.filter(
            (servico: ServicoTemplate) =>
              !nomesServicosExistentes.includes(servico.nomeServico.toLowerCase().trim())
          );

          return {
            ...ramo,
            servicos: servicosDisponiveis,
          };
        })
        .filter((ramo: any) => ramo.servicos.length > 0); // Remover ramos sem serviços disponíveis

      return ramosDisponiveis;
    } catch (error) {
      console.error('Erro ao filtrar ramos e serviços:', error);
      return RAMOS_ATIVIDADE.filter((ramo: RamoAtividade) => ramo.id !== ramoAtualId);
    }
  },
};
