import { Link, Outlet, useLocation } from 'react-router-dom';
import { Header } from '../ui/Header';
import { Home, Settings, BarChart3, FolderOpen } from 'lucide-react';

/**
 * Airbnb风格主布局组件
 * 包含顶部导航和内容区域
 */
export const MainLayout: React.FC = () => {
  const location = useLocation();

  // 导航菜单项
  const navItems = [
    { path: '/', label: '首页', icon: Home },
    { path: '/management', label: '管理', icon: FolderOpen },
    { path: '/statistics', label: '统计', icon: BarChart3 },
    { path: '/settings', label: '设置', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* 顶部时间展示 */}
      <Header />
      
      {/* 导航栏 */}
      <nav className="bg-white sticky top-0 z-10 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    relative flex items-center space-x-2 px-4 py-4 transition-all duration-300
                    ${isActive
                      ? 'text-[#FF5A5F]'
                      : 'text-gray-500 hover:text-gray-800'
                    }
                  `}
                >
                  {/* 底部边框 */}
                  <div 
                    className={`
                      absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-300
                      ${isActive 
                        ? 'bg-[#FF5A5F]' 
                        : 'bg-transparent'
                      }
                    `}
                  />
                  
                  <Icon className="w-5 h-5 relative z-10" />
                  <span className="font-medium relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* 内容区域 */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};
