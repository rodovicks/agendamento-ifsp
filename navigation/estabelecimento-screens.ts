import EditarPerfilScreen from '../screens/editarPerfil';
import RamoAtividadeScreen from '../screens/ramoAtividade';
import ServicosScreen from '../screens/servicos';
import ColaboradoresScreen from '../screens/colaboradores';
import AgendamentoScreen from '../screens/agendamento';
import AjustesScreen from '../screens/ajustes';
import TemplateMensagemScreen from '../screens/templateMensagem';
import ClientesScreen from '../screens/clientes';

export const estabelecimentoScreens = {
  EditarPerfil: {
    screen: EditarPerfilScreen,
    options: { title: 'Editar Perfil' },
  },
  Servicos: {
    screen: ServicosScreen,
    options: { title: 'Serviços' },
  },
  Colaboradores: {
    screen: ColaboradoresScreen,
    options: { title: 'Colaboradores' },
  },
  Clientes: {
    screen: ClientesScreen,
    options: { title: 'Clientes Atendidos' },
  },
  Agendamento: {
    screen: AgendamentoScreen,
    options: { title: 'Agendamento' },
  },
  TemplateMensagem: {
    screen: TemplateMensagemScreen,
    options: { title: 'Template de Mensagem' },
  },
  Ajustes: {
    screen: AjustesScreen,
    options: { title: 'Ajustes' },
  },
};
