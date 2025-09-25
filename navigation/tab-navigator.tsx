import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AddButton } from '../components/AddButton';
import { TabBarIcon } from '../components/TabBarIcon';
import One from '../screens/one';
import ConfiguracoesScreen from '../screens/configuracoes';
import { Text } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const Tab = createBottomTabNavigator({
  screenOptions: function ScreenOptions() {
    const { isDark } = useTheme();
    return {
      tabBarActiveTintColor: '#6366f1',
      tabBarInactiveTintColor: isDark ? '#94A3B8' : '#6b7280',
      tabBarStyle: {
        backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
        borderTopColor: isDark ? '#334155' : '#E5E7EB',
      },
      headerStyle: {
        backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      },
      headerTintColor: isDark ? '#F1F5F9' : '#111827',
      headerTitleStyle: {
        color: isDark ? '#F1F5F9' : '#111827',
      },
    };
  },
  screens: {
    Home: {
      screen: One,

      options: ({ navigation }) => ({
        title: 'Agendamentos',
        tabBarLabel: ({ focused, color }) => (
          <Text
            className="w-full text-center text-xs"
            numberOfLines={2}
            ellipsizeMode="tail"
            style={{ color }}>
            {'Agendamentos'}
          </Text>
        ),
        tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
        headerRight: () => <AddButton onPress={() => navigation.navigate('Agendamento')} />,
      }),
    },

    Configuracoes: {
      screen: ConfiguracoesScreen,
      options: {
        title: 'Menu',
        tabBarLabel: ({ focused, color }) => (
          <Text
            className="w-full text-center text-xs"
            numberOfLines={2}
            ellipsizeMode="tail"
            style={{ color }}>
            {'Menu'}
          </Text>
        ),
        tabBarIcon: ({ color }) => <TabBarIcon name="cog" color={color} />,
      },
    },
  },
});

export default Tab;
