export const TEMPLATE_PADRAO = `🗓️ *Confirmação de Agendamento*

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

export const VARIAVEIS_TEMPLATE = [
  'NOME_CLIENTE',
  'TELEFONE_CLIENTE',
  'DATA_AGENDAMENTO',
  'HORARIO_AGENDAMENTO',
  'NOME_SERVICO',
  'NOME_COLABORADOR',
  'NOME_ESTABELECIMENTO',
] as const;
