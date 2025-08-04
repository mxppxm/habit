import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { CheckCircle } from 'lucide-react';

/**
 * Airbnb风格头部时间展示组件
 * 显示当前时间，每秒刷新一次
 */
export const Header: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(dayjs().format('YYYY-MM-DD HH:mm:ss'));

  useEffect(() => {
    // 更新时间的函数
    const updateTime = () => {
      setCurrentTime(dayjs().format('YYYY-MM-DD HH:mm:ss'));
    };

    // 设置定时器，每秒更新一次
    const timer = setInterval(updateTime, 1000);

    // 清理函数，组件卸载时清除定时器
    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="w-full bg-white py-4 px-6 shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-8 h-8 text-[#FF5A5F]" />
            <h1 className="text-2xl font-semibold text-gray-800">
              习惯打卡追踪器
            </h1>
          </div>
          <p className="text-md text-gray-600">
            {currentTime}
          </p>
        </div>
      </div>
    </div>
  );
};
