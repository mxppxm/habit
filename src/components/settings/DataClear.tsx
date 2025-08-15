import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHabitStore } from "../../stores/useHabitStore";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Trash2, AlertTriangle, Check, Loader2 } from "lucide-react";

export const DataClear: React.FC = () => {
  const { clearAll } = useHabitStore();
  const navigate = useNavigate();
  const [clearLoading, setClearLoading] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);

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
              所有目标、习惯项目和打卡记录。删除后无法恢复，请确认是否继续？
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
  );
};
