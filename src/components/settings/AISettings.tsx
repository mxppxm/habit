import React, { useState } from "react";
import { validateApiKey } from "../../services/aiService";
import { Brain, Zap, Key, Eye, EyeOff, Save, Check } from "lucide-react";

interface AISettingsProps {
  aiEnabled: boolean;
  setAIEnabled: (enabled: boolean) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
}

export const AISettings: React.FC<AISettingsProps> = ({
  aiEnabled,
  setAIEnabled,
  apiKey,
  setApiKey,
}) => {
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeySaved, setApiKeySaved] = useState(false);

  const handleSaveApiKey = () => {
    setApiKey(tempApiKey);
    setApiKeySaved(true);
    setTimeout(() => setApiKeySaved(false), 2000);
  };

  return (
    <div className="card p-6 sm:p-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center">
          <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
            AI 功能设置
          </h2>
          <p className="text-sm sm:text-base text-gray-500">
            控制是否显示 AI 智能习惯生成功能
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-800 flex items-center space-x-2">
              <Brain className="w-5 h-5 text-purple-600" />
              <span>AI 智能习惯生成</span>
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              开启后，在目标管理页面会显示"🧠
              AI生成"按钮，可生成个性化习惯建议
            </p>
          </div>
          <button
            onClick={() => setAIEnabled(!aiEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
              aiEnabled ? "bg-purple-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                aiEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {aiEnabled && (
          <>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Zap className="w-3 h-3 text-purple-600" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-purple-800">
                    AI 功能已启用
                  </h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• 在管理页面的目标卡片上会显示"🧠 AI生成"按钮</li>
                    <li>• 点击后可根据目标生成10个个性化习惯建议</li>
                    <li>
                      • 支持配置 Google Gemini API Key 获得更个性化的建议
                    </li>
                    <li>• 未配置 API Key 时会使用通用示例</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* API Key 配置 */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start space-x-3 mb-4">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Key className="w-3 h-3 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-blue-800">
                    Google Gemini API 配置
                  </h4>
                  <p className="text-xs text-blue-600 mt-1">
                    {apiKey
                      ? "已配置 API Key"
                      : "未配置 API Key，将使用通用示例"}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={tempApiKey}
                    onChange={(e) => {
                      setTempApiKey(e.target.value);
                      setApiKeySaved(false);
                    }}
                    placeholder="输入 Google Gemini API Key (AIza...)"
                    className="w-full px-3 py-2 pr-10 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showApiKey ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-blue-600">
                    {tempApiKey && validateApiKey(tempApiKey)
                      ? "✓ API Key 格式正确"
                      : tempApiKey
                      ? "⚠ API Key 格式不正确"
                      : "请输入您的 API Key"}
                  </p>
                  <button
                    onClick={handleSaveApiKey}
                    disabled={!tempApiKey || tempApiKey === apiKey}
                    className={`inline-flex items-center space-x-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                      apiKeySaved
                        ? "bg-green-500 text-white"
                        : !tempApiKey || tempApiKey === apiKey
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    {apiKeySaved ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>已保存</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3 h-3" />
                        <span>保存 API Key</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-blue-100 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <Key className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-700">
                      <p className="font-medium mb-1">如何获取 API Key？</p>
                      <ol className="space-y-1">
                        <li>1. 访问 Google AI Studio</li>
                        <li>2. 登录您的 Google 账号</li>
                        <li>3. 创建新的 API Key</li>
                        <li>4. 复制 Key 粘贴到此处</li>
                      </ol>
                      <p className="mt-2 font-medium">
                        注意：API Key 仅保存在本地，不会上传到任何服务器
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {!aiEnabled && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Brain className="w-3 h-3 text-gray-500" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-600">
                  AI 功能已关闭
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  开启后可使用智能习惯生成功能
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
