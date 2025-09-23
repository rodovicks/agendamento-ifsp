import { supabase } from './supabase';

// Tipos/Interfaces
export interface Atendimento {
  id: string;
  estabelecimento_id: string;
  agendamento_id?: string;
  cliente_nome: string;
  cliente_telefone?: string;
  cliente_email?: string;
  data_atendimento: string;
  hora_inicio: string;
  hora_fim?: string;
  status: 'agendado' | 'em_andamento' | 'finalizado' | 'cancelado';
  observacoes?: string;
  valor_total: number;
  origem: 'agendamento' | 'direto';
  created_at: string;
  updated_at: string;
}

export interface AtendimentoServico {
  id: string;
  atendimento_id: string;
  servico_id: string;
  preco: number;
  created_at: string;
}

export interface AtendimentoColaborador {
  id: string;
  atendimento_id: string;
  colaborador_id: number;
  created_at: string;
}

export interface AtendimentoCompleto extends Atendimento {
  servicos: Array<{
    id: string;
    servico_id: string;
    preco: number;
    servico: {
      id: string;
      nome: string;
      descricao?: string;
      preco?: number;
      duracao?: number;
    };
  }>;
  colaboradores: Array<{
    id: string;
    colaborador_id: number;
    colaborador: {
      id: number;
      nome: string;
      foto_url?: string;
    };
  }>;
}

export interface Agendamento {
  id: string;
  estabelecimento_id: string;
  cliente_nome: string;
  cliente_telefone?: string;
  cliente_email?: string;
  data_agendamento: string;
  hora_inicio: string;
  hora_fim: string;
  servico_id?: string;
  colaborador_id?: number;
  observacoes?: string;
  status: string;
}

