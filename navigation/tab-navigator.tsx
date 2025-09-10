import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HeaderButton } from '../components/HeaderButton';
import { TabBarIcon } from '../components/TabBarIcon';
import One from '../screens/one';
import ConfiguracoesScreen from '../screens/configuracoes';
import { Text } from 'react-native';

const Tab = createBottomTabNavigator({
  screenOptions: function ScreenOptions() {
    return {
      tabBarActiveTintColor: '#6366f1',
      tabBarInactiveTintColor: '#6b7280',
    };
  },
  screens: {
    Home: {
      screen: One,

      options: ({ navigation }) => ({
        title: 'Home',
        tabBarLabel: ({ focused, color }) => (
          <Text
            className="w-full text-center text-xs"
            numberOfLines={2}
            ellipsizeMode="tail"
            style={{ color }}>
            {'Home'}
          </Text>
        ),
        tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        headerRight: () => <HeaderButton onPress={() => navigation.navigate('Modal')} />,
      }),
    },
    Configuracoes: {
      screen: ConfiguracoesScreen,
      options: {
        title: 'Configurações',
        tabBarLabel: ({ focused, color }) => (
          <Text
            className="w-full text-center text-xs"
            numberOfLines={2}
            ellipsizeMode="tail"
            style={{ color }}>
            {'Configurações'}
          </Text>
        ),
        tabBarIcon: ({ color }) => <TabBarIcon name="cog" color={color} />,
      },
    },
  },
});

export default Tab;
