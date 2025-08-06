import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useHabitStore } from "../stores/useHabitStore";
import * as Dialog from "@radix-ui/react-dialog";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import CalendarModal from "../components/ui/CalendarModal";
import {
  ArrowLeft,
  Calendar,
  Clock,
  TrendingUp,
  Edit3,
  Trash2,
  Plus,
  X,
  Target,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import dayjs from "dayjs";

const HabitDetail: React.FC = () => {
  const { habitId } = useParams<{ habitId: string }>();
  const navigate = useNavigate();
  const {
    habits,
    categories,
    habitLogs,
    checkinHabit,
    deleteHabitLog,
    updateHabitLog,
  } = useHabitStore();

  const [editingLog, setEditingLog] = useState<string | null>(null);
  const [editNote, setEditNote] = useState("");
  const [newNote, setNewNote] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarModalTitle, setCalendarModalTitle] = useState("");
  const [filteredLogs, setFilteredLogs] = useState<typeof logs>([]);

  const habit = habits.find((h) => h.id === habitId);
  const category = habit
    ? categories.find((c) => c.id === habit.categoryId)
    : null;
  const logs = habitLogs.filter((log) => log.habitId === habitId);

  useEffect(() => {
    if (!habit) {
      navigate("/");
    }
  }, [habit, navigate]);

  if (!habit) {
    return null;
  }

  // 按日期分组打卡记录
  const logsByDate = logs.reduce((acc, log) => {
    const date = dayjs(log.timestamp).format("YYYY-MM-DD");
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

  // 统计数据
  const totalDays = Object.keys(logsByDate).length;
  const currentStreak = calculateCurrentStreak();
  const thisWeekCount = calculateThisWeekCount();
  const thisMonthCount = calculateThisMonthCount();

  function calculateCurrentStreak(): number {
    let streak = 0;
    const today = dayjs().startOf("day");

    for (let i = 0; i < 365; i++) {
      const checkDate = today.subtract(i, "day").format("YYYY-MM-DD");
      if (logsByDate[checkDate] && logsByDate[checkDate].length > 0) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  }

  function calculateThisWeekCount(): number {
    const startOfWeek = dayjs().startOf("week");
    const endOfWeek = dayjs().endOf("week");

    return logs.filter((log) => {
      const logDate = dayjs(log.timestamp);
      return logDate.isAfter(startOfWeek) && logDate.isBefore(endOfWeek);
    }).length;
  }

  function calculateThisMonthCount(): number {
    const startOfMonth = dayjs().startOf("month");
    const endOfMonth = dayjs().endOf("month");

    return logs.filter((log) => {
      const logDate = dayjs(log.timestamp);
      return logDate.isAfter(startOfMonth) && logDate.isBefore(endOfMonth);
    }).length;
  }

  const handleAddCheckin = async () => {
    if (newNote.trim() || newNote === "") {
      await checkinHabit(habitId!, newNote);
      setNewNote("");
      setShowAddDialog(false);
    }
  };

  const handleEditLog = (log: any) => {
    setEditingLog(log.id);
    setEditNote(log.note);
  };

  const handleSaveEdit = async () => {
    if (editingLog) {
      await updateHabitLog(editingLog, editNote);
      setEditingLog(null);
      setEditNote("");
    }
  };

  const handleDeleteLog = async (logId: string) => {
    await deleteHabitLog(logId);
  };

  // 处理统计卡片点击事件
  const handleStatsClick = (
    type: "total" | "streak" | "thisWeek" | "thisMonth"
  ) => {
    let title = "";
    let logsToShow = logs;

    switch (type) {
      case "total":
        title = "总打卡天数日历";
        logsToShow = logs;
        break;
      case "streak":
        title = "连续打卡日历";
        // 计算连续打卡的日期范围
        const streakLogs = getStreakLogs();
        logsToShow = streakLogs;
        break;
      case "thisWeek":
        title = "本周打卡日历";
        const startOfWeek = dayjs().startOf("week");
        const endOfWeek = dayjs().endOf("week");
        logsToShow = logs.filter((log) => {
          const logDate = dayjs(log.timestamp);
          return logDate.isAfter(startOfWeek) && logDate.isBefore(endOfWeek);
        });
        break;
      case "thisMonth":
        title = "本月打卡日历";
        const startOfMonth = dayjs().startOf("month");
        const endOfMonth = dayjs().endOf("month");
        logsToShow = logs.filter((log) => {
          const logDate = dayjs(log.timestamp);
          return logDate.isAfter(startOfMonth) && logDate.isBefore(endOfMonth);
        });
        break;
    }

    setCalendarModalTitle(title);
    setFilteredLogs(logsToShow);
    setShowCalendarModal(true);
  };

  // 获取连续打卡的记录
  function getStreakLogs() {
    const today = dayjs().startOf("day");
    const streakLogs = [];

    for (let i = 0; i < currentStreak; i++) {
      const checkDate = today.subtract(i, "day").format("YYYY-MM-DD");
      const dayLogs = logs.filter(
        (log) => dayjs(log.timestamp).format("YYYY-MM-DD") === checkDate
      );
      streakLogs.push(...dayLogs);
    }

    return streakLogs;
  }

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-start space-x-3 sm:space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 leading-tight">
              {habit.name}
            </h1>
            {category && (
              <span className="inline-block px-2 sm:px-3 py-1 bg-[#FF5A5F] text-white text-xs sm:text-sm rounded-full flex-shrink-0">
                {category.name}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2 mt-1 text-gray-500">
            {habit.reminderTime && (
              <>
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-sm">提醒时间：{habit.reminderTime}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
        <button
          onClick={() => handleStatsClick("total")}
          className="card p-4 sm:p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 text-left"
        >
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">总打卡天数</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-800">
                {totalDays}
              </p>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">点击查看日历</div>
        </button>

        <button
          onClick={() => handleStatsClick("streak")}
          className="card p-4 sm:p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 text-left"
        >
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">连续天数</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-800">
                {currentStreak}
              </p>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">点击查看日历</div>
        </button>

        <button
          onClick={() => handleStatsClick("thisWeek")}
          className="card p-4 sm:p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 text-left"
        >
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">本周打卡</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-800">
                {thisWeekCount}
              </p>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">点击查看日历</div>
        </button>

        <button
          onClick={() => handleStatsClick("thisMonth")}
          className="card p-4 sm:p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 text-left"
        >
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">本月打卡</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-800">
                {thisMonthCount}
              </p>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">点击查看日历</div>
        </button>
      </div>

      {/* 打卡记录 */}
      <div className="card p-4 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
            打卡记录
          </h2>
          <button
            onClick={() => setShowAddDialog(true)}
            className="inline-flex items-center space-x-2 px-3 sm:px-4 py-2 bg-[#FF5A5F] text-white rounded-lg hover:bg-pink-600 transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">新增打卡</span>
            <span className="sm:hidden">新增</span>
          </button>
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

                <div className="space-y-3">
                  {logsByDate[date]
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .map((log) => (
                      <div
                        key={log.id}
                        className="group flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="text-xs sm:text-sm text-gray-500 min-w-12 sm:min-w-16">
                          {dayjs(log.timestamp).format("HH:mm")}
                        </div>
                        <div className="flex-1">
                          {editingLog === log.id ? (
                            <div className="space-y-3">
                              <textarea
                                value={editNote}
                                onChange={(e) => setEditNote(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent outline-none"
                                rows={3}
                                placeholder="记录你的感受..."
                              />
                              <div className="flex space-x-2">
                                <button
                                  onClick={handleSaveEdit}
                                  className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors"
                                >
                                  保存
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingLog(null);
                                    setEditNote("");
                                  }}
                                  className="px-3 py-1.5 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600 transition-colors"
                                >
                                  取消
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-700">
                              {log.note || "无备注"}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditLog(log)}
                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <AlertDialog.Root>
                            <AlertDialog.Trigger asChild>
                              <button className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </AlertDialog.Trigger>
                            <AlertDialog.Portal>
                              <AlertDialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
                              <AlertDialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl z-50">
                                <div className="flex items-center space-x-3 mb-6">
                                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-red-600" />
                                  </div>
                                  <AlertDialog.Title className="text-xl font-semibold text-gray-800">
                                    删除打卡记录
                                  </AlertDialog.Title>
                                </div>
                                <AlertDialog.Description className="text-gray-600 mb-6">
                                  确定要删除这条打卡记录吗？此操作无法撤销。
                                </AlertDialog.Description>
                                <div className="flex justify-end space-x-3">
                                  <AlertDialog.Cancel asChild>
                                    <button className="px-6 py-2.5 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium">
                                      取消
                                    </button>
                                  </AlertDialog.Cancel>
                                  <button
                                    onClick={() => handleDeleteLog(log.id)}
                                    className="px-6 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors duration-200 font-medium shadow-md hover:shadow-lg"
                                  >
                                    删除
                                  </button>
                                </div>
                              </AlertDialog.Content>
                            </AlertDialog.Portal>
                          </AlertDialog.Root>
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
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg mb-2">还没有打卡记录</p>
            <p className="text-gray-400 text-sm">开始你的第一次打卡吧！</p>
          </div>
        )}
      </div>

      {/* 新增打卡弹窗 */}
      <Dialog.Root open={showAddDialog} onOpenChange={setShowAddDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 sm:p-8 w-full max-w-sm sm:max-w-md mx-4 shadow-2xl z-50">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-2xl font-semibold text-gray-800">
                新增打卡
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </Dialog.Close>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  打卡备注
                </label>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent outline-none transition-all duration-200 resize-none"
                  placeholder="记录今天的感受和收获..."
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
                onClick={handleAddCheckin}
                className="px-6 py-2.5 bg-[#FF5A5F] text-white rounded-xl hover:bg-pink-600 transition-colors duration-200 font-medium shadow-md hover:shadow-lg"
              >
                确认打卡
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* 日历弹窗 */}
      <CalendarModal
        open={showCalendarModal}
        onOpenChange={setShowCalendarModal}
        title={calendarModalTitle}
        habitLogs={filteredLogs}
        defaultMonth={
          logs.length > 0 ? new Date(logs[0].timestamp) : new Date()
        }
      />
    </div>
  );
};

export default HabitDetail;
