package com.filetransfermobile;

import android.app.Service;
import android.content.Intent;
import android.graphics.PixelFormat;
import android.os.Build;
import android.os.IBinder;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.ImageView;
import android.widget.TextView;

public class FloatingWindowService extends Service {
    public static final String ACTION_SHOW = "ACTION_SHOW";
    public static final String ACTION_HIDE = "ACTION_HIDE";
    public static final String ACTION_UPDATE = "ACTION_UPDATE";

    private static FloatingWindowService instance;
    private WindowManager windowManager;
    private View floatingView;
    private WindowManager.LayoutParams params;
    private boolean isShowing = false;
    private boolean isMinimized = false;

    // 拖拽相关变量
    private int initialX;
    private int initialY;
    private float initialTouchX;
    private float initialTouchY;

    public static FloatingWindowService getInstance() {
        return instance;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        instance = this;
        windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);
        createFloatingWindow();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            String action = intent.getAction();
            if (ACTION_SHOW.equals(action)) {
                showWindow();
            } else if (ACTION_HIDE.equals(action)) {
                hideWindow();
            }
        }
        return START_STICKY;
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (floatingView != null && windowManager != null) {
            windowManager.removeView(floatingView);
        }
        instance = null;
    }

    private void createFloatingWindow() {
        // 创建悬浮窗布局
        floatingView = LayoutInflater.from(this).inflate(R.layout.floating_window_layout, null);

        // 设置窗口参数
        int layoutFlag;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            layoutFlag = WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
        } else {
            layoutFlag = WindowManager.LayoutParams.TYPE_PHONE;
        }

        params = new WindowManager.LayoutParams(
                dpToPx(320), // 默认宽度
                dpToPx(400), // 默认高度
                layoutFlag,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
                PixelFormat.TRANSLUCENT
        );

        params.gravity = Gravity.TOP | Gravity.LEFT;
        params.x = 100;
        params.y = 100;

        // 设置拖拽监听
        setupDragListener();
        
        // 设置点击监听
        setupClickListeners();
    }

    private void setupDragListener() {
        floatingView.setOnTouchListener(new View.OnTouchListener() {
            @Override
            public boolean onTouch(View v, MotionEvent event) {
                switch (event.getAction()) {
                    case MotionEvent.ACTION_DOWN:
                        initialX = params.x;
                        initialY = params.y;
                        initialTouchX = event.getRawX();
                        initialTouchY = event.getRawY();
                        return true;

                    case MotionEvent.ACTION_MOVE:
                        params.x = initialX + (int) (event.getRawX() - initialTouchX);
                        params.y = initialY + (int) (event.getRawY() - initialTouchY);
                        
                        if (windowManager != null && floatingView != null) {
                            windowManager.updateViewLayout(floatingView, params);
                        }
                        return true;

                    case MotionEvent.ACTION_UP:
                        // 贴边吸附
                        snapToEdge();
                        return true;
                }
                return false;
            }
        });
    }

    private void setupClickListeners() {
        // 最小化按钮
        ImageView minimizeBtn = floatingView.findViewById(R.id.btn_minimize);
        if (minimizeBtn != null) {
            minimizeBtn.setOnClickListener(v -> toggleMinimize());
        }

        // 关闭按钮
        ImageView closeBtn = floatingView.findViewById(R.id.btn_close);
        if (closeBtn != null) {
            closeBtn.setOnClickListener(v -> hideWindow());
        }

        // 主体点击（展开/收起）
        View mainContent = floatingView.findViewById(R.id.main_content);
        if (mainContent != null) {
            mainContent.setOnClickListener(v -> {
                if (isMinimized) {
                    toggleMinimize();
                }
            });
        }
    }

    private void snapToEdge() {
        int screenWidth = getResources().getDisplayMetrics().widthPixels;
        int screenHeight = getResources().getDisplayMetrics().heightPixels;
        
        // 水平贴边
        if (params.x < screenWidth / 2) {
            params.x = 0; // 贴左边
        } else {
            params.x = screenWidth - floatingView.getWidth(); // 贴右边
        }
        
        // 垂直边界限制
        if (params.y < 0) {
            params.y = 0;
        } else if (params.y > screenHeight - floatingView.getHeight()) {
            params.y = screenHeight - floatingView.getHeight();
        }
        
        if (windowManager != null && floatingView != null) {
            windowManager.updateViewLayout(floatingView, params);
        }
    }

    public void showWindow() {
        if (!isShowing && floatingView != null && windowManager != null) {
            try {
                windowManager.addView(floatingView, params);
                isShowing = true;
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    public void hideWindow() {
        if (isShowing && floatingView != null && windowManager != null) {
            try {
                windowManager.removeView(floatingView);
                isShowing = false;
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    public void updateWindow(int width, int height, int x, int y, boolean minimized) {
        if (params != null) {
            params.width = dpToPx(width);
            params.height = dpToPx(height);
            params.x = x;
            params.y = y;
            
            if (minimized != isMinimized) {
                toggleMinimize();
            }
            
            if (windowManager != null && floatingView != null && isShowing) {
                windowManager.updateViewLayout(floatingView, params);
            }
        }
    }

    public void setPosition(int x, int y) {
        if (params != null) {
            params.x = x;
            params.y = y;
            
            if (windowManager != null && floatingView != null && isShowing) {
                windowManager.updateViewLayout(floatingView, params);
            }
        }
    }

    public int[] getPosition() {
        if (params != null) {
            return new int[]{params.x, params.y};
        }
        return new int[]{0, 0};
    }

    public boolean isShowing() {
        return isShowing;
    }

    private void toggleMinimize() {
        isMinimized = !isMinimized;
        
        if (isMinimized) {
            // 切换到最小化模式
            params.width = dpToPx(80);
            params.height = dpToPx(80);
            
            // 隐藏详细内容，显示最小化视图
            View detailView = floatingView.findViewById(R.id.detail_view);
            View miniView = floatingView.findViewById(R.id.mini_view);
            
            if (detailView != null) detailView.setVisibility(View.GONE);
            if (miniView != null) miniView.setVisibility(View.VISIBLE);
        } else {
            // 切换到正常模式
            params.width = dpToPx(320);
            params.height = dpToPx(400);
            
            // 显示详细内容，隐藏最小化视图
            View detailView = floatingView.findViewById(R.id.detail_view);
            View miniView = floatingView.findViewById(R.id.mini_view);
            
            if (detailView != null) detailView.setVisibility(View.VISIBLE);
            if (miniView != null) miniView.setVisibility(View.GONE);
        }
        
        if (windowManager != null && floatingView != null && isShowing) {
            windowManager.updateViewLayout(floatingView, params);
        }
    }

    private int dpToPx(int dp) {
        return (int) (dp * getResources().getDisplayMetrics().density);
    }
}
