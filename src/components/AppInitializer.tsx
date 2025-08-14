import { useEffect, useState } from "react";
import { useHabitStore } from "../stores/useHabitStore";
import { useNotification } from "../hooks/useNotification";

interface AppInitializerProps {
  children: React.ReactNode;
}

/**
 * 应用初始化组件
 * 负责在应用启动时加载所有必要的数据
 */
export const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const { init, loading, error, habits, dailyReminder } = useHabitStore();
  const [initialized, setInitialized] = useState(false);

  // 启用通知服务
  useNotification(habits, dailyReminder);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await init();
        setInitialized(true);
      } catch (error) {
        console.error("应用初始化失败:", error);
        setInitialized(true); // 即使失败也要显示界面
      }
    };

    initializeApp();
  }, [init]);

  // 显示加载状态
  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-[#FF5A5F] border-t-transparent rounded-full animate-spin"></div>
            <div className="text-gray-600 font-medium">正在加载数据...</div>
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
