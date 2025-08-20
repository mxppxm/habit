import React, { useState } from "react";
import { useHabitStore } from "../stores/useHabitStore";

import { formatShortcut } from "../hooks/useKeyboardShortcuts";
import { EnhancedDialog } from "../components/ui/EnhancedDialog";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, X, Target, Info, Sparkles, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import Celebration from "../components/ui/Celebration";
import { useToastContext } from "../components/ui/ToastContainer";

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
    loading,
    aiEnabled,
    showDashboardAIIcon,
    hasCategoryCelebratedToday,
    markCategoryCelebratedToday,
  } = useHabitStore();
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);
  const [bursts, setBursts] = useState<
    Array<{ id: string; x: number; y: number; durationMs?: number }>
  >([]);
  const celebrationDurationMs = 5200;
  const toast = useToastContext();

  const navigate = useNavigate();

  // 通知服务已在 AppInitializer 中启用，这里不需要重复调用

  // 注意：快捷键由 EnhancedDialog 组件处理，这里不需要重复监听

  /**
   * 处理打卡
   */
  const triggerGrandCelebrationIfNeeded = (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;
    const categoryId = habit.categoryId;
    const categoryHabits = habits.filter((h) => h.categoryId === categoryId);
    // 使用最新的日志数据，避免刚打卡后读取到旧值
    const freshLogs = useHabitStore.getState().habitLogs;
    const today = dayjs().startOf("day");
    const allDoneToday = categoryHabits.every((h) =>
      freshLogs.some(
        (log) =>
          log.habitId === h.id && dayjs(log.timestamp).isSame(today, "day")
      )
    );
    if (allDoneToday && !hasCategoryCelebratedToday(categoryId)) {
      markCategoryCelebratedToday(categoryId);
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight * 0.35;
      const points = [
        { x: centerX, y: centerY },
        { x: centerX - 180, y: centerY + 40 },
        { x: centerX + 180, y: centerY + 40 },
      ];
      const ids: string[] = [];
      points.forEach((p) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        ids.push(id);
        setBursts((prev) => [
          ...prev,
          { id, x: p.x, y: p.y, durationMs: celebrationDurationMs * 0.6 },
        ]);
      });
      window.setTimeout(() => {
        setBursts((prev) => prev.filter((b) => !ids.includes(b.id)));
      }, celebrationDurationMs);

      const categoryName =
        categories.find((c) => c.id === categoryId)?.name || "目标";
      toast.show({
        title: "目标达成",
        message: `恭喜！已完成「${categoryName}」的全部习惯 🎉`,
      });
    }
  };

  const handleCheckin = async (event?: React.MouseEvent) => {
    if (selectedHabitId) {
      await checkinHabit(selectedHabitId, note);
      setSelectedHabitId(null);
      setNote("");
      setShowCelebration(true);
      window.setTimeout(() => setShowCelebration(false), celebrationDurationMs);
      // 统一：弹窗确认也展示点击位置爆发与轻提示
      if (event) {
        const x = event.clientX;
        const y = event.clientY;
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        setBursts((prev) => [
          ...prev,
          { id, x, y, durationMs: celebrationDurationMs * 0.45 },
        ]);
        window.setTimeout(() => {
          setBursts((prev) => prev.filter((b) => b.id !== id));
        }, celebrationDurationMs);
      }
      toast.show({ message: "打卡成功", variant: "success" });
      triggerGrandCelebrationIfNeeded(selectedHabitId);
    }
  };

  /**
   * 一键打卡 - 无需弹窗
   */
  const handleQuickCheckin = async (
    habitId: string,
    event?: React.MouseEvent
  ) => {
    if (event) {
      event.stopPropagation(); // 阻止卡片点击事件
    }
    await checkinHabit(habitId, "");
    setShowCelebration(true);
    // 基于点击位置添加一次爆发（并发显示，提升实时感）
    if (event) {
      const x = event.clientX;
      const y = event.clientY;
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setBursts((prev) => [
        ...prev,
        { id, x, y, durationMs: celebrationDurationMs * 0.45 },
      ]);
      window.setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== id));
      }, celebrationDurationMs);
    }
    window.setTimeout(() => setShowCelebration(false), celebrationDurationMs);
    toast.show({ message: "打卡成功", variant: "success" });

    // 外部图标一键打卡后也检测目标全部完成，触发盛大庆祝与 toast
    triggerGrandCelebrationIfNeeded(habitId);
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

  // 计算没有习惯的目标数量
  const categoriesWithoutHabits = categories.filter(
    (category) => !habits.some((habit) => habit.categoryId === category.id)
  );

  return (
    <div className="min-h-screen">
      <Celebration
        visible={showCelebration || bursts.length > 0}
        durationMs={celebrationDurationMs}
        bursts={bursts}
      />
      {/* 显示有习惯的目标 - 方格状布局 */}
      {categories.length > 0 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {categories.map((category) => {
              const categoryHabits = habits.filter(
                (habit) => habit.categoryId === category.id
              );

              if (categoryHabits.length === 0) return null;

              const remainingCount = categoryHabits.filter(
                (h) => !isCheckedToday(h.id)
              ).length;

              return (
                <div
                  key={category.id}
                  className="bg-gradient-to-br from-white via-gray-50/20 to-gray-100/30 rounded-2xl border border-gray-200/60 hover:border-[#FF5A5F]/40 transition-all duration-300 shadow-sm hover:shadow-md p-4 sm:p-5 min-h-[200px] flex flex-col"
                >
                  {/* 目标标题区域 */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#FF5A5F] to-pink-500 shadow-sm"></div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">
                        {category.name}
                      </h2>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 bg-white/70 backdrop-blur-sm px-2.5 py-1 rounded-full font-medium">
                        {categoryHabits.length} 个习惯
                      </span>
                      <span
                        className={
                          `text-xs px-2.5 py-1 rounded-full font-bold border ` +
                          (remainingCount > 0
                            ? "bg-rose-50 text-rose-600 border-rose-200"
                            : "bg-emerald-50 text-emerald-600 border-emerald-200")
                        }
                        title="剩余待打卡习惯数"
                      >
                        待打卡 {remainingCount}
                      </span>
                    </div>
                  </div>

                  {/* 习惯网格 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                    {categoryHabits.map((habit) => {
                      const isChecked = isCheckedToday(habit.id);
                      const checkinTime = getTodayCheckinTime(habit.id);

                      return (
                        <div
                          key={habit.id}
                          onClick={() => setSelectedHabitId(habit.id)}
                          className={`
                        group p-3 sm:p-4 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] relative overflow-visible flex flex-col
                        ${
                          isChecked
                            ? "bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200/60 shadow-md hover:shadow-lg"
                            : "bg-white/90 backdrop-blur-sm border-2 border-gray-200/50 hover:border-[#FF5A5F]/50 hover:shadow-md"
                        }
                      `}
                        >
                          {/* 闹钟图标和习惯名称 */}
                          <div className="">
                            <div className="flex items-center space-x-3 mb-2">
                              <div
                                onClick={(e) => handleQuickCheckin(habit.id, e)}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-110 shadow-sm flex-shrink-0 ${
                                  isChecked
                                    ? "bg-gradient-to-br from-green-500 to-green-600 shadow-green-200 hover:shadow-green-300"
                                    : "bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-[#FF5A5F] group-hover:to-pink-500 hover:!from-[#FF5A5F] hover:!to-pink-500"
                                }`}
                                title={isChecked ? "继续打卡" : "一键打卡"}
                              >
                                {isChecked ? (
                                  <span className="text-lg font-semibold text-white">
                                    ✓
                                  </span>
                                ) : habit.reminderTime ? (
                                  <span className="text-lg font-semibold text-gray-600 group-hover:text-white transition-all duration-300">
                                    ⏰
                                  </span>
                                ) : (
                                  <Target className="w-5 h-5 text-gray-600 group-hover:text-white transition-all duration-300" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                  <h3 className="font-bold text-gray-800 text-lg leading-tight truncate">
                                    {habit.name}
                                  </h3>
                                  {showDashboardAIIcon &&
                                    habit.isAIGenerated && (
                                      <div className="relative group/ai flex-shrink-0">
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] sm:text-xs">
                                          <Brain className="w-3 h-3 mr-1" /> AI
                                        </span>
                                        <div className="absolute left-0 bottom-6 z-30 w-72 sm:w-80 p-3 rounded-lg bg-white shadow-xl border border-gray-200 opacity-0 invisible group-hover/ai:opacity-100 group-hover/ai:visible transition-all">
                                          {habit.description && (
                                            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                                              {habit.description}
                                            </p>
                                          )}
                                          <div className="flex flex-wrap gap-2 mt-2">
                                            {habit.aiDifficulty && (
                                              <span
                                                className={`px-2 py-0.5 text-[11px] rounded-full border font-medium ${
                                                  habit.aiDifficulty === "简单"
                                                    ? "bg-green-100 text-green-700 border-green-200"
                                                    : habit.aiDifficulty ===
                                                      "中等"
                                                    ? "bg-amber-100 text-amber-700 border-amber-200"
                                                    : "bg-red-100 text-red-700 border-red-200"
                                                }`}
                                              >
                                                难度：{habit.aiDifficulty}
                                              </span>
                                            )}
                                            {habit.aiFrequency && (
                                              <span className="px-2 py-0.5 text-[11px] rounded-full border bg-indigo-100 text-indigo-700 border-indigo-200 font-medium">
                                                频率：{habit.aiFrequency}
                                              </span>
                                            )}
                                          </div>
                                          {habit.aiTips && (
                                            <div className="mt-2 text-[11px] text-gray-600">
                                              <span className="font-medium text-gray-700">
                                                小贴士：
                                              </span>
                                              <span>{habit.aiTips}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/habit/${habit.id}`);
                                }}
                                className="p-1.5 rounded-lg hover:bg-white/80 backdrop-blur-sm transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-sm flex-shrink-0"
                                title="查看详情"
                              >
                                <Info className="w-4 h-4 text-gray-500" />
                              </button>
                            </div>
                          </div>

                          {/* 底部区域：打卡状态或提醒时间 */}
                          <div className="mt-auto">
                            {(() => {
                              const todayLogsCount = getTodayLogs(
                                habit.id
                              ).length;
                              if (todayLogsCount > 0) {
                                return (
                                  <div className="space-y-2">
                                    <div className="bg-green-50/80 backdrop-blur-sm rounded-lg p-2 border border-green-200/50">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                          <p className="text-xs text-green-700 font-semibold">
                                            {checkinTime}
                                          </p>
                                        </div>
                                        <span className="text-xs text-green-600 bg-green-200/60 px-2 py-0.5 rounded-full font-bold">
                                          {todayLogsCount}次
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              } else {
                                return (
                                  <div className="bg-gray-50/80 backdrop-blur-sm rounded-lg p-2 border border-gray-200/50">
                                    {habit.reminderTime ? (
                                      <div className="flex items-center justify-between text-gray-500">
                                        <div className="flex items-center space-x-2">
                                          <div className="w-1.5 h-1.5 bg-[#FF5A5F] rounded-full"></div>
                                          <span className="text-xs font-medium">
                                            {habit.reminderTime}
                                          </span>
                                        </div>
                                        <span className="text-xs text-gray-400">
                                          记得打卡哦
                                        </span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center justify-center text-gray-400">
                                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full mr-2"></div>
                                        <span className="text-xs font-medium">
                                          记得打卡哦
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                            })()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 显示没有习惯的目标提示 */}
          {categoriesWithoutHabits.length > 0 && (
            <div className="mt-6">
              <div className="bg-gradient-to-br from-amber-50 via-orange-50/20 to-yellow-50/30 rounded-2xl border border-amber-200/60 shadow-sm p-4 sm:p-5">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                      待添加习惯的目标
                    </h2>
                    <p className="text-sm sm:text-base text-gray-500">
                      您有 {categoriesWithoutHabits.length} 个目标还没有添加习惯
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoriesWithoutHabits.map((category) => (
                    <div
                      key={category.id}
                      className="p-4 bg-white rounded-xl border-2 border-dashed border-gray-300 hover:border-amber-400 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-800">
                          {category.name}
                        </h3>
                        <Target className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 mb-4">
                        还没有习惯，点击添加
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate("/management")}
                          className="flex-1 inline-flex items-center justify-center space-x-1 px-3 py-2 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          <span>添加习惯</span>
                        </button>
                        {aiEnabled && (
                          <button
                            onClick={() => navigate("/management")}
                            className="inline-flex items-center justify-center px-3 py-2 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition-colors"
                            title="AI 生成习惯"
                          >
                            <Brain className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="flex items-start space-x-2">
                    <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-700">
                      <p className="font-medium mb-1">小贴士：</p>
                      <p>
                        每个目标可以添加多个习惯，建议从简单的开始，逐步养成。
                        {aiEnabled && " 您也可以使用 AI 生成个性化的习惯建议。"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* 统一的打卡对话框 */}
      {selectedHabitId &&
        (() => {
          const habit = habits.find((h) => h.id === selectedHabitId);
          if (!habit) return null;

          const isChecked = isCheckedToday(habit.id);

          return (
            <EnhancedDialog
              open={!!selectedHabitId}
              onOpenChange={(open) => {
                if (!open) {
                  setSelectedHabitId(null);
                  setNote("");
                }
              }}
              onConfirm={handleCheckin}
              confirmDisabled={!selectedHabitId}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 sm:p-8 w-full max-w-lg mx-4 shadow-2xl z-50 max-h-[90vh] overflow-y-auto"
              confirmShortcut={{ key: "Enter", ctrlKey: true, metaKey: true }}
            >
              <div className="flex items-center justify-between mb-6">
                <Dialog.Title className="text-xl sm:text-2xl font-semibold text-gray-800 leading-tight">
                  {isChecked ? `已打卡: ${habit.name}` : `打卡: ${habit.name}`}
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
                          #{index + 1} {dayjs(log.timestamp).format("HH:mm")} -{" "}
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
                        const todayLogsCount = getTodayLogs(habit.id).length;
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
                        onClick={(e) => handleCheckin(e)}
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
          );
        })()}

      {/* 完全没有目标的情况 */}
      {categories.length === 0 && (
        <div className="text-center py-12 sm:py-16">
          <div className="max-w-md mx-auto px-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 bg-gradient-to-br from-[#FF5A5F] to-pink-400 rounded-full flex items-center justify-center shadow-lg">
              <Target className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3">
              开始你的成长之旅
            </h3>
            <p className="text-gray-500 text-base sm:text-lg mb-6 leading-relaxed">
              还没有任何习惯，创建你的第一个习惯开始打卡吧！
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
