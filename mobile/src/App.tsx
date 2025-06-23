import React, { useState, useEffect } from 'react';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

// 悬浮窗组件
import { FloatingWindowManager } from './components/FloatingWindow/FloatingWindowManager';
import { FloatingWindow } from './components/FloatingWindow/FloatingWindow';
import { MiniFloatingWindow } from './components/FloatingWindow/MiniFloatingWindow';

// 页面组件
import HomeScreen from './screens/Home/HomeScreen';
import FilesScreen from './screens/Files/FilesScreen';
import TransferScreen from './screens/Transfer/TransferScreen';
import SettingsScreen from './screens/Settings/SettingsScreen';

// Hooks
import { useFloatingWindow } from './hooks/useFloatingWindow';
import { useFileManager } from './hooks/useFileManager';
import { usePermissions } from './hooks/usePermissions';

const Tab = createBottomTabNavigator();

const App: React.FC = () => {
  const {
    isFloatingMode,
    isMinimized,
    toggleFloatingMode,
    toggleMinimized,
    floatingPosition,
    setFloatingPosition
  } = useFloatingWindow();

  const { files, uploadFile, deleteFile, shareFile } = useFileManager();
  const { hasOverlayPermission, requestOverlayPermission } = usePermissions();

  // 检查并请求悬浮窗权限
  useEffect(() => {
    const checkPermissions = async () => {
      if (Platform.OS === 'android') {
        try {
          const hasPermission = await hasOverlayPermission();
          if (!hasPermission) {
            Alert.alert(
              '需要悬浮窗权限',
              '为了提供更好的文件传输体验，请允许应用显示悬浮窗。这样您就可以在使用其他应用时快速访问文件传输功能。',
              [
                { text: '稍后设置', style: 'cancel' },
                {
                  text: '去设置',
                  onPress: async () => {
                    const granted = await requestOverlayPermission();
                    if (granted) {
                      Alert.alert('权限已授予', '现在可以使用悬浮窗功能了！');
                    }
                  }
                }
              ]
            );
          }
        } catch (error) {
          console.error('检查悬浮窗权限失败:', error);
        }
      }
    };

    checkPermissions();
  }, [hasOverlayPermission, requestOverlayPermission]);

  // 处理悬浮窗模式切换
  const handleToggleFloating = async (enable: boolean) => {
    if (enable && Platform.OS === 'android') {
      const hasPermission = await hasOverlayPermission();
      if (!hasPermission) {
        Alert.alert(
          '需要悬浮窗权限',
          '请先授予悬浮窗权限才能使用此功能。',
          [
            { text: '取消', style: 'cancel' },
            {
              text: '去设置',
              onPress: () => requestOverlayPermission()
            }
          ]
        );
        return;
      }
    }

    toggleFloatingMode(enable);
  };

  // 如果是悬浮窗模式，显示悬浮窗
  if (isFloatingMode) {
    return (
      <PaperProvider>
        <FloatingWindowManager
          isMinimized={isMinimized}
          position={floatingPosition}
          onPositionChange={setFloatingPosition}
          onToggleMinimized={toggleMinimized}
          onClose={() => toggleFloatingMode(false)}
        >
          {isMinimized ? (
            <MiniFloatingWindow
              fileCount={files.length}
              isConnected={true}
              onExpand={() => toggleMinimized(false)}
            />
          ) : (
            <FloatingWindow
              files={files}
              onFileShare={shareFile}
              onFileDelete={deleteFile}
              onMinimize={() => toggleMinimized(true)}
              onClose={() => toggleFloatingMode(false)}
              isConnected={true}
            />
          )}
        </FloatingWindowManager>
      </PaperProvider>
    );
  }

  // 正常模式显示标准界面
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
            initialParams={{
              onToggleFloating: handleToggleFloating,
              files
            }}
          />
          <Tab.Screen
            name="Files"
            component={FilesScreen}
            options={{ title: '文件' }}
            initialParams={{ files, onFileDelete: deleteFile, onFileShare: shareFile }}
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
            initialParams={{
              onToggleFloating: handleToggleFloating,
              hasOverlayPermission: hasOverlayPermission(),
              requestOverlayPermission
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;

  // 如果是悬浮窗模式，显示悬浮窗
  if (isFloatingMode) {
    return (
      <PaperProvider>
        <FloatingWindowManager
          isMinimized={isMinimized}
          position={floatingPosition}
          onPositionChange={setFloatingPosition}
          onToggleMinimized={toggleMinimized}
          onClose={() => toggleFloatingMode(false)}
        >
          {isMinimized ? (
            <MiniFloatingWindow
              fileCount={files.length}
              isConnected={true}
              onExpand={() => toggleMinimized(false)}
            />
          ) : (
            <FloatingWindow
              files={files}
              onFileShare={shareFile}
              onFileDelete={deleteFile}
              onMinimize={() => toggleMinimized(true)}
              onClose={() => toggleFloatingMode(false)}
              isConnected={true}
            />
          )}
        </FloatingWindowManager>
      </PaperProvider>
    );
  }

  // 正常模式显示标准界面
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
            initialParams={{
              onToggleFloating: () => toggleFloatingMode(true),
              files
            }}
          />
          <Tab.Screen
            name="Files"
            component={FilesScreen}
            options={{ title: '文件' }}
            initialParams={{ files, onFileDelete: deleteFile, onFileShare: shareFile }}
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
            initialParams={{
              onToggleFloating: () => toggleFloatingMode(true),
              hasOverlayPermission: hasOverlayPermission(),
              requestOverlayPermission
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;
