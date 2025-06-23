package com.filetransfermobile;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.view.WindowManager;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;

public class FloatingWindowModule extends ReactContextBaseJavaModule {
    private static final String MODULE_NAME = "FloatingWindowModule";
    private ReactApplicationContext reactContext;
    private FloatingWindowService floatingWindowService;

    public FloatingWindowModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return MODULE_NAME;
    }

    @ReactMethod
    public void showFloatingWindow(Promise promise) {
        try {
            if (!checkOverlayPermissionInternal()) {
                promise.reject("PERMISSION_DENIED", "悬浮窗权限未授予");
                return;
            }

            if (floatingWindowService == null) {
                Intent intent = new Intent(reactContext, FloatingWindowService.class);
                intent.setAction(FloatingWindowService.ACTION_SHOW);
                reactContext.startService(intent);
                floatingWindowService = FloatingWindowService.getInstance();
            } else {
                floatingWindowService.showWindow();
            }
            
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("SHOW_FAILED", "显示悬浮窗失败: " + e.getMessage());
        }
    }

    @ReactMethod
    public void hideFloatingWindow(Promise promise) {
        try {
            if (floatingWindowService != null) {
                floatingWindowService.hideWindow();
            } else {
                Intent intent = new Intent(reactContext, FloatingWindowService.class);
                intent.setAction(FloatingWindowService.ACTION_HIDE);
                reactContext.startService(intent);
            }
            
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("HIDE_FAILED", "隐藏悬浮窗失败: " + e.getMessage());
        }
    }

    @ReactMethod
    public void updateFloatingWindow(ReadableMap config, Promise promise) {
        try {
            if (floatingWindowService == null) {
                promise.reject("SERVICE_NOT_FOUND", "悬浮窗服务未启动");
                return;
            }

            int width = config.hasKey("width") ? config.getInt("width") : 320;
            int height = config.hasKey("height") ? config.getInt("height") : 400;
            int x = config.hasKey("x") ? config.getInt("x") : 0;
            int y = config.hasKey("y") ? config.getInt("y") : 0;
            boolean isMinimized = config.hasKey("isMinimized") && config.getBoolean("isMinimized");

            floatingWindowService.updateWindow(width, height, x, y, isMinimized);
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("UPDATE_FAILED", "更新悬浮窗失败: " + e.getMessage());
        }
    }

    @ReactMethod
    public void checkOverlayPermission(Promise promise) {
        try {
            boolean hasPermission = checkOverlayPermissionInternal();
            promise.resolve(hasPermission);
        } catch (Exception e) {
            promise.reject("CHECK_FAILED", "检查权限失败: " + e.getMessage());
        }
    }

    @ReactMethod
    public void requestOverlayPermission(Promise promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                if (!Settings.canDrawOverlays(reactContext)) {
                    Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION);
                    intent.setData(Uri.parse("package:" + reactContext.getPackageName()));
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    reactContext.startActivity(intent);
                    promise.resolve(false); // 需要用户手动授权
                } else {
                    promise.resolve(true);
                }
            } else {
                promise.resolve(true); // Android 6.0以下默认有权限
            }
        } catch (Exception e) {
            promise.reject("REQUEST_FAILED", "请求权限失败: " + e.getMessage());
        }
    }

    @ReactMethod
    public void setPosition(ReadableMap position, Promise promise) {
        try {
            if (floatingWindowService == null) {
                promise.reject("SERVICE_NOT_FOUND", "悬浮窗服务未启动");
                return;
            }

            int x = position.hasKey("x") ? position.getInt("x") : 0;
            int y = position.hasKey("y") ? position.getInt("y") : 0;

            floatingWindowService.setPosition(x, y);
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("SET_POSITION_FAILED", "设置位置失败: " + e.getMessage());
        }
    }

    @ReactMethod
    public void getPosition(Promise promise) {
        try {
            if (floatingWindowService == null) {
                promise.reject("SERVICE_NOT_FOUND", "悬浮窗服务未启动");
                return;
            }

            int[] position = floatingWindowService.getPosition();
            WritableMap result = new WritableNativeMap();
            result.putInt("x", position[0]);
            result.putInt("y", position[1]);
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("GET_POSITION_FAILED", "获取位置失败: " + e.getMessage());
        }
    }

    @ReactMethod
    public void setVisibility(boolean visible, Promise promise) {
        try {
            if (floatingWindowService == null) {
                promise.reject("SERVICE_NOT_FOUND", "悬浮窗服务未启动");
                return;
            }

            if (visible) {
                floatingWindowService.showWindow();
            } else {
                floatingWindowService.hideWindow();
            }
            
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("SET_VISIBILITY_FAILED", "设置可见性失败: " + e.getMessage());
        }
    }

    @ReactMethod
    public void isShowing(Promise promise) {
        try {
            boolean showing = floatingWindowService != null && floatingWindowService.isShowing();
            promise.resolve(showing);
        } catch (Exception e) {
            promise.reject("CHECK_SHOWING_FAILED", "检查显示状态失败: " + e.getMessage());
        }
    }

    private boolean checkOverlayPermissionInternal() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            return Settings.canDrawOverlays(reactContext);
        }
        return true; // Android 6.0以下默认有权限
    }
}
