import { supabase } from '../utils/supabase';

export interface ClienteAtendido {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  ultimoAtendimento: string;
  totalAtendimentos: number;
}

export interface FiltroClientes {
  nomeCliente?: string;
  dataInicio?: string;
  dataFim?: string;
  mes?: number;
  ano?: number;
}

export class ClientesService {
  /**
   * Busca todos os clientes que já foram atendidos
   */
  static async buscarClientesAtendidos(
    estabelecimentoId: string,
    filtros: FiltroClientes = {}
  ): Promise<ClienteAtendido[]> {
    try {
      let query = supabase
        .from('agendamentos')
        .select('cliente_nome, cliente_telefone, cliente_email, data_agendamento')
        .eq('estabelecimento_id', estabelecimentoId)
        .in('status', ['concluido', 'confirmado']); // Apenas agendamentos concluídos ou confirmados

      // Aplicar filtros de data
      if (filtros.dataInicio && filtros.dataFim) {
        query = query
          .gte('data_agendamento', filtros.dataInicio)
          .lte('data_agendamento', filtros.dataFim);
      } else if (filtros.mes && filtros.ano) {
        const inicioMes = new Date(filtros.ano, filtros.mes - 1, 1);
        const fimMes = new Date(filtros.ano, filtros.mes, 0);

        query = query
          .gte('data_agendamento', inicioMes.toISOString().split('T')[0])
          .lte('data_agendamento', fimMes.toISOString().split('T')[0]);
      } else if (filtros.ano) {
        const inicioAno = new Date(filtros.ano, 0, 1);
        const fimAno = new Date(filtros.ano, 11, 31);

        query = query
          .gte('data_agendamento', inicioAno.toISOString().split('T')[0])
          .lte('data_agendamento', fimAno.toISOString().split('T')[0]);
      }

      // Filtro por nome do cliente
      if (filtros.nomeCliente) {
        query = query.ilike('cliente_nome', `%${filtros.nomeCliente}%`);
      }

      const { data, error } = await query.order('data_agendamento', { ascending: false });

      if (error) {
        console.error('Erro ao buscar clientes atendidos:', error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Agrupar por cliente e calcular estatísticas
      const clientesMap = new Map<string, ClienteAtendido>();

      data.forEach((agendamento) => {
        const chaveCliente = `${agendamento.cliente_nome}-${agendamento.cliente_telefone}`;

        if (clientesMap.has(chaveCliente)) {
          const cliente = clientesMap.get(chaveCliente)!;
          cliente.totalAtendimentos += 1;

          // Atualizar último atendimento se for mais recente
          if (agendamento.data_agendamento > cliente.ultimoAtendimento) {
            cliente.ultimoAtendimento = agendamento.data_agendamento;
          }
        } else {
          clientesMap.set(chaveCliente, {
            id: chaveCliente,
            nome: agendamento.cliente_nome,
            telefone: agendamento.cliente_telefone,
            email: agendamento.cliente_email,
            ultimoAtendimento: agendamento.data_agendamento,
            totalAtendimentos: 1,
          });
        }
      });

      // Converter Map para array e ordenar alfabeticamente
      const clientesArray = Array.from(clientesMap.values());
      clientesArray.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

      return clientesArray;
    } catch (error) {
      console.error('Erro ao buscar clientes atendidos:', error);
      return [];
    }
  }

  /**
   * Busca estatísticas gerais dos clientes
   */
  static async buscarEstatisticasClientes(estabelecimentoId: string): Promise<{
    totalClientes: number;
    clientesUltimoMes: number;
    totalAtendimentos: number;
  }> {
    try {
      // Total de clientes únicos
      const { data: clientesData, error: clientesError } = await supabase
        .from('agendamentos')
        .select('cliente_nome, cliente_telefone')
        .eq('estabelecimento_id', estabelecimentoId)
        .in('status', ['concluido', 'confirmado']);

      if (clientesError) {
        console.error('Erro ao buscar estatísticas de clientes:', clientesError);
        return { totalClientes: 0, clientesUltimoMes: 0, totalAtendimentos: 0 };
      }

      const clientesUnicos = new Set();
      clientesData?.forEach((cliente) => {
        clientesUnicos.add(`${cliente.cliente_nome}-${cliente.cliente_telefone}`);
      });

      // Clientes do último mês
      const umMesAtras = new Date();
      umMesAtras.setMonth(umMesAtras.getMonth() - 1);

      const { data: clientesUltimoMesData, error: clientesUltimoMesError } = await supabase
        .from('agendamentos')
        .select('cliente_nome, cliente_telefone')
        .eq('estabelecimento_id', estabelecimentoId)
        .in('status', ['concluido', 'confirmado'])
        .gte('data_agendamento', umMesAtras.toISOString().split('T')[0]);

      if (clientesUltimoMesError) {
        console.error('Erro ao buscar clientes do último mês:', clientesUltimoMesError);
      }

      const clientesUltimoMesUnicos = new Set();
      clientesUltimoMesData?.forEach((cliente) => {
        clientesUltimoMesUnicos.add(`${cliente.cliente_nome}-${cliente.cliente_telefone}`);
      });

      return {
        totalClientes: clientesUnicos.size,
        clientesUltimoMes: clientesUltimoMesUnicos.size,
        totalAtendimentos: clientesData?.length || 0,
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return { totalClientes: 0, clientesUltimoMes: 0, totalAtendimentos: 0 };
    }
  }
}
