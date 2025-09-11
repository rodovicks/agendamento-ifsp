import EditarPerfilScreen from '../screens/editarPerfil';
import RamoAtividadeScreen from '../screens/ramoAtividade';
import ServicosScreen from '../screens/servicos';
import ColaboradoresScreen from '../screens/colaboradores';
import AgendamentoScreen from '../screens/agendamento';
import AjustesScreen from '../screens/ajustes';

export const estabelecimentoScreens = {
  EditarPerfil: {
    screen: EditarPerfilScreen,
    options: { title: 'Editar Perfil' },
  },
  RamoAtividade: {
    screen: RamoAtividadeScreen,
    options: { title: 'Ramo de Atividade' },
  },
  Servicos: {
    screen: ServicosScreen,
    options: { title: 'Serviços' },
  },
  Colaboradores: {
    screen: ColaboradoresScreen,
    options: { title: 'Colaboradores' },
  },
  Agendamento: {
    screen: AgendamentoScreen,
    options: { title: 'Agendamento' },
  },
  Ajustes: {
    screen: AjustesScreen,
    options: { title: 'Ajustes' },
  },
};
