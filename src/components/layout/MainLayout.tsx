import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Header } from "../ui/Header";
import { KeyboardShortcutsHelp } from "../ui/KeyboardShortcutsHelp";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";
import { Home, Settings, BarChart3, FolderOpen, Info } from "lucide-react";

/**
 * Airbnb风格主布局组件
 * 包含顶部导航和内容区域
 */
export const MainLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 导航菜单项
  const navItems = [
    { path: "/", label: "首页", icon: Home, shortcut: "1" },
    { path: "/management", label: "管理", icon: FolderOpen, shortcut: "2" },
    { path: "/statistics", label: "统计", icon: BarChart3, shortcut: "3" },
    { path: "/settings", label: "设置", icon: Settings, shortcut: "4" },
    { path: "/about", label: "关于", icon: Info, shortcut: "5" },
  ];

  // 导航快捷键
  useKeyboardShortcuts(
    navItems.map((item) => ({
      key: item.shortcut,
      handler: () => navigate(item.path),
      preventDefault: true,
    }))
  );

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
      {/* 顶部时间展示 */}
      <Header />

      {/* 导航栏 */}
      <nav className="bg-white sticky top-0 z-10 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex justify-center space-x-2 sm:space-x-8 overflow-x-auto scrollbar-hide">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    relative flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-3 sm:py-4 transition-all duration-300 flex-shrink-0
                    ${
                      isActive
                        ? "text-[#FF5A5F]"
                        : "text-gray-500 hover:text-gray-800"
                    }
                  `}
                >
                  {/* 底部边框 */}
                  <div
                    className={`
                      absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-300
                      ${isActive ? "bg-[#FF5A5F]" : "bg-transparent"}
                    `}
                  />

                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
                  <span className="text-sm sm:text-base font-medium relative z-10">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* 内容区域 */}
      <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8 w-full">
        <div className="h-full">
          <Outlet />
        </div>
      </main>

      {/* 键盘快捷键帮助 */}
      <KeyboardShortcutsHelp />
    </div>
  );
};
