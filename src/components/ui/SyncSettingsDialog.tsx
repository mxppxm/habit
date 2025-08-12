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

export const SyncSettingsDialog: React.FC<SyncSettingsDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const {
    syncEnabled,
    syncUserId,
    lastSyncTime,
    isSyncing,
    syncError,
    isOnline,
    setSyncEnabled,
    setSyncUserId,
    syncToCloud,
    syncFromCloud,
  } = useHabitStore();

  const [localUserId, setLocalUserId] = useState(syncUserId);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSaveUserId = () => {
    if (localUserId.trim()) {
      setSyncUserId(localUserId.trim());
    }
  };

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
                {/* 用户ID设置 */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium">
                    同步ID (用于识别您的设备)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={localUserId}
                      onChange={(e) => setLocalUserId(e.target.value)}
                      placeholder="输入您的同步ID"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleSaveUserId}
                      disabled={
                        !localUserId.trim() || localUserId === syncUserId
                      }
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      保存
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    在其他设备上使用相同的同步ID即可实现数据同步
                  </p>
                </div>

                {syncUserId && (
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
                              <strong>同步ID:</strong> {syncUserId}
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

            {/* 使用说明 */}
            <div className="p-3 rounded-lg bg-blue-50 border-l-4 border-blue-400">
              <h4 className="text-sm font-medium text-blue-800 mb-1">
                使用说明
              </h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• 设置同步ID后，在其他设备使用相同ID即可同步数据</li>
                <li>
                  • 首次同步建议先"上传到云端"，然后在其他设备"从云端下载"
                </li>
                <li>• 启用自动同步后，数据会实时同步到所有设备</li>
                <li>• 网络断开时会自动暂停同步，恢复后会继续</li>
              </ul>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
