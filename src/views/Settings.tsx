import React, { useMemo, useState } from "react";
import { useHabitStore } from "../stores/useHabitStore";
import { SyncSettingsDialog } from "../components/ui/SyncSettingsDialog";
import { ReminderSettings } from "../components/settings/ReminderSettings";
import { AISettings } from "../components/settings/AISettings";
import { DataExportImport } from "../components/settings/DataExportImport";
import { DataClear } from "../components/settings/DataClear";
import { Bell, Cloud, Cpu, Database, Keyboard, Trash2 } from "lucide-react";

type SettingsSection =
  | "reminder"
  | "sync"
  | "ai"
  | "data"
  | "danger"
  | "shortcuts";

const Settings: React.FC = () => {
  const {
    dailyReminder,
    setDailyReminderEnabled,
    setDailyReminderTime,
    aiEnabled,
    setAIEnabled,
    apiKey,
    setApiKey,
    showDashboardAIIcon,
    setShowDashboardAIIcon,
  } = useHabitStore();

  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("reminder");

  const navItems = useMemo(
    () => [
      { key: "reminder" as const, label: "提醒设置", icon: Bell },
      { key: "sync" as const, label: "多端同步", icon: Cloud },
      { key: "ai" as const, label: "AI 设置", icon: Cpu },
      { key: "data" as const, label: "数据导入导出", icon: Database },
      { key: "danger" as const, label: "清空数据", icon: Trash2 },
      { key: "shortcuts" as const, label: "快捷键", icon: Keyboard },
    ],
    []
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
      {/* 左侧导航 */}
      <aside className="md:col-span-3 lg:col-span-3">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                className={
                  "w-full flex items-center space-x-3 px-3 py-2 rounded-xl border transition-colors " +
                  (isActive
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "bg-white border-gray-200 hover:bg-gray-50 text-gray-700")
                }
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* 右侧内容 */}
      <section className="md:col-span-9 lg:col-span-9 space-y-6 sm:space-y-8">
        {activeSection === "shortcuts" && (
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
        )}

        {activeSection === "reminder" && (
          <ReminderSettings
            dailyReminder={dailyReminder}
            onReminderEnabledChange={setDailyReminderEnabled}
            onReminderTimeChange={setDailyReminderTime}
          />
        )}

        {activeSection === "sync" && (
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
        )}

        {activeSection === "ai" && (
          <AISettings
            aiEnabled={aiEnabled}
            setAIEnabled={setAIEnabled}
            apiKey={apiKey}
            setApiKey={setApiKey}
            showDashboardAIIcon={showDashboardAIIcon}
            setShowDashboardAIIcon={setShowDashboardAIIcon}
          />
        )}

        {activeSection === "data" && <DataExportImport />}

        {activeSection === "danger" && <DataClear />}
      </section>

      {/* 同步设置对话框 */}
      <SyncSettingsDialog
        open={syncDialogOpen}
        onOpenChange={setSyncDialogOpen}
      />
    </div>
  );
};

export default Settings;
