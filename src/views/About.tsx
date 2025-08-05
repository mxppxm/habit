import React from "react";
import {
  Heart,
  Shield,
  Target,
  TrendingUp,
  Download,
  Upload,
  Bell,
  BarChart3,
  Calendar,
  Star,
  Github,
  Coffee,
} from "lucide-react";

/**
 * 关于页面 - 介绍应用的更多信息
 */
const About: React.FC = () => {
  const features = [
    {
      icon: <Target className="w-6 h-6" />,
      title: "智能习惯管理",
      description: "创建分类、设置提醒，系统化管理您的所有习惯项目",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "每日打卡记录",
      description: "简单点击即可打卡，支持添加备注记录心得体会",
      color: "from-green-500 to-green-600",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "数据统计分析",
      description: "直观的图表展示，帮您了解习惯养成进度和趋势",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "智能提醒功能",
      description: "自定义提醒时间，让习惯养成变得更加轻松自然",
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "本地数据存储",
      description: "所有数据安全存储在您的设备上，保护隐私完全可控",
      color: "from-emerald-500 to-emerald-600",
    },
    {
      icon: <Download className="w-6 h-6" />,
      title: "数据导入导出",
      description: "支持JSON格式备份，随时导出导入您的习惯数据",
      color: "from-pink-500 to-pink-600",
    },
  ];

  const stats = [
    { label: "数据安全", value: "100%", icon: <Shield className="w-5 h-5" /> },
    {
      label: "隐私保护",
      value: "本地存储",
      icon: <Heart className="w-5 h-5" />,
    },
    { label: "离线使用", value: "支持", icon: <Star className="w-5 h-5" /> },
    {
      label: "免费使用",
      value: "完全免费",
      icon: <Github className="w-5 h-5" />,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* 主标题部分 */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#FF5A5F] to-[#FF7E82] rounded-3xl shadow-lg">
          <Target className="w-10 h-10 text-white" />
        </div>
        <div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Habit Tracker
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            一个简单易用的习惯追踪工具，帮助您建立并维持良好的生活习惯，所有数据安全保存在您的设备上
          </p>
        </div>
      </div>

      {/* 统计数据 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="text-[#FF5A5F]">{stat.icon}</div>
              <span className="text-sm font-medium text-gray-500">
                {stat.label}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* 核心功能 */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">核心功能</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            为您提供完整的习惯管理解决方案，从创建到追踪，从统计到备份
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-white`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 产品优势 */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          产品优势
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-[#FF5A5F]" />
              隐私安全
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li>• 所有数据都保存在您的设备上</li>
              <li>• 数据经过加密保护，确保安全</li>
              <li>• 无需注册账号，保护个人信息</li>
              <li>• 可以离线使用，无需联网</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-[#FF5A5F]" />
              使用体验
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li>• 界面简洁美观，操作简单易懂</li>
              <li>• 启动速度快，运行流畅稳定</li>
              <li>• 可以安装到桌面，像本地应用一样使用</li>
              <li>• 支持手机、平板、电脑等各种设备</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 使用建议 */}
      <div className="bg-white rounded-2xl p-8 shadow-md">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          使用建议
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">设定目标</h3>
            <p className="text-gray-600 text-sm">
              选择 2-3 个核心习惯开始，避免一次性设定过多目标导致难以坚持
            </p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto">
              <Bell className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">设置提醒</h3>
            <p className="text-gray-600 text-sm">
              为每个习惯设置合适的提醒时间，让应用在最佳时机提醒您完成习惯
            </p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">定期回顾</h3>
            <p className="text-gray-600 text-sm">
              查看统计数据了解进度，及时调整策略，保持习惯养成的正向反馈
            </p>
          </div>
        </div>
      </div>

      {/* 数据管理说明 */}
      <div className="bg-gradient-to-r from-[#FF5A5F] to-[#FF7E82] rounded-2xl p-8 text-white">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Download className="w-6 h-6" />
            <Upload className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold">数据备份与恢复</h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            您可以在设置页面随时导出您的习惯数据为 JSON 文件进行备份，
            也可以导入之前的备份文件恢复数据，确保数据安全无忧
          </p>
        </div>
      </div>

      {/* 版本信息 */}
      <div className="text-center space-y-4 py-8 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-2 text-gray-500">
          <Coffee className="w-5 h-5" />
          <span>用 ❤️ 制作</span>
        </div>
        <p className="text-sm text-gray-400">
          Version 1.0.0 • 简单易用的习惯管理工具
        </p>
      </div>
    </div>
  );
};

export default About;
