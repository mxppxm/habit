import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHabitStore } from "../stores/useHabitStore";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import {
  Download,
  Upload,
  Trash2,
  FileText,
  AlertTriangle,
  Check,
  Loader2,
} from "lucide-react";

// 自定义文件上传组件
const FileUpload: React.FC<{
  onFileSelect: (file: File) => void;
  accept?: string;
  children: React.ReactNode;
}> = ({ onFileSelect, accept = ".json", children }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <label className="relative cursor-pointer">
      <input
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      {children}
    </label>
  );
};

const Settings: React.FC = () => {
  const { clearAll } = useHabitStore();
  const navigate = useNavigate();
  const [exportData, setExportData] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [clearLoading, setClearLoading] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  // 移除了导出数据的快捷键功能

  // 导出数据
  const handleExport = () => {
    const json = JSON.stringify(
      {
        categories: useHabitStore.getState().categories,
        habits: useHabitStore.getState().habits,
        habitLogs: useHabitStore.getState().habitLogs,
      },
      null,
      2
    );

    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "habit-tracker-data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // 处理文件选择
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result as string);
        setExportData(JSON.stringify(json, null, 2));
      } catch (err) {
        console.error("Invalid JSON file");
        setSelectedFile(null);
        setExportData("");
      }
    };
    reader.readAsText(file);
  };

  // 确认导入 - 增量覆盖
  const confirmImport = async () => {
    setImportLoading(true);
    setImportSuccess(false);

    try {
      const data = JSON.parse(exportData);
      const {
        categories,
        habitLogs,
        insertCategory,
        updateCategory,
        insertHabit,
        updateHabit,
        checkinHabit,
      } = useHabitStore.getState();

      // 导入分类 - 增量覆盖
      if (data.categories && Array.isArray(data.categories)) {
        for (const importCategory of data.categories) {
          const existingCategory = categories.find(
            (c) => c.id === importCategory.id
          );
          if (existingCategory) {
            // 更新现有分类
            await updateCategory(importCategory.id, importCategory.name);
          } else {
            // 添加新分类，保持原有ID
            await insertCategory(importCategory);
          }
        }
      }

      // 重新获取最新的分类和习惯数据
      const updatedState = useHabitStore.getState();

      // 导入习惯 - 增量覆盖
      if (data.habits && Array.isArray(data.habits)) {
        for (const importHabit of data.habits) {
          const existingHabit = updatedState.habits.find(
            (h) => h.id === importHabit.id
          );
          if (existingHabit) {
            // 更新现有习惯
            await updateHabit(
              importHabit.id,
              importHabit.name,
              importHabit.reminderTime
            );
          } else {
            // 添加新习惯，保持原有ID和关联关系
            await insertHabit(importHabit);
          }
        }
      }

      // 导入打卡记录 - 只添加不存在的记录
      if (data.habitLogs && Array.isArray(data.habitLogs)) {
        for (const importLog of data.habitLogs) {
          const existingLog = habitLogs.find(
            (log) =>
              log.id === importLog.id ||
              (log.habitId === importLog.habitId &&
                Math.abs(
                  new Date(log.timestamp).getTime() -
                    new Date(importLog.timestamp).getTime()
                ) < 60000) // 1分钟内的记录视为重复
          );
          if (!existingLog) {
            // 只添加不存在的打卡记录
            await checkinHabit(importLog.habitId, importLog.note);
          }
        }
      }

      setImportSuccess(true);
      setExportData("");
      setSelectedFile(null);

      // 重新从 IndexedDB 加载数据到 store
      const { init } = useHabitStore.getState();
      await init();

      // 1秒后跳转到首页
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      console.error("Failed to import data:", err);
      setImportLoading(false);
    }
  };

  // 处理清空数据
  const handleClearAll = async () => {
    setClearLoading(true);
    setClearSuccess(false);

    try {
      await clearAll();
      setClearSuccess(true);

      // 1秒后跳转到首页
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      console.error("Failed to clear data:", err);
      setClearLoading(false);
    }
  };

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
      {/* 导出数据 */}
      <div className="card p-6 sm:p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
            <Download className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
              导出数据
            </h2>
            <p className="text-sm sm:text-base text-gray-500">
              备份您的习惯数据到本地文件
            </p>
          </div>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
        >
          <Download className="w-5 h-5" />
          <span>导出为JSON</span>
        </button>
      </div>

      {/* 导入数据 */}
      <div className="card p-6 sm:p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
            <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
              导入数据
            </h2>
            <p className="text-sm sm:text-base text-gray-500">
              从备份文件增量导入您的习惯数据
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <FileUpload onFileSelect={handleFileSelect}>
            <div
              className={`group border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                selectedFile
                  ? "border-green-300 bg-green-50"
                  : "border-gray-300 hover:border-green-400 hover:bg-gray-50"
              }`}
            >
              <div className="flex flex-col items-center space-y-3">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                    selectedFile
                      ? "bg-green-500"
                      : "bg-gray-100 group-hover:bg-green-100"
                  }`}
                >
                  {selectedFile ? (
                    <FileText className="w-8 h-8 text-white" />
                  ) : (
                    <Upload className="w-8 h-8 text-gray-400 group-hover:text-green-500" />
                  )}
                </div>
                <div>
                  {selectedFile ? (
                    <>
                      <p className="text-lg font-medium text-green-700">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-green-600">
                        文件已选择，点击下方按钮导入
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-medium text-gray-700">
                        选择备份文件
                      </p>
                      <p className="text-sm text-gray-500">支持JSON格式文件</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </FileUpload>

          {exportData && (
            <AlertDialog.Root>
              <AlertDialog.Trigger asChild>
                <button className="w-full inline-flex items-center justify-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-200 shadow-md hover:shadow-lg font-medium">
                  <Upload className="w-5 h-5" />
                  <span>确认导入数据</span>
                </button>
              </AlertDialog.Trigger>
              <AlertDialog.Portal>
                <AlertDialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
                <AlertDialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl z-50">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <AlertDialog.Title className="text-xl font-semibold text-gray-800">
                        确认导入数据
                      </AlertDialog.Title>
                    </div>
                  </div>
                  <AlertDialog.Description className="text-gray-600 mb-6">
                    导入数据将<strong>增量覆盖</strong>
                    现有数据。相同ID的数据会被更新，新数据会被添加，现有数据不会被删除。请确认是否继续？
                  </AlertDialog.Description>
                  <div className="flex justify-end space-x-3">
                    <AlertDialog.Cancel asChild>
                      <button className="px-6 py-2.5 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium">
                        取消
                      </button>
                    </AlertDialog.Cancel>
                    <button
                      onClick={confirmImport}
                      disabled={importLoading}
                      className={`px-6 py-2.5 text-white rounded-xl transition-colors duration-200 font-medium shadow-md hover:shadow-lg flex items-center space-x-2 ${
                        importSuccess
                          ? "bg-blue-500 hover:bg-blue-600"
                          : importLoading
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-500 hover:bg-green-600"
                      }`}
                    >
                      {importLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>导入中...</span>
                        </>
                      ) : importSuccess ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>导入成功</span>
                        </>
                      ) : (
                        <span>确认导入</span>
                      )}
                    </button>
                  </div>
                </AlertDialog.Content>
              </AlertDialog.Portal>
            </AlertDialog.Root>
          )}
        </div>
      </div>

      {/* 清空数据 */}
      <div className="card p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">清空数据</h2>
            <p className="text-gray-500">永久删除所有习惯数据，请谨慎操作</p>
          </div>
        </div>

        <AlertDialog.Root>
          <AlertDialog.Trigger asChild>
            <button className="inline-flex items-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg font-medium">
              <Trash2 className="w-5 h-5" />
              <span>清空所有数据</span>
            </button>
          </AlertDialog.Trigger>
          <AlertDialog.Portal>
            <AlertDialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
            <AlertDialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl z-50">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <AlertDialog.Title className="text-xl font-semibold text-gray-800">
                    确认清空数据
                  </AlertDialog.Title>
                </div>
              </div>
              <AlertDialog.Description className="text-gray-600 mb-6">
                此操作将<strong>永久删除</strong>
                所有分类、习惯项目和打卡记录。删除后无法恢复，请确认是否继续？
              </AlertDialog.Description>
              <div className="flex justify-end space-x-3">
                <AlertDialog.Cancel asChild>
                  <button className="px-6 py-2.5 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium">
                    取消
                  </button>
                </AlertDialog.Cancel>
                <button
                  onClick={handleClearAll}
                  disabled={clearLoading}
                  className={`px-6 py-2.5 text-white rounded-xl transition-colors duration-200 font-medium shadow-md hover:shadow-lg flex items-center space-x-2 ${
                    clearSuccess
                      ? "bg-green-500 hover:bg-green-600"
                      : clearLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  {clearLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>清空中...</span>
                    </>
                  ) : clearSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>清空成功</span>
                    </>
                  ) : (
                    <span>确认清空</span>
                  )}
                </button>
              </div>
            </AlertDialog.Content>
          </AlertDialog.Portal>
        </AlertDialog.Root>
      </div>
    </div>
  );
};

export default Settings;
