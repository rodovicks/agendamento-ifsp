import { supabase } from '../../utils/supabase';
import { Alert, Share, Clipboard } from 'react-native';
import { TemplateService } from '../TemplateMensagem';
import { type Agendamento } from './ItemAgendamento';

export class AgendamentosService {
  static async buscarServicos(estabelecimentoId: string): Promise<Record<number, string>> {
    try {
      const { data, error } = await supabase
        .from('servicos')
        .select('id, nome')
        .eq('estabelecimento_id', estabelecimentoId);

      if (error) {
        console.error('Erro ao buscar serviços:', error);
        return {};
      }

      return (
        data?.reduce(
          (acc, servico) => {
            acc[servico.id] = servico.nome;
            return acc;
          },
          {} as Record<number, string>
        ) || {}
      );
    } catch (error) {
      console.error('Erro:', error);
      return {};
    }
  }

  static async buscarAgendamentos(
    estabelecimentoId: string,
    dataSelecionada: Date
  ): Promise<Agendamento[]> {
    try {
      const dataFormatada = dataSelecionada.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('agendamentos')
        .select(
          `
          id,
          cliente_nome,
          cliente_telefone,
          cliente_email,
          data_agendamento,
          hora_inicio,
          hora_fim,
          status,
          servico_id,
          colaborador_id,
          observacoes,
          servicos (nome),
          colaboradores (nome)
        `
        )
        .eq('estabelecimento_id', estabelecimentoId)
        .eq('data_agendamento', dataFormatada)
        .order('hora_inicio', { ascending: true });

      if (error) {
        console.error('Erro ao buscar agendamentos:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro:', error);
      return [];
    }
  }

  static async atualizarStatusAgendamento(
    agendamentoId: string,
    novoStatus: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('agendamentos')
        .update({ status: novoStatus })
        .eq('id', agendamentoId);

      if (error) {
        console.error(`Erro ao atualizar status para ${novoStatus}:`, error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro:', error);
      return false;
    }
  }

  static async excluirAgendamento(agendamentoId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('agendamentos').delete().eq('id', agendamentoId);

      if (error) {
        console.error('Erro ao excluir agendamento:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro:', error);
      return false;
    }
  }

  static async gerarTextoAgendamento(
    agendamento: Agendamento,
    estabelecimentoId: string,
    nomeEstabelecimento: string,
    servicosLookup: Record<number, string>
  ): Promise<string> {
    const formatarData = (dataStr: string) => {
      const data = new Date(dataStr + 'T00:00:00');
      return data.toLocaleDateString('pt-BR');
    };

    const dataFormatada = formatarData(agendamento.data_agendamento);
    const servicoNome =
      agendamento.servicos && agendamento.servicos.length > 0
        ? agendamento.servicos[0].nome
        : servicosLookup[agendamento.servico_id || 0] || 'Serviço não especificado';

    const colaboradorNome =
      agendamento.colaboradores && agendamento.colaboradores.length > 0
        ? agendamento.colaboradores[0].nome
        : 'Não especificado';

    // Template padrão caso não tenha personalizado
    const templatePadrao = `🗓️ *Confirmação de Agendamento*

👤 *Cliente:* {NOME_CLIENTE}
📞 *Telefone:* {TELEFONE_CLIENTE}
📅 *Data:* {DATA_AGENDAMENTO}
⏰ *Horário:* {HORARIO_AGENDAMENTO}
✂️ *Serviço:* {NOME_SERVICO}
👨‍💼 *Profissional:* {NOME_COLABORADOR}
🏢 *Local:* {NOME_ESTABELECIMENTO}

---
Agendamento confirmado! Em caso de dúvidas ou necessidade de reagendamento, entre em contato conosco.

Até breve! 😊`;

    try {
      // Tentar carregar template personalizado
      const templatePersonalizado = await TemplateService.carregarTemplate(estabelecimentoId);
      const template = templatePersonalizado || templatePadrao;

      // Substituir as variáveis no template
      return template
        .replace(/{NOME_CLIENTE}/g, agendamento.cliente_nome)
        .replace(/{TELEFONE_CLIENTE}/g, agendamento.cliente_telefone)
        .replace(/{DATA_AGENDAMENTO}/g, dataFormatada)
        .replace(/{HORARIO_AGENDAMENTO}/g, agendamento.hora_inicio.slice(0, 5))
        .replace(/{NOME_SERVICO}/g, servicoNome)
        .replace(/{NOME_COLABORADOR}/g, colaboradorNome)
        .replace(/{NOME_ESTABELECIMENTO}/g, nomeEstabelecimento);
    } catch (error) {
      console.error('Erro ao gerar texto:', error);
      return templatePadrao;
    }
  }

  static async copiarTextoAgendamento(texto: string): Promise<void> {
    try {
      await Clipboard.setString(texto);
      Alert.alert(
        'Texto Copiado!',
        'Os dados do agendamento foram copiados para a área de transferência.',
        [
          { text: 'OK' },
          {
            text: 'Compartilhar',
            onPress: () => this.compartilharTexto(texto),
          },
        ]
      );
    } catch (error) {
      console.error('Erro ao copiar texto:', error);
      Alert.alert('Erro', 'Não foi possível copiar o texto.');
    }
  }

  static async compartilharTexto(texto: string): Promise<void> {
    try {
      await Share.share({
        message: texto,
        title: 'Detalhes do Agendamento',
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      Alert.alert('Erro', 'Não foi possível compartilhar o texto.');
    }
  }
}
