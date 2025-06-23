import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

// 页面组件
import HomeScreen from './screens/Home/HomeScreen';
import FilesScreen from './screens/Files/FilesScreen';
import TransferScreen from './screens/Transfer/TransferScreen';
import SettingsScreen from './screens/Settings/SettingsScreen';

const Tab = createBottomTabNavigator();

const App: React.FC = () => {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: string;

              switch (route.name) {
                case 'Home':
                  iconName = 'home';
                  break;
                case 'Files':
                  iconName = 'folder';
                  break;
                case 'Transfer':
                  iconName = 'swap-horiz';
                  break;
                case 'Settings':
                  iconName = 'settings';
                  break;
                default:
                  iconName = 'help';
              }

              return <Icon name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#2196F3',
            tabBarInactiveTintColor: 'gray',
          })}
        >
          <Tab.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ title: '首页' }}
          />
          <Tab.Screen 
            name="Files" 
            component={FilesScreen} 
            options={{ title: '文件' }}
          />
          <Tab.Screen 
            name="Transfer" 
            component={TransferScreen} 
            options={{ title: '传输' }}
          />
          <Tab.Screen 
            name="Settings" 
            component={SettingsScreen} 
            options={{ title: '设置' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;
