import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useHabitStore } from "../../stores/useHabitStore";
import {
  Cloud,
  Wifi,
  WifiOff,
  Upload,
  Download,
  Settings,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface SyncSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface LeanAuthFormProps {
  onAuth: (email: string, password: string) => Promise<void>;
  isBusy: boolean;
}

const LeanAuthForm: React.FC<LeanAuthFormProps> = ({ onAuth, isBusy }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!email.trim() || !password) {
      setError("请输入邮箱和密码");
      return;
    }
    try {
      await onAuth(email.trim(), password);
      // 成功后立刻清空密码，避免在内存中驻留
      setPassword("");
    } catch (e: any) {
      setError(e?.message || "登录失败");
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">
        LeanCloud 登录（未注册将自动注册）
      </label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="邮箱"
        autoComplete="username"
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="密码"
        autoComplete="current-password"
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {error && <div className="text-xs text-red-600">{error}</div>}
      <button
        onClick={handleSubmit}
        disabled={isBusy}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isBusy ? "处理中..." : "登录 / 注册"}
      </button>
    </div>
  );
};

export const SyncSettingsDialog: React.FC<SyncSettingsDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const {
    syncEnabled,
    lastSyncTime,
    isSyncing,
    syncError,
    isOnline,
    setSyncEnabled,
    syncToCloud,
    syncFromCloud,
    leanAuthenticated,
    leanEmail,
    leanRegisterOrLogin,
    leanLogout,
    clearRemoteAndLogout,
    checkSyncOnboarding,
    mergeCloudAndLocal,
    repairCloudData,
  } = useHabitStore();

  // Firebase 已移除，保留变量兼容但不使用
  const [_localUserId, _setLocalUserId] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // 同步ID相关逻辑已移除
  // 同步ID逻辑已移除

  const handleSyncUp = async () => {
    try {
      await syncToCloud();
    } catch (error) {
      // 错误已经在 store 中处理
    }
  };

  const handleSyncDown = async () => {
    try {
      await syncFromCloud();
    } catch (error) {
      // 错误已经在 store 中处理
    }
  };

  const formatSyncTime = (timestamp: number) => {
    if (!timestamp) return "从未同步";
    return new Date(timestamp).toLocaleString("zh-CN");
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 w-full max-w-[500px] mx-4 shadow-2xl z-50">
          <div className="mb-6">
            <Dialog.Title className="flex items-center gap-2 text-xl font-semibold text-gray-800">
              <Cloud className="h-5 w-5" />
              多端同步设置
            </Dialog.Title>
          </div>

          <div className="space-y-6">
            {/* 网络状态 */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
              {isOnline ? (
                <>
                  <Wifi className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">网络已连接</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-600">网络未连接</span>
                </>
              )}
            </div>

            {/* 同步开关 */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">启用多端同步</h3>
                <p className="text-sm text-gray-600">
                  在多个设备间同步您的习惯数据
                </p>
              </div>
              <button
                onClick={() => setSyncEnabled(!syncEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  syncEnabled ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    syncEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {syncEnabled && (
              <>
                {/* 仅 LeanCloud 模式 */}

                {/* LeanCloud 登录/注册 */}
                {
                  <div className="space-y-3">
                    {!leanAuthenticated ? (
                      <LeanAuthForm
                        onAuth={leanRegisterOrLogin}
                        isBusy={isSyncing}
                      />
                    ) : (
                      <div className="p-3 rounded-lg bg-gray-50">
                        <div className="text-sm text-gray-700 mb-2">
                          已登录：{leanEmail}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={handleSyncUp}
                            disabled={isSyncing || !isOnline}
                            className="px-3 py-1 text-sm rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            同步本地→云端
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                const r = await checkSyncOnboarding();
                                if (r.remoteEmpty && r.hasLocal) {
                                  await handleSyncUp();
                                } else if (!r.remoteEmpty && !r.hasLocal) {
                                  await handleSyncDown();
                                } else if (!r.remoteEmpty && r.hasLocal) {
                                  await mergeCloudAndLocal();
                                }
                              } catch {
                                /* 已在 store 处理 */
                              }
                            }}
                            disabled={isSyncing || !isOnline}
                            className="px-3 py-1 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            首次同步引导
                          </button>
                          <button
                            onClick={leanLogout}
                            className="px-3 py-1 text-sm rounded-md border border-gray-300 hover:bg-gray-100"
                          >
                            退出登录
                          </button>
                          <button
                            onClick={clearRemoteAndLogout}
                            className="px-3 py-1 text-sm rounded-md border border-red-300 text-red-600 hover:bg-red-50"
                          >
                            注销并清空云端
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                await repairCloudData();
                              } catch {}
                            }}
                            className="px-3 py-1 text-sm rounded-md border border-purple-300 text-purple-700 hover:bg-purple-50"
                          >
                            修复云端数据
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                }

                {leanAuthenticated && (
                  <>
                    {/* 同步状态 */}
                    <div className="p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">同步状态</span>
                        {isSyncing ? (
                          <div className="flex items-center gap-1 text-blue-600">
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm">同步中...</span>
                          </div>
                        ) : syncError ? (
                          <div className="flex items-center gap-1 text-red-600">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm">同步失败</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm">同步正常</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-600">
                        上次同步: {formatSyncTime(lastSyncTime)}
                      </p>
                      {syncError && (
                        <p className="text-xs text-red-600 mt-1">
                          错误: {syncError}
                        </p>
                      )}
                    </div>

                    {/* 手动同步按钮 */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={handleSyncUp}
                        disabled={!isOnline || isSyncing}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Upload className="h-4 w-4" />
                        上传到云端
                      </button>
                      <button
                        onClick={handleSyncDown}
                        disabled={!isOnline || isSyncing}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Download className="h-4 w-4" />
                        从云端下载
                      </button>
                    </div>

                    {/* 高级设置 */}
                    <div>
                      <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
                      >
                        <Settings className="h-4 w-4" />
                        高级设置
                      </button>

                      {showAdvanced && (
                        <div className="mt-3 p-3 border rounded-lg space-y-2">
                          <div className="text-xs text-gray-600">
                            <p>
                              <strong>LeanCloud 用户:</strong>{" "}
                              {leanEmail || "未登录"}
                            </p>
                            <p>
                              <strong>自动同步:</strong>{" "}
                              {syncEnabled ? "已启用" : "已禁用"}
                            </p>
                            <p>
                              <strong>网络状态:</strong>{" "}
                              {isOnline ? "在线" : "离线"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
