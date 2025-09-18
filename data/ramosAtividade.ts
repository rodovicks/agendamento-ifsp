export interface ServicoTemplate {
  idServico: number;
  nomeServico: string;
  descricao: string;
}

export interface RamoAtividade {
  id: number;
  nomeRamoAtividade: string;
  descricao: string;
  servicos: ServicoTemplate[];
}

export const RAMOS_ATIVIDADE: RamoAtividade[] = [
  {
    id: 1,
    nomeRamoAtividade: 'Oficina Mecânica Automotiva',
    descricao: '',
    servicos: [
      {
        idServico: 1,
        nomeServico: 'Troca de Pastilha de Freio',
        descricao: 'Substituição de pastilhas dianteiras ou traseiras.',
      },
      {
        idServico: 2,
        nomeServico: 'Troca de Correia Dentada',
        descricao: 'Substituição preventiva da correia de sincronismo.',
      },
      {
        idServico: 3,
        nomeServico: 'Revisão Geral',
        descricao: 'Check-up completo de itens mecânicos e de segurança.',
      },
      {
        idServico: 4,
        nomeServico: 'Teste de Alternador',
        descricao: 'Verificação e reparo no sistema de carga da bateria.',
      },
    ],
  },
  {
    id: 2,
    nomeRamoAtividade: 'Auto Elétrica',
    descricao: '',
    servicos: [
      {
        idServico: 5,
        nomeServico: 'Instalação de Som Automotivo',
        descricao: 'Montagem e configuração de sistema de áudio.',
      },
      {
        idServico: 6,
        nomeServico: 'Reparo de Motor de Partida',
        descricao: 'Substituição ou reparo do motor de arranque.',
      },
    ],
  },
  {
    id: 3,
    nomeRamoAtividade: 'Mecânica Diesel',
    descricao: '',
    servicos: [
      {
        idServico: 7,
        nomeServico: 'Revisão de Bomba Injetora',
        descricao: 'Ajuste e manutenção da bomba de combustível.',
      },
      {
        idServico: 8,
        nomeServico: 'Troca de Bicos Injetores',
        descricao: 'Substituição e limpeza de bicos injetores diesel.',
      },
      {
        idServico: 9,
        nomeServico: 'Diagnóstico de Turbo',
        descricao: 'Avaliação e reparo de turbocompressores.',
      },
    ],
  },
  {
    id: 4,
    nomeRamoAtividade: 'Troca de Óleo e Lubrificação',
    descricao: '',
    servicos: [
      {
        idServico: 10,
        nomeServico: 'Troca de Óleo Motor 5W30',
        descricao: 'Substituição do óleo lubrificante 5W30.',
      },
      {
        idServico: 11,
        nomeServico: 'Troca de Filtro de Óleo',
        descricao: 'Substituição do filtro de óleo do motor.',
      },
      {
        idServico: 12,
        nomeServico: 'Troca de Filtro de Ar',
        descricao: 'Substituição do filtro de ar do motor.',
      },
    ],
  },
  {
    id: 5,
    nomeRamoAtividade: 'Alinhamento e Balanceamento',
    descricao: '',
    servicos: [
      {
        idServico: 13,
        nomeServico: 'Alinhamento 3D',
        descricao: 'Ajuste computadorizado da geometria de rodas.',
      },
      {
        idServico: 14,
        nomeServico: 'Balanceamento de Rodas',
        descricao: 'Correção de peso para rodagem sem vibrações.',
      },
      {
        idServico: 15,
        nomeServico: 'Cambagem',
        descricao: 'Ajuste de ângulo das rodas.',
      },
    ],
  },
  {
    id: 6,
    nomeRamoAtividade: 'Funilaria e Pintura',
    descricao: '',
    servicos: [
      {
        idServico: 16,
        nomeServico: 'Martelinho de Ouro',
        descricao: 'Reparo de pequenas amassados sem pintura.',
      },
      {
        idServico: 17,
        nomeServico: 'Pintura Parcial',
        descricao: 'Repintura localizada de peças avariadas.',
      },
      {
        idServico: 18,
        nomeServico: 'Pintura Completa',
        descricao: 'Repintura geral do veículo.',
      },
    ],
  },
  {
    id: 7,
    nomeRamoAtividade: 'Retífica de Motores',
    descricao: '',
    servicos: [
      {
        idServico: 19,
        nomeServico: 'Plainas de Cabeçote',
        descricao: 'Retífica e correção de superfície do cabeçote.',
      },
      {
        idServico: 20,
        nomeServico: 'Troca de Anéis de Pistão',
        descricao: 'Substituição dos anéis de vedação do pistão.',
      },
      {
        idServico: 21,
        nomeServico: 'Usinagem de Virabrequim',
        descricao: 'Correção e polimento do virabrequim.',
      },
    ],
  },
  {
    id: 8,
    nomeRamoAtividade: 'Ar Condicionado Automotivo',
    descricao: '',
    servicos: [
      {
        idServico: 22,
        nomeServico: 'Higienização do Ar Condicionado',
        descricao: 'Limpeza completa do sistema de ventilação.',
      },
      {
        idServico: 23,
        nomeServico: 'Troca de Filtro de Cabine',
        descricao: 'Substituição do filtro antipólen.',
      },
      {
        idServico: 24,
        nomeServico: 'Recarga de Gás',
        descricao: 'Reabastecimento do fluido refrigerante.',
      },
    ],
  },
  {
    id: 9,
    nomeRamoAtividade: 'Centro de Diagnóstico Automotivo',
    descricao: '',
    servicos: [
      {
        idServico: 25,
        nomeServico: 'Leitura de Scanner OBD2',
        descricao: 'Diagnóstico eletrônico via scanner automotivo.',
      },
      {
        idServico: 26,
        nomeServico: 'Reset de Luz do Painel',
        descricao: 'Correção e apagamento de falhas eletrônicas.',
      },
      {
        idServico: 27,
        nomeServico: 'Diagnóstico de Injeção Eletrônica',
        descricao: 'Análise detalhada do sistema de injeção.',
      },
    ],
  },
];
