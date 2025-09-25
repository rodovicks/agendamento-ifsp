import { supabase } from '../../utils/supabase';

export interface ConfiguracaoEstabelecimento {
  id: string;
  estabelecimento_id: string;
  template_mensagem: string | null;
}

export class TemplateService {
  static async carregarTemplate(estabelecimentoId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('configuracoes_estabelecimento')
        .select('template_mensagem')
        .eq('estabelecimento_id', estabelecimentoId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar template:', error);
        throw error;
      }

      return data?.template_mensagem || null;
    } catch (error) {
      console.error('Erro:', error);
      throw error;
    }
  }

  static async salvarTemplate(estabelecimentoId: string, template: string): Promise<void> {
    try {
      // Tentar atualizar primeiro
      const { data: existingData } = await supabase
        .from('configuracoes_estabelecimento')
        .select('id')
        .eq('estabelecimento_id', estabelecimentoId)
        .single();

      if (existingData) {
        // Atualizar registro existente
        const { error } = await supabase
          .from('configuracoes_estabelecimento')
          .update({ template_mensagem: template })
          .eq('estabelecimento_id', estabelecimentoId);

        if (error) throw error;
      } else {
        // Criar novo registro
        const { error } = await supabase.from('configuracoes_estabelecimento').insert({
          estabelecimento_id: estabelecimentoId,
          template_mensagem: template,
        });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      throw error;
    }
  }
}
