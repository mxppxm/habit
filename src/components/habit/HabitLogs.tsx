import React, { useState } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Plus, RotateCcw, Edit3, Trash2, AlertTriangle, Clock } from "lucide-react";
import dayjs from "dayjs";

interface HabitLog {
  id: string;
  habitId: string;
  timestamp: Date;
  note: string;
  isMakeup?: boolean;
  originalDate?: Date;
}

interface HabitLogsProps {
  logs: HabitLog[];
  onAddClick: () => void;
  onMakeupClick: () => void;
  onEditLog: (logId: string, note: string) => void;
  onDeleteLog: (logId: string) => void;
  canMakeup: boolean;
}

export const HabitLogs: React.FC<HabitLogsProps> = ({
  logs,
  onAddClick,
  onMakeupClick,
  onEditLog,
  onDeleteLog,
  canMakeup,
}) => {
  const [editingLog, setEditingLog] = useState<string | null>(null);
  const [editNote, setEditNote] = useState("");

  // 按日期分组打卡记录
  const logsByDate = logs.reduce((acc, log) => {
    const date =
      log.isMakeup && log.originalDate
        ? dayjs(log.originalDate).format("YYYY-MM-DD")
        : dayjs(log.timestamp).format("YYYY-MM-DD");
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(log);
    return acc;
  }, {} as Record<string, typeof logs>);

  // 排序日期（最新的在前）
  const sortedDates = Object.keys(logsByDate).sort((a, b) =>
    b.localeCompare(a)
  );

  const handleEditLog = (log: HabitLog) => {
    setEditingLog(log.id);
    setEditNote(log.note);
  };

  const handleSaveEdit = () => {
    if (editingLog) {
      onEditLog(editingLog, editNote);
      setEditingLog(null);
      setEditNote("");
    }
  };

  return (
    <div className="card p-4 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
          打卡记录
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={onMakeupClick}
            className="inline-flex items-center space-x-2 px-3 sm:px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base"
            disabled={!canMakeup}
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">补卡</span>
            <span className="sm:hidden">补卡</span>
          </button>
          <button
            onClick={onAddClick}
            className="inline-flex items-center space-x-2 px-3 sm:px-4 py-2 bg-[#FF5A5F] text-white rounded-lg hover:bg-pink-600 transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">新增打卡</span>
            <span className="sm:hidden">新增</span>
          </button>
        </div>
      </div>

      {sortedDates.length > 0 ? (
        <div className="space-y-4">
          {sortedDates.map((date) => (
            <div
              key={date}
              className="border border-gray-200 rounded-xl p-4 sm:p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-3 h-3 bg-[#FF5A5F] rounded-full"></div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                      {dayjs(date).format("MM月DD日")}
                    </h3>
                    <span className="text-xs sm:text-sm text-gray-500">
                      {dayjs(date).format("dddd")}
                    </span>
                  </div>
                </div>
                <span className="text-xs sm:text-sm text-gray-500">
                  {logsByDate[date].length} 次
                </span>
              </div>

              <div className="space-y-2">
                {logsByDate[date].map((log) => (
                  <div
                    key={log.id}
                    className="p-3 sm:p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                          <span className="text-xs sm:text-sm text-gray-500">
                            {dayjs(log.timestamp).format("HH:mm")}
                          </span>
                          {log.isMakeup && (
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
                              补卡
                            </span>
                          )}
                        </div>
                        {editingLog === log.id ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={editNote}
                              onChange={(e) => setEditNote(e.target.value)}
                              className="flex-1 px-3 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FF5A5F]"
                              placeholder="添加备注..."
                              autoFocus
                            />
                            <button
                              onClick={handleSaveEdit}
                              className="px-3 py-1 bg-[#FF5A5F] text-white text-sm rounded-lg hover:bg-pink-600"
                            >
                              保存
                            </button>
                          </div>
                        ) : (
                          <p className="text-gray-700 text-sm sm:text-base">
                            {log.note || "无备注"}
                          </p>
                        )}
                      </div>
                      {!editingLog && (
                        <div className="flex items-center space-x-1 ml-2">
                          <button
                            onClick={() => handleEditLog(log)}
                            className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <AlertDialog.Root>
                            <AlertDialog.Trigger asChild>
                              <button className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            </AlertDialog.Trigger>
                            <AlertDialog.Portal>
                              <AlertDialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
                              <AlertDialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl z-50">
                                <div className="flex items-center space-x-3 mb-4">
                                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="w-5 h-5 text-red-600" />
                                  </div>
                                  <AlertDialog.Title className="text-lg font-semibold text-gray-800">
                                    确认删除
                                  </AlertDialog.Title>
                                </div>
                                <AlertDialog.Description className="text-gray-600 mb-6">
                                  确定要删除这条打卡记录吗？此操作无法撤销。
                                </AlertDialog.Description>
                                <div className="flex justify-end space-x-3">
                                  <AlertDialog.Cancel asChild>
                                    <button className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                                      取消
                                    </button>
                                  </AlertDialog.Cancel>
                                  <AlertDialog.Action asChild>
                                    <button
                                      onClick={() => onDeleteLog(log.id)}
                                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                    >
                                      删除
                                    </button>
                                  </AlertDialog.Action>
                                </div>
                              </AlertDialog.Content>
                            </AlertDialog.Portal>
                          </AlertDialog.Root>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg mb-2">还没有打卡记录</p>
          <p className="text-gray-400 text-sm">点击"新增打卡"开始记录</p>
        </div>
      )}
    </div>
  );
};
