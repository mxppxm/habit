import React, { useState } from "react";
import { useHabitStore } from "../stores/useHabitStore";
import { SyncSettingsDialog } from "../components/ui/SyncSettingsDialog";
import { ReminderSettings } from "../components/settings/ReminderSettings";
import { AISettings } from "../components/settings/AISettings";
import { DataExportImport } from "../components/settings/DataExportImport";
import { DataClear } from "../components/settings/DataClear";
import { Cloud } from "lucide-react";

const Settings: React.FC = () => {
  const {
    dailyReminder,
    setDailyReminderEnabled,
    setDailyReminderTime,
    aiEnabled,
    setAIEnabled,
    apiKey,
    setApiKey,
  } = useHabitStore();
  
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 快捷键提示 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">
          🎯 快捷键提示
        </h3>
        <div className="grid grid-cols-1 gap-2 text-sm text-blue-700">
          <div className="flex items-center justify-between">
            <span>页面导航</span>
            <kbd className="px-2 py-1 bg-white border border-blue-200 rounded text-xs font-mono">
              1-5
            </kbd>
          </div>
        </div>
      </div>

      {/* 每日提醒设置 */}
      <ReminderSettings
        dailyReminder={dailyReminder}
        onReminderEnabledChange={setDailyReminderEnabled}
        onReminderTimeChange={setDailyReminderTime}
      />

      {/* 多端同步设置 */}
      <div className="card p-6 sm:p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center">
            <Cloud className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
              多端同步
            </h2>
            <p className="text-sm sm:text-base text-gray-500">
              在多个设备间实时同步您的习惯数据
            </p>
          </div>
        </div>

        <button
          onClick={() => setSyncDialogOpen(true)}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
        >
          <Cloud className="w-5 h-5" />
          <span>同步设置</span>
        </button>
      </div>

      {/* AI 功能设置 */}
      <AISettings
        aiEnabled={aiEnabled}
        setAIEnabled={setAIEnabled}
        apiKey={apiKey}
        setApiKey={setApiKey}
      />

      {/* 数据导入导出 */}
      <DataExportImport />

      {/* 清空数据 */}
      <DataClear />

      {/* 同步设置对话框 */}
      <SyncSettingsDialog
        open={syncDialogOpen}
        onOpenChange={setSyncDialogOpen}
      />
    </div>
  );
};

export default Settings;