export const atendimentosService = {
  // Buscar atendimentos do estabelecimento por data
  async buscarAtendimentosPorData(
    estabelecimentoId: string,
    data: string
  ): Promise<AtendimentoCompleto[]> {
    const { data: atendimentos, error } = await supabase
      .from('atendimentos')
      .select(
        `
        *,
        atendimentos_servicos (
          id,
          servico_id,
          preco,
          servicos (
            id,
            nome,
            descricao,
            preco,
            duracao
          )
        ),
        atendimentos_colaboradores (
          id,
          colaborador_id,
          colaboradores (
            id,
            nome,
            foto_url
          )
        )
      `
      )
      .eq('estabelecimento_id', estabelecimentoId)
      .eq('data_atendimento', data)
      .order('hora_inicio');

    if (error) {
      throw error;
    }

    return atendimentos.map((atendimento: any) => ({
      ...atendimento,
      servicos:
        atendimento.atendimentos_servicos?.map((as: any) => ({
          id: as.id,
          servico_id: as.servico_id,
          preco: as.preco,
          servico: as.servicos,
        })) || [],
      colaboradores:
        atendimento.atendimentos_colaboradores?.map((ac: any) => ({
          id: ac.id,
          colaborador_id: ac.colaborador_id,
          colaborador: ac.colaboradores,
        })) || [],
    }));
  },

  // Buscar atendimento por ID com todos os relacionamentos
  async buscarAtendimentoPorId(id: string): Promise<AtendimentoCompleto | null> {
    const { data: atendimento, error } = await supabase
      .from('atendimentos')
      .select(
        `
        *,
        atendimentos_servicos (
          id,
          servico_id,
          preco,
          servicos (
            id,
            nome,
            descricao,
            preco,
            duracao
          )
        ),
        atendimentos_colaboradores (
          id,
          colaborador_id,
          colaboradores (
            id,
            nome,
            foto_url
          )
        )
      `
      )
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return {
      ...atendimento,
      servicos:
        atendimento.atendimentos_servicos?.map((as: any) => ({
          id: as.id,
          servico_id: as.servico_id,
          preco: as.preco,
          servico: as.servicos,
        })) || [],
      colaboradores:
        atendimento.atendimentos_colaboradores?.map((ac: any) => ({
          id: ac.id,
          colaborador_id: ac.colaborador_id,
          colaborador: ac.colaboradores,
        })) || [],
    };
  },

  // Converter agendamento em atendimento
  async criarAtendimentoDeAgendamento(
    agendamento: Agendamento,
    servicosIds: string[],
    colaboradoresIds: number[],
    observacoes?: string
  ): Promise<string> {
    try {
      // 1. Criar o atendimento principal
      const { data: atendimento, error: atendimentoError } = await supabase
        .from('atendimentos')
        .insert({
          estabelecimento_id: agendamento.estabelecimento_id,
          agendamento_id: agendamento.id,
          cliente_nome: agendamento.cliente_nome,
          cliente_telefone: agendamento.cliente_telefone,
          cliente_email: agendamento.cliente_email,
          data_atendimento: agendamento.data_agendamento,
          hora_inicio: agendamento.hora_inicio,
          status: 'em_andamento',
          observacoes: observacoes || agendamento.observacoes,
          origem: 'agendamento',
        })
        .select('id')
        .single();

      if (atendimentoError) {
        throw atendimentoError;
      }

      const atendimentoId = atendimento.id;

      // 2. Buscar preços dos serviços
      const { data: servicos, error: servicosError } = await supabase
        .from('servicos')
        .select('id, preco')
        .in('id', servicosIds);

      if (servicosError) {
        throw servicosError;
      }

      // 3. Adicionar serviços ao atendimento
      if (servicosIds.length > 0) {
        const servicosData = servicosIds.map((servicoId) => {
          const servico = servicos?.find((s) => s.id === servicoId);
          return {
            atendimento_id: atendimentoId,
            servico_id: servicoId,
            preco: servico?.preco || 0,
          };
        });

        const { error: servicosInsertError } = await supabase
          .from('atendimentos_servicos')
          .insert(servicosData);

        if (servicosInsertError) {
          throw servicosInsertError;
        }
      }

      // 4. Adicionar colaboradores ao atendimento
      if (colaboradoresIds.length > 0) {
        const colaboradoresData = colaboradoresIds.map((colaboradorId) => ({
          atendimento_id: atendimentoId,
          colaborador_id: colaboradorId,
        }));

        const { error: colaboradoresInsertError } = await supabase
          .from('atendimentos_colaboradores')
          .insert(colaboradoresData);

        if (colaboradoresInsertError) {
          throw colaboradoresInsertError;
        }
      }

      // 5. Atualizar status do agendamento
      const { error: agendamentoUpdateError } = await supabase
        .from('agendamentos')
        .update({ status: 'em_andamento' })
        .eq('id', agendamento.id);

      if (agendamentoUpdateError) {
        throw agendamentoUpdateError;
      }

      return atendimentoId;
    } catch (error) {
      console.error('Erro ao criar atendimento de agendamento:', error);
      throw error;
    }
  },

  // Criar atendimento direto (sem agendamento prévio)
  async criarAtendimentoDireto(dados: {
    estabelecimento_id: string;
    cliente_nome: string;
    cliente_telefone?: string;
    cliente_email?: string;
    data_atendimento: string;
    hora_inicio: string;
    servicosIds: string[];
    colaboradoresIds: number[];
    observacoes?: string;
  }): Promise<string> {
    try {
      // 1. Criar o atendimento principal
      const { data: atendimento, error: atendimentoError } = await supabase
        .from('atendimentos')
        .insert({
          estabelecimento_id: dados.estabelecimento_id,
          cliente_nome: dados.cliente_nome,
          cliente_telefone: dados.cliente_telefone,
          cliente_email: dados.cliente_email,
          data_atendimento: dados.data_atendimento,
          hora_inicio: dados.hora_inicio,
          status: 'em_andamento',
          observacoes: dados.observacoes,
          origem: 'direto',
        })
        .select('id')
        .single();

      if (atendimentoError) {
        throw atendimentoError;
      }

      const atendimentoId = atendimento.id;

      // 2. Buscar preços dos serviços
      const { data: servicos, error: servicosError } = await supabase
        .from('servicos')
        .select('id, preco')
        .in('id', dados.servicosIds);

      if (servicosError) {
        throw servicosError;
      }

      // 3. Adicionar serviços ao atendimento
      if (dados.servicosIds.length > 0) {
        const servicosData = dados.servicosIds.map((servicoId) => {
          const servico = servicos?.find((s) => s.id === servicoId);
          return {
            atendimento_id: atendimentoId,
            servico_id: servicoId,
            preco: servico?.preco || 0,
          };
        });

        const { error: servicosInsertError } = await supabase
          .from('atendimentos_servicos')
          .insert(servicosData);

        if (servicosInsertError) {
          throw servicosInsertError;
        }
      }

      // 4. Adicionar colaboradores ao atendimento
      if (dados.colaboradoresIds.length > 0) {
        const colaboradoresData = dados.colaboradoresIds.map((colaboradorId) => ({
          atendimento_id: atendimentoId,
          colaborador_id: colaboradorId,
        }));

        const { error: colaboradoresInsertError } = await supabase
          .from('atendimentos_colaboradores')
          .insert(colaboradoresData);

        if (colaboradoresInsertError) {
          throw colaboradoresInsertError;
        }
      }

      return atendimentoId;
    } catch (error) {
      console.error('Erro ao criar atendimento direto:', error);
      throw error;
    }
  },

  // Atualizar serviços do atendimento
  async atualizarServicos(atendimentoId: string, servicosIds: string[]): Promise<void> {
    try {
      // 1. Remover serviços existentes
      const { error: deleteError } = await supabase
        .from('atendimentos_servicos')
        .delete()
        .eq('atendimento_id', atendimentoId);

      if (deleteError) {
        throw deleteError;
      }

      // 2. Buscar preços dos novos serviços
      const { data: servicos, error: servicosError } = await supabase
        .from('servicos')
        .select('id, preco')
        .in('id', servicosIds);

      if (servicosError) {
        throw servicosError;
      }

      // 3. Adicionar novos serviços
      if (servicosIds.length > 0) {
        const servicosData = servicosIds.map((servicoId) => {
          const servico = servicos?.find((s) => s.id === servicoId);
          return {
            atendimento_id: atendimentoId,
            servico_id: servicoId,
            preco: servico?.preco || 0,
          };
        });

        const { error: insertError } = await supabase
          .from('atendimentos_servicos')
          .insert(servicosData);

        if (insertError) {
          throw insertError;
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar serviços do atendimento:', error);
      throw error;
    }
  },

  // Atualizar colaboradores do atendimento
  async atualizarColaboradores(atendimentoId: string, colaboradoresIds: number[]): Promise<void> {
    try {
      // 1. Remover colaboradores existentes
      const { error: deleteError } = await supabase
        .from('atendimentos_colaboradores')
        .delete()
        .eq('atendimento_id', atendimentoId);

      if (deleteError) {
        throw deleteError;
      }

      // 2. Adicionar novos colaboradores
      if (colaboradoresIds.length > 0) {
        const colaboradoresData = colaboradoresIds.map((colaboradorId) => ({
          atendimento_id: atendimentoId,
          colaborador_id: colaboradorId,
        }));

        const { error: insertError } = await supabase
          .from('atendimentos_colaboradores')
          .insert(colaboradoresData);

        if (insertError) {
          throw insertError;
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar colaboradores do atendimento:', error);
      throw error;
    }
  },

  // Finalizar atendimento
  async finalizarAtendimento(
    atendimentoId: string,
    horaFim: string,
    observacoes?: string
  ): Promise<void> {
    // Validar se há pelo menos um serviço
    const { data: servicos } = await supabase
      .from('atendimentos_servicos')
      .select('id')
      .eq('atendimento_id', atendimentoId);

    if (!servicos || servicos.length === 0) {
      throw new Error('Atendimento deve ter pelo menos um serviço para ser finalizado.');
    }

    const { error } = await supabase
      .from('atendimentos')
      .update({
        status: 'finalizado',
        hora_fim: horaFim,
        observacoes: observacoes,
      })
      .eq('id', atendimentoId);

    if (error) {
      throw error;
    }

    // Se o atendimento foi criado a partir de um agendamento, atualizar o status do agendamento
    const { data: atendimento } = await supabase
      .from('atendimentos')
      .select('agendamento_id')
      .eq('id', atendimentoId)
      .single();

    if (atendimento?.agendamento_id) {
      await supabase
        .from('agendamentos')
        .update({ status: 'concluido' })
        .eq('id', atendimento.agendamento_id);
    }
  },

  // Cancelar atendimento
  async cancelarAtendimento(atendimentoId: string, motivo?: string): Promise<void> {
    const { error } = await supabase
      .from('atendimentos')
      .update({
        status: 'cancelado',
        observacoes: motivo,
      })
      .eq('id', atendimentoId);

    if (error) {
      throw error;
    }

    // Se o atendimento foi criado a partir de um agendamento, voltar o status do agendamento
    const { data: atendimento } = await supabase
      .from('atendimentos')
      .select('agendamento_id')
      .eq('id', atendimentoId)
      .single();

    if (atendimento?.agendamento_id) {
      await supabase
        .from('agendamentos')
        .update({ status: 'agendado' })
        .eq('id', atendimento.agendamento_id);
    }
  },

  // Verificar se agendamento já foi convertido em atendimento
  async verificarAgendamentoConvertido(agendamentoId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('atendimentos')
      .select('id')
      .eq('agendamento_id', agendamentoId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return !!data;
  },

  // Buscar colaboradores com preferência para um serviço
  async buscarColaboradoresComPreferencia(
    estabelecimentoId: string,
    servicoId?: string
  ): Promise<
    Array<{
      id: number;
      nome: string;
      foto_url?: string;
      temPreferencia: boolean;
    }>
  > {
    let query = supabase
      .from('colaboradores')
      .select(
        `
        id,
        nome,
        foto_url,
        colaboradores_servicos (
          servico_id
        )
      `
      )
      .eq('estabelecimento_id', estabelecimentoId);

    const { data: colaboradores, error } = await query;

    if (error) {
      throw error;
    }

    // Mapear colaboradores e verificar preferência
    return colaboradores
      .map((colaborador: any) => ({
        id: colaborador.id,
        nome: colaborador.nome,
        foto_url: colaborador.foto_url,
        temPreferencia: servicoId
          ? colaborador.colaboradores_servicos?.some((cs: any) => cs.servico_id === servicoId) ||
            false
          : false,
      }))
      .sort((a, b) => {
        // Colaboradores com preferência primeiro
        if (a.temPreferencia && !b.temPreferencia) return -1;
        if (!a.temPreferencia && b.temPreferencia) return 1;
        return a.nome.localeCompare(b.nome);
      });
  },

  // Excluir agendamento com validação
  async excluirAgendamento(agendamentoId: string): Promise<void> {
    // Verificar se o agendamento já foi convertido em atendimento
    const jaConvertido = await this.verificarAgendamentoConvertido(agendamentoId);

    if (jaConvertido) {
      throw new Error('Este agendamento já foi convertido em atendimento e não pode ser excluído.');
    }

    // Excluir o agendamento
    const { error } = await supabase.from('agendamentos').delete().eq('id', agendamentoId);

    if (error) {
      throw error;
    }
  },
};
