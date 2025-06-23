import { useState, useCallback, useEffect } from 'react';
import { Platform, PermissionsAndroid, Linking, Alert } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

export interface PermissionState {
  overlay: boolean;
  storage: boolean;
  camera: boolean;
  notification: boolean;
}

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<PermissionState>({
    overlay: false,
    storage: false,
    camera: false,
    notification: false,
  });

  // 检查悬浮窗权限
  const hasOverlayPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        // 对于Android 6.0+，需要检查SYSTEM_ALERT_WINDOW权限
        if (Platform.Version >= 23) {
          const granted = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.SYSTEM_ALERT_WINDOW
          );
          return granted;
        }
        return true; // Android 6.0以下默认有权限
      } catch (error) {
        console.error('检查悬浮窗权限失败:', error);
        return false;
      }
    } else if (Platform.OS === 'ios') {
      // iOS需要检查Picture-in-Picture权限或其他相关权限
      // 这里简化处理，实际需要根据具体实现方式检查
      return true;
    }
    return false;
  }, []);

  // 请求悬浮窗权限
  const requestOverlayPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        if (Platform.Version >= 23) {
          // 对于Android 6.0+，需要跳转到设置页面手动授权
          Alert.alert(
            '需要悬浮窗权限',
            '请在设置中允许此应用显示在其他应用的上层。',
            [
              { text: '取消', style: 'cancel' },
              {
                text: '去设置',
                onPress: () => {
                  // 跳转到应用设置页面
                  Linking.openSettings();
                },
              },
            ]
          );
          return false; // 需要用户手动设置
        } else {
          // Android 6.0以下可以直接请求
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.SYSTEM_ALERT_WINDOW
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
      } catch (error) {
        console.error('请求悬浮窗权限失败:', error);
        return false;
      }
    } else if (Platform.OS === 'ios') {
      // iOS的处理逻辑
      return true;
    }
    return false;
  }, []);

  // 检查存储权限
  const hasStoragePermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const readGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        );
        const writeGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );
        return readGranted && writeGranted;
      } catch (error) {
        console.error('检查存储权限失败:', error);
        return false;
      }
    }
    return true; // iOS不需要显式请求存储权限
  }, []);

  // 请求存储权限
  const requestStoragePermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]);
        
        return (
          granted[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] === 
          PermissionsAndroid.RESULTS.GRANTED &&
          granted[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] === 
          PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (error) {
        console.error('请求存储权限失败:', error);
        return false;
      }
    }
    return true;
  }, []);

  // 检查相机权限
  const hasCameraPermission = useCallback(async (): Promise<boolean> => {
    try {
      const permission = Platform.OS === 'ios' 
        ? PERMISSIONS.IOS.CAMERA 
        : PERMISSIONS.ANDROID.CAMERA;
      
      const result = await check(permission);
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.error('检查相机权限失败:', error);
      return false;
    }
  }, []);

  // 请求相机权限
  const requestCameraPermission = useCallback(async (): Promise<boolean> => {
    try {
      const permission = Platform.OS === 'ios' 
        ? PERMISSIONS.IOS.CAMERA 
        : PERMISSIONS.ANDROID.CAMERA;
      
      const result = await request(permission);
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.error('请求相机权限失败:', error);
      return false;
    }
  }, []);

  // 检查通知权限
  const hasNotificationPermission = useCallback(async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'ios') {
        const permission = PERMISSIONS.IOS.NOTIFICATIONS;
        const result = await check(permission);
        return result === RESULTS.GRANTED;
      } else {
        // Android的通知权限检查
        return true; // 简化处理
      }
    } catch (error) {
      console.error('检查通知权限失败:', error);
      return false;
    }
  }, []);

  // 请求通知权限
  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'ios') {
        const permission = PERMISSIONS.IOS.NOTIFICATIONS;
        const result = await request(permission);
        return result === RESULTS.GRANTED;
      } else {
        // Android的通知权限请求
        return true; // 简化处理
      }
    } catch (error) {
      console.error('请求通知权限失败:', error);
      return false;
    }
  }, []);

  // 检查所有权限状态
  const checkAllPermissions = useCallback(async () => {
    try {
      const [overlay, storage, camera, notification] = await Promise.all([
        hasOverlayPermission(),
        hasStoragePermission(),
        hasCameraPermission(),
        hasNotificationPermission(),
      ]);

      setPermissions({
        overlay,
        storage,
        camera,
        notification,
      });

      return { overlay, storage, camera, notification };
    } catch (error) {
      console.error('检查权限状态失败:', error);
      return permissions;
    }
  }, [
    hasOverlayPermission,
    hasStoragePermission,
    hasCameraPermission,
    hasNotificationPermission,
    permissions,
  ]);

  // 请求所有必要权限
  const requestAllPermissions = useCallback(async () => {
    try {
      const results = await Promise.all([
        requestStoragePermission(),
        requestCameraPermission(),
        requestNotificationPermission(),
      ]);

      // 悬浮窗权限需要单独处理，因为可能需要跳转设置
      const overlayResult = await requestOverlayPermission();

      const newPermissions = {
        overlay: overlayResult,
        storage: results[0],
        camera: results[1],
        notification: results[2],
      };

      setPermissions(newPermissions);
      return newPermissions;
    } catch (error) {
      console.error('请求权限失败:', error);
      return permissions;
    }
  }, [
    requestStoragePermission,
    requestCameraPermission,
    requestNotificationPermission,
    requestOverlayPermission,
    permissions,
  ]);

  // 初始化时检查权限状态
  useEffect(() => {
    checkAllPermissions();
  }, []);

  return {
    permissions,
    hasOverlayPermission,
    requestOverlayPermission,
    hasStoragePermission,
    requestStoragePermission,
    hasCameraPermission,
    requestCameraPermission,
    hasNotificationPermission,
    requestNotificationPermission,
    checkAllPermissions,
    requestAllPermissions,
  };
};
