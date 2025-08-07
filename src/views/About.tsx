import React from "react";
import {
  Heart,
  Shield,
  Target,
  Download,
  Upload,
  BarChart3,
  Calendar,
  Github,
  Coffee,
  Crown,
  Compass,
  Zap,
  Award,
  Brain,
  Sparkles,
  Lightbulb,
} from "lucide-react";

/**
 * 关于页面 - 习惯的力量，目标的实现
 */
const About: React.FC = () => {
  const corePhilosophy = [
    {
      icon: <Crown className="w-8 h-8" />,
      title: "目标是习惯的领导",
      description: "清晰的目标指引方向，明确的愿景激发行动力",
      color: "from-yellow-500 to-amber-600",
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "习惯是目标的支撑",
      description: "日复一日的坚持，微小行动的复利效应",
      color: "from-blue-500 to-indigo-600",
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "成功是习惯的必然",
      description: "不是偶然的运气，而是必然的结果",
      color: "from-emerald-500 to-teal-600",
    },
  ];

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI 智能建议",
      description: "根据目标智能生成个性化习惯建议，科学高效",
      color: "from-purple-500 to-violet-600",
      isNew: true,
    },
    {
      icon: <Compass className="w-6 h-6" />,
      title: "目标导向管理",
      description: "以终为始，将大目标分解为可执行的每日习惯",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "习惯养成追踪",
      description: "记录每一次行动，见证习惯的力量",
      color: "from-green-500 to-green-600",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "成长数据洞察",
      description: "量化进步，用数据证明习惯的复利效应",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "智能激励系统",
      description: "适时提醒，保持动力，让坚持成为自然",
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "数据安全保障",
      description: "本地存储，隐私保护，您的数据只属于您",
      color: "from-emerald-500 to-emerald-600",
    },
  ];

  const stats = [
    {
      label: "AI 增强",
      value: "智能建议",
      icon: <Brain className="w-5 h-5" />,
    },
    { label: "数据安全", value: "100%", icon: <Shield className="w-5 h-5" /> },
    {
      label: "隐私保护",
      value: "本地存储",
      icon: <Heart className="w-5 h-5" />,
    },
    {
      label: "开源免费",
      value: "完全免费",
      icon: <Github className="w-5 h-5" />,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12 px-4">
      {/* 主标题部分 */}
      <div className="text-center space-y-4 sm:space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#FF5A5F] to-[#FF7E82] rounded-3xl shadow-lg">
          <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            习惯的力量
          </h1>
        </div>
      </div>

      {/* 核心理念 */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">核心理念</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            习惯的力量源于目标的指引，成功的必然来自坚持的积累
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {corePhilosophy.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
            >
              <div className="text-center space-y-4">
                <div
                  className={`w-20 h-20 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg`}
                >
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 统计数据 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow duration-300"
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
            从目标设定到习惯养成，从数据洞察到隐私保护，助您实现人生蜕变
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative"
            >
              {feature.isNew && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full shadow-lg flex items-center space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>NEW</span>
                </div>
              )}
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

      {/* 设计理念 */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          设计理念
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
              <Brain className="w-5 h-5 mr-2 text-[#FF5A5F]" />
              AI 赋能习惯
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li>• 智能分析目标，生成个性化习惯建议</li>
              <li>• 多维度覆盖，从易到难科学规划</li>
              <li>• 本地化适配，贴合中国用户场景</li>
              <li>• 即使无AI，也有通用示例支持</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
              <Target className="w-5 h-5 mr-2 text-[#FF5A5F]" />
              习惯驱动成功
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li>• 将远大目标分解为可执行的微习惯</li>
              <li>• 通过日积月累的坚持实现质的飞跃</li>
              <li>• 用数据见证习惯的复利效应</li>
              <li>• 让成功成为必然而非偶然</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-[#FF5A5F]" />
              隐私安全至上
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li>• 所有数据都保存在您的设备上</li>
              <li>• API Key 本地存储，保护隐私</li>
              <li>• 无需注册账号，保护个人信息</li>
              <li>• 可以离线使用，无需联网</li>
            </ul>
          </div>
        </div>
      </div>

      {/* AI 功能亮点 */}
      <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-8 border border-purple-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            AI 智能习惯生成
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            基于先进的 AI 技术，为您的每个目标量身定制科学的习惯养成路径
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-purple-600" />
              智能特性
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                <div>
                  <h4 className="font-medium text-gray-800">个性化建议</h4>
                  <p className="text-sm text-gray-600">
                    根据目标名称生成10个贴合的习惯建议
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                <div>
                  <h4 className="font-medium text-gray-800">科学分级</h4>
                  <p className="text-sm text-gray-600">
                    智能分类简单、中等、困难三个难度等级
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                <div>
                  <h4 className="font-medium text-gray-800">本地化适配</h4>
                  <p className="text-sm text-gray-600">
                    专为中国用户的生活场景优化
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                <div>
                  <h4 className="font-medium text-gray-800">多维度覆盖</h4>
                  <p className="text-sm text-gray-600">
                    涵盖行为、心态、技能、健康等各个方面
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
              使用体验
            </h3>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold">
                    1
                  </div>
                  <span className="text-gray-700">
                    在目标卡片点击"🧠 AI生成"
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold">
                    2
                  </div>
                  <span className="text-gray-700">AI 分析目标并生成建议</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold">
                    3
                  </div>
                  <span className="text-gray-700">
                    选择喜欢的习惯添加到列表
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold">
                    4
                  </div>
                  <span className="text-gray-700">开始执行并记录成长</span>
                </div>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                💡 <strong>贴心提示：</strong> 即使没有配置 API
                Key，也能使用通用示例功能
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 实践指南 */}
      <div className="bg-white rounded-2xl p-8 shadow-md">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          习惯养成指南
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">明确目标</h3>
            <p className="text-gray-600 text-sm">
              先设定清晰的长远目标，然后分解为具体的日常习惯行动
            </p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">从小做起</h3>
            <p className="text-gray-600 text-sm">
              选择 2-3 个核心微习惯开始，让坚持变得轻松自然
            </p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">见证成长</h3>
            <p className="text-gray-600 text-sm">
              用数据记录每一次进步，让习惯的复利效应清晰可见
            </p>
          </div>
        </div>
      </div>

      {/* 数据安全保障 */}
      <div className="bg-gradient-to-r from-[#FF5A5F] to-[#FF7E82] rounded-2xl p-8 text-white">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Shield className="w-6 h-6" />
            <Download className="w-6 h-6" />
            <Upload className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold">数据安全保障</h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            您的习惯数据完全属于您自己 • 本地存储确保隐私安全 • 支持随时备份导出
            • 轻松恢复历史数据 • 让您专注于习惯养成而无后顾之忧
          </p>
        </div>
      </div>

      {/* 版本信息 */}
      <div className="text-center space-y-4 py-8 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-4 text-gray-500">
          <div className="flex items-center space-x-2">
            <Coffee className="w-5 h-5" />
            <span>专为习惯养成而生</span>
          </div>
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5" />
            <span>AI 智能增强</span>
          </div>
        </div>
        <p className="text-sm text-gray-400">
          Version 2.0.0 • AI 驱动的智能习惯管理系统
        </p>
      </div>
    </div>
  );
};

export default About;
