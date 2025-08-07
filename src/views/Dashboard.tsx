import React, { useEffect, useState } from "react";
import { useHabitStore } from "../stores/useHabitStore";
import { useNotification } from "../hooks/useNotification";
import {
  useKeyboardShortcuts,
  formatShortcut,
} from "../hooks/useKeyboardShortcuts";
import { EnhancedDialog } from "../components/ui/EnhancedDialog";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, X, Target, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

/**
 * 首页组件 - 显示所有习惯项目并支持打卡
 */
const Dashboard: React.FC = () => {
  const {
    categories,
    habits,
    habitLogs,
    checkinHabit,
    deleteHabitLog,
    init,
    loading,
  } = useHabitStore();
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const navigate = useNavigate();

  // 使用通知提醒 Hook
  useNotification(habits);

  // 初始化数据
  useEffect(() => {
    init();
  }, [init]);

  // 键盘快捷键
  useKeyboardShortcuts([
    {
      key: "Enter",
      ctrlKey: true,
      metaKey: true,
      handler: () => {
        // 如果有选中的习惯，直接执行打卡
        if (selectedHabitId) {
          handleCheckin();
        }
      },
      enabled: !!selectedHabitId,
    },
  ]);

  /**
   * 处理打卡
   */
  const handleCheckin = async () => {
    if (selectedHabitId) {
      await checkinHabit(selectedHabitId, note);
      setSelectedHabitId(null);
      setNote("");
    }
  };

  /**
   * 检查某个习惯今天是否已打卡
   */
  const isCheckedToday = (habitId: string): boolean => {
    const today = dayjs().startOf("day");
    return habitLogs.some(
      (log) =>
        log.habitId === habitId && dayjs(log.timestamp).isSame(today, "day")
    );
  };

  /**
   * 获取今天的打卡时间
   */
  const getTodayCheckinTime = (habitId: string): string | null => {
    const today = dayjs().startOf("day");
    const todayLog = habitLogs.find(
      (log) =>
        log.habitId === habitId && dayjs(log.timestamp).isSame(today, "day")
    );
    return todayLog ? dayjs(todayLog.timestamp).format("HH:mm:ss") : null;
  };

  /**
   * 获取今天的打卡记录
   */
  const getTodayLogs = (habitId: string) => {
    const today = dayjs().startOf("day");
    return habitLogs.filter(
      (log) =>
        log.habitId === habitId && dayjs(log.timestamp).isSame(today, "day")
    );
  };

  /**
   * 取消今天的所有打卡
   */
  const handleCancelTodayCheckins = async (habitId: string) => {
    const todayLogs = getTodayLogs(habitId);
    for (const log of todayLogs) {
      await deleteHabitLog(log.id);
    }
    setNote("");
  };

  /**
   * 取消最后一次打卡
   */
  const handleCancelLastCheckin = async (habitId: string) => {
    const todayLogs = getTodayLogs(habitId);
    // 按时间排序，获取最后一次打卡记录
    const sortedLogs = todayLogs.sort((a, b) => b.timestamp - a.timestamp);
    if (sortedLogs.length > 0) {
      await deleteHabitLog(sortedLogs[0].id);
    }
    setNote("");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-[#FF5A5F] rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 text-lg">加载习惯数据中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {categories.length > 0 ? (
        categories.map((category) => {
          const categoryHabits = habits.filter(
            (habit) => habit.categoryId === category.id
          );

          if (categoryHabits.length === 0) return null;

          return (
            <div key={category.id} className="card p-4 sm:p-8">
              <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#FF5A5F]"></div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                  {category.name}
                </h2>
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-full">
                  {categoryHabits.length} 个习惯
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {categoryHabits.map((habit) => {
                  const isChecked = isCheckedToday(habit.id);
                  const checkinTime = getTodayCheckinTime(habit.id);

                  return (
                    <div key={habit.id}>
                      <Dialog.Root>
                        <Dialog.Trigger asChild>
                          <div
                            className={`
                            group p-4 sm:p-6 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-105
                            ${
                              isChecked
                                ? "bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 shadow-lg"
                                : "bg-white border-2 border-gray-100 hover:border-[#FF5A5F] hover:shadow-xl"
                            }
                          `}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div
                                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                                  isChecked
                                    ? "bg-green-500 shadow-lg"
                                    : "bg-gray-100 group-hover:bg-[#FF5A5F]"
                                }`}
                              >
                                <span
                                  className={`text-lg sm:text-xl transition-all duration-200 ${
                                    isChecked
                                      ? "text-white"
                                      : "group-hover:text-white"
                                  }`}
                                >
                                  {isChecked ? "✓" : "⏰"}
                                </span>
                              </div>
                              <div className="text-right">
                                {habit.reminderTime && (
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                    {habit.reminderTime}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-800 text-base sm:text-lg leading-tight flex-1">
                                  {habit.name}
                                </h3>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/habit/${habit.id}`);
                                  }}
                                  className="p-1.5 rounded-full hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <Info className="w-4 h-4 text-gray-500" />
                                </button>
                              </div>
                              {(() => {
                                const todayLogsCount = getTodayLogs(
                                  habit.id
                                ).length;
                                if (todayLogsCount > 0) {
                                  return (
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-1">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <p className="text-sm text-green-600 font-medium">
                                          已打卡 {checkinTime}
                                        </p>
                                      </div>
                                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full font-medium">
                                        今日 {todayLogsCount} 次
                                      </span>
                                    </div>
                                  );
                                } else {
                                  return (
                                    <p className="text-sm text-gray-500">
                                      点击打卡
                                    </p>
                                  );
                                }
                              })()}
                            </div>
                          </div>
                        </Dialog.Trigger>
                      </Dialog.Root>

                      <EnhancedDialog
                        open={selectedHabitId === habit.id}
                        onOpenChange={(open) => {
                          if (open) {
                            setSelectedHabitId(habit.id);
                          } else {
                            setSelectedHabitId(null);
                            setNote("");
                          }
                        }}
                        onConfirm={handleCheckin}
                        confirmDisabled={!selectedHabitId}
                      >
                        <div className="flex items-center justify-between mb-6">
                          <Dialog.Title className="text-xl sm:text-2xl font-semibold text-gray-800 leading-tight">
                            {isChecked
                              ? `已打卡: ${habit.name}`
                              : `打卡: ${habit.name}`}
                          </Dialog.Title>
                          <Dialog.Close asChild>
                            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                              <X className="w-5 h-5 text-gray-500" />
                            </button>
                          </Dialog.Close>
                        </div>

                        {isChecked ? (
                          <div>
                            <Dialog.Description className="text-gray-600 mb-4">
                              今天已经打卡 {getTodayLogs(habit.id).length}{" "}
                              次，你可以继续打卡
                              {getTodayLogs(habit.id).length === 1
                                ? "或者取消今天的打卡记录"
                                : "或者取消上一次打卡记录"}
                              。
                            </Dialog.Description>

                            <div className="space-y-4 mb-6">
                              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                <div className="flex items-center space-x-2 mb-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span className="text-sm font-medium text-green-700">
                                    今天的打卡记录
                                  </span>
                                </div>
                                {getTodayLogs(habit.id).map((log, index) => (
                                  <div
                                    key={log.id}
                                    className="text-sm text-green-600 mb-1"
                                  >
                                    #{index + 1}{" "}
                                    {dayjs(log.timestamp).format("HH:mm")} -{" "}
                                    {log.note || "无备注"}
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  继续打卡备注
                                </label>
                                <textarea
                                  value={note}
                                  onChange={(e) => setNote(e.target.value)}
                                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent outline-none transition-all duration-200 resize-none"
                                  placeholder="继续记录今天的感受..."
                                  rows={3}
                                />
                              </div>
                            </div>

                            <div className="flex justify-between space-x-3 mt-8">
                              <button
                                onClick={() => {
                                  const todayLogsCount = getTodayLogs(
                                    habit.id
                                  ).length;
                                  if (todayLogsCount === 1) {
                                    handleCancelTodayCheckins(habit.id);
                                  } else {
                                    handleCancelLastCheckin(habit.id);
                                  }
                                }}
                                className="px-4 py-2.5 text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors duration-200 font-medium"
                              >
                                {getTodayLogs(habit.id).length === 1
                                  ? "取消今天打卡"
                                  : "取消上一次打卡"}
                              </button>
                              <div className="flex space-x-3">
                                <Dialog.Close asChild>
                                  <button className="px-6 py-2.5 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium">
                                    关闭
                                  </button>
                                </Dialog.Close>
                                <button
                                  onClick={handleCheckin}
                                  className="px-6 py-2.5 bg-[#FF5A5F] text-white rounded-xl hover:bg-pink-600 transition-colors duration-200 font-medium shadow-md hover:shadow-lg relative group"
                                >
                                  继续打卡
                                  <span className="text-xs text-pink-200 ml-2 opacity-70">
                                    {formatShortcut({
                                      key: "Enter",
                                      ctrlKey: true,
                                      metaKey: true,
                                    })}
                                  </span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <Dialog.Description className="text-gray-600 mb-4">
                              添加一些备注来记录这次打卡的感受吧
                            </Dialog.Description>

                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  今天的感受
                                </label>
                                <textarea
                                  value={note}
                                  onChange={(e) => setNote(e.target.value)}
                                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent outline-none transition-all duration-200 resize-none"
                                  placeholder="今天完成这个习惯的感受如何？"
                                  rows={4}
                                />
                              </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-8">
                              <Dialog.Close asChild>
                                <button className="px-6 py-2.5 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium">
                                  取消
                                </button>
                              </Dialog.Close>
                              <button
                                onClick={handleCheckin}
                                className="px-6 py-2.5 bg-[#FF5A5F] text-white rounded-xl hover:bg-pink-600 transition-colors duration-200 font-medium shadow-md hover:shadow-lg relative group"
                              >
                                确认打卡
                                <span className="text-xs text-pink-200 ml-2 opacity-70">
                                  {formatShortcut({
                                    key: "Enter",
                                    ctrlKey: true,
                                    metaKey: true,
                                  })}
                                </span>
                              </button>
                            </div>
                          </div>
                        )}
                      </EnhancedDialog>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center py-12 sm:py-16">
          <div className="max-w-md mx-auto px-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 bg-gradient-to-br from-[#FF5A5F] to-pink-400 rounded-full flex items-center justify-center shadow-lg">
              <Target className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3">
              开始你的习惯之旅
            </h3>
            <p className="text-gray-500 text-base sm:text-lg mb-6 leading-relaxed">
              还没有任何习惯项目，创建你的第一个习惯开始打卡吧！
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/management")}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-[#FF5A5F] text-white rounded-xl hover:bg-pink-600 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
              >
                <Plus className="w-5 h-5" />
                <span>创建第一个习惯</span>
              </button>
              <div className="text-sm text-gray-400">
                或者查看
                <button
                  onClick={() => navigate("/about")}
                  className="text-[#FF5A5F] hover:text-pink-600 mx-1 underline"
                >
                  关于页面
                </button>
                了解更多
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
