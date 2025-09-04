import { supabase } from './supabase';

export interface Estabelecimento {
  id: string;
  user_id: string;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  ramo: string;
  logo?: string;
  created_at: string;
  updated_at: string;
}

export const estabelecimentoService = {
  // Buscar estabelecimento do usuário logado
  async getEstabelecimento(): Promise<Estabelecimento | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from('estabelecimentos')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      throw error;
    }

    return data;
  },

  // Criar estabelecimento
  async criarEstabelecimento(dados: {
    nome: string;
    email: string;
    telefone: string;
    endereco: string;
    ramo: string;
    logo?: string;
  }): Promise<Estabelecimento> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from('estabelecimentos')
      .insert({
        user_id: user.id,
        ...dados,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  // Atualizar estabelecimento
  async atualizarEstabelecimento(
    dados: Partial<{
      nome: string;
      email: string;
      telefone: string;
      endereco: string;
      ramo: string;
      logo: string;
    }>
  ): Promise<Estabelecimento> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from('estabelecimentos')
      .update(dados)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  // Verificar se estabelecimento existe, se não, criar com dados do metadata do usuário
  async verificarOuCriarEstabelecimento(): Promise<Estabelecimento | null> {
    try {
      const estabelecimento = await this.getEstabelecimento();

      if (estabelecimento) {
        return estabelecimento;
      }

      // Se não existe, tentar criar com dados do metadata
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.user_metadata) {
        const { nome, telefone, endereco, ramo, logo } = user.user_metadata;

        if (nome && telefone && endereco && ramo) {
          return await this.criarEstabelecimento({
            nome,
            email: user.email!,
            telefone,
            endereco,
            ramo,
            logo,
          });
        }
      }

      return null;
    } catch (error) {
      console.error('Erro ao verificar/criar estabelecimento:', error);
      return null;
    }
  },
};
