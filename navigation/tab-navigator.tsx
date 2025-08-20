import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HeaderButton } from '../components/HeaderButton';
import { TabBarIcon } from '../components/TabBarIcon';
import One from '../screens/one';
import Two from '../screens/two';

const Tab = createBottomTabNavigator({
  screenOptions: function ScreenOptions() {
    return {
      tabBarActiveTintColor: 'black',
    };
  },
  screens: {
    One: {
      screen: One,
      options: ({ navigation }) => ({
        title: 'Tab One',
        tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
        headerRight: () => <HeaderButton onPress={() => navigation.navigate('Modal')} />,
      }),
    },
    Two: {
      screen: Two,
      options: {
        title: 'Tab Two',
        tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
      },
    },
  },
});

export default Tab;
