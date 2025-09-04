import { createStaticNavigation, StaticParamList } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/login';
import Modal from '../screens/modal';
import TabNavigator from './tab-navigator';

const Stack = createStackNavigator({
  screens: {
    Login: {
      screen: LoginScreen,
      options: {
        headerShown: false,
      },
    },
    TabNavigator: {
      screen: TabNavigator,
      options: {
        headerShown: false,
      },
    },
    Modal: {
      screen: Modal,
      options: {
        presentation: 'modal',
        headerLeft: () => null,
      },
    },
  },
});

type RootNavigatorParamList = StaticParamList<typeof Stack>;

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootNavigatorParamList {}
  }
}

const Navigation = createStaticNavigation(Stack);
export default Navigation;
