import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useHabitStore } from "../stores/useHabitStore";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tooltip from "@radix-ui/react-tooltip";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import CalendarModal from "../components/ui/CalendarModal";
import { EnhancedDialog } from "../components/ui/EnhancedDialog";
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
  RotateCcw,
  CalendarDays,
} from "lucide-react";
import { Brain } from "lucide-react";
import dayjs from "dayjs";
import { HabitLog } from "../types";

const HabitDetail: React.FC = () => {
  const { habitId } = useParams<{ habitId: string }>();
  const navigate = useNavigate();
  const {
    habits,
    categories,
    habitLogs,
    checkinHabit,
    makeupCheckinHabit,
    deleteHabitLog,
    updateHabitLog,
  } = useHabitStore();

  const [editingLog, setEditingLog] = useState<string | null>(null);
  const [editNote, setEditNote] = useState("");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showMakeupDialog, setShowMakeupDialog] = useState(false);
  const [makeupNote, setMakeupNote] = useState("");
  const [selectedMakeupDate, setSelectedMakeupDate] = useState<Date>(
    new Date()
  );
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarModalTitle, setCalendarModalTitle] = useState("");
  const [filteredLogs, setFilteredLogs] = useState<typeof logs>([]);
  const [showDayDialog, setShowDayDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<
    "all" | "week" | "month" | "30d"
  >("all");

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
    // 对于补卡记录，使用原始日期；对于正常打卡，使用实际时间
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

  const handleMakeupCheckin = async () => {
    if (makeupNote.trim() || makeupNote === "") {
      await makeupCheckinHabit(habitId!, makeupNote, selectedMakeupDate);
      setMakeupNote("");
      setShowMakeupDialog(false);
    }
  };

  // 获取可以补卡的日期（前一周）
  const getAvailableMakeupDates = () => {
    const today = dayjs();
    const dates = [];

    for (let i = 1; i <= 7; i++) {
      const date = today.subtract(i, "day");
      // 检查当天是否已经有打卡记录（包括补卡）
      const hasLog = logs.some((log) => {
        const logDate = dayjs(log.originalDate || log.timestamp);
        return logDate.format("YYYY-MM-DD") === date.format("YYYY-MM-DD");
      });

      if (!hasLog) {
        dates.push(date.toDate());
      }
    }

    return dates;
  };

  const handleEditLog = (log: any) => {
    setEditingLog(log.id);
    setEditNote(log.note);
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (editingLog) {
      await updateHabitLog(editingLog, editNote);
      setEditingLog(null);
      setEditNote("");
      setShowEditDialog(false);
    }
  };

  const handleDeleteLog = async (logId: string) => {
    await deleteHabitLog(logId);
  };

  // 处理统计卡片点击事件
  const handleStatsClick = () => {
    setCalendarModalTitle("历史打卡日历");
    setFilteredLogs(logs);
    setShowCalendarModal(true);
  };

  // 获取连续打卡的记录
  function getStreakLogs() {
    const today = dayjs().startOf("day");
    const streakLogs = [] as typeof logs;
    for (let i = 0; i < currentStreak; i++) {
      const checkDate = today.subtract(i, "day").format("YYYY-MM-DD");
      const dayLogs = logs.filter(
        (log) => dayjs(log.timestamp).format("YYYY-MM-DD") === checkDate
      );
      streakLogs.push(...dayLogs);
    }
    return streakLogs;
  }

  // 补卡日期相对文案
  const formatRelativeDay = (date: Date) => {
    const diff = dayjs().startOf("day").diff(dayjs(date).startOf("day"), "day");
    if (diff === 1) return "昨天";
    if (diff === 2) return "前天";
    if (diff === 3) return "大前天";
    return `${diff}天前`;
  };

  // 选中日期的所有打卡
  const selectedDayLogs = selectedDay ? logsByDate[selectedDay] || [] : [];

  // 依据筛选获取展示用日期列表
  const displayDates = (() => {
    const today = dayjs();
    if (dateFilter === "week") {
      const start = today.startOf("week");
      const end = today.endOf("week");
      return sortedDates.filter(
        (d) =>
          dayjs(d).isAfter(start.subtract(1, "day")) &&
          dayjs(d).isBefore(end.add(1, "day"))
      );
    }
    if (dateFilter === "month") {
      const start = today.startOf("month");
      const end = today.endOf("month");
      return sortedDates.filter(
        (d) =>
          dayjs(d).isAfter(start.subtract(1, "day")) &&
          dayjs(d).isBefore(end.add(1, "day"))
      );
    }
    if (dateFilter === "30d") {
      const start = today.subtract(30, "day").startOf("day");
      return sortedDates.filter((d) => dayjs(d).isAfter(start));
    }
    return sortedDates;
  })();

  // 小方块强度映射（根据当日打卡次数）
  const dayCounts = displayDates.map((d) => logsByDate[d].length);
  const maxDayCount = Math.max(1, ...dayCounts);
  const getTileClass = (count: number, isToday: boolean) => {
    const ratio = count / maxDayCount;
    let colorClass =
      "bg-pink-50 text-pink-700 hover:bg-pink-100 border border-transparent shadow-sm";
    if (ratio >= 0.8) {
      colorClass =
        "bg-gradient-to-br from-pink-500 to-rose-500 text-white border-transparent shadow-lg hover:from-pink-500/90 hover:to-rose-500/90";
    } else if (ratio >= 0.5) {
      colorClass =
        "bg-gradient-to-br from-pink-400 to-rose-400 text-white border-transparent shadow-md hover:from-pink-400/90 hover:to-rose-400/90";
    } else if (ratio >= 0.3) {
      colorClass =
        "bg-pink-100 text-pink-800 hover:bg-pink-200 border border-transparent shadow";
    }
    const todayRing = isToday
      ? "ring-2 ring-blue-400 ring-offset-2 ring-offset-white"
      : "";
    return `${colorClass} ${todayRing}`;
  };

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
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 leading-tight">
                {habit.name}
              </h1>
              {habit.isAIGenerated && (
                <span className="inline-flex items-center px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">
                  <Brain className="w-4 h-4 mr-1" /> AI
                </span>
              )}
            </div>
            {category && (
              <span className="inline-block px-2 sm:px-3 py-1 bg-[#FF5A5F] text-white text-xs sm:text-sm rounded-full flex-shrink-0">
                {category.name}
              </span>
            )}
          </div>
          <div className="flex flex-col space-y-1 mt-1 text-gray-500">
            {habit.reminderTime && (
              <div className="flex items-center space-x-2">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-sm">提醒时间：{habit.reminderTime}</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-sm">总打卡次数：{logs.length} 次</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI 说明与备注 */}
      {(habit.description ||
        habit.aiTips ||
        habit.aiFrequency ||
        habit.aiDifficulty) && (
        <div className="card p-4 sm:p-6">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Brain className="w-4 h-4 text-purple-700" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">AI 建议</h2>
          </div>
          {habit.description && (
            <p className="text-gray-700 leading-relaxed">{habit.description}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-3">
            {habit.aiDifficulty && (
              <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                难度：{habit.aiDifficulty}
              </span>
            )}
            {habit.aiFrequency && (
              <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                建议频率：{habit.aiFrequency}
              </span>
            )}
          </div>
          {habit.aiTips && (
            <div className="mt-3 text-sm text-gray-600">
              <span className="font-medium text-gray-700">小贴士：</span>
              <span>{habit.aiTips}</span>
            </div>
          )}
        </div>
      )}

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
        <button
          onClick={handleStatsClick}
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
          onClick={handleStatsClick}
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
          onClick={handleStatsClick}
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
          onClick={handleStatsClick}
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
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowMakeupDialog(true)}
              className="inline-flex items-center space-x-2 px-3 sm:px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base"
              disabled={getAvailableMakeupDates().length === 0}
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">补卡</span>
              <span className="sm:hidden">补卡</span>
            </button>
            <button
              onClick={() => setShowAddDialog(true)}
              className="inline-flex items-center space-x-2 px-3 sm:px-4 py-2 bg-[#FF5A5F] text-white rounded-lg hover:bg-pink-600 transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">新增打卡</span>
              <span className="sm:hidden">新增</span>
            </button>
          </div>
        </div>

        {sortedDates.length > 0 ? (
          <Tooltip.Provider delayDuration={150} skipDelayDuration={0}>
            <div className="card p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF5A5F]"></div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                    日期热力
                  </h3>
                  <div className="hidden sm:flex items-center gap-2">
                    <span className="text-xs text-gray-500">合计</span>
                    <span className="text-sm font-semibold text-gray-800">
                      {sortedDates.length} 天 · {logs.length} 次
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-xs">
                  {(
                    [
                      { key: "all", label: "全部" },
                      { key: "30d", label: "近30天" },
                      { key: "week", label: "本周" },
                      { key: "month", label: "本月" },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setDateFilter(f.key)}
                      className={`px-2.5 py-1 rounded-full border transition-colors ${
                        dateFilter === f.key
                          ? "bg-gray-900 text-white border-gray-900"
                          : "text-gray-600 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 sm:gap-5">
                {displayDates.map((date) => {
                  const count = logsByDate[date].length;
                  const isToday = dayjs(date).isSame(dayjs(), "day");
                  return (
                    <Tooltip.Root key={date}>
                      <Tooltip.Trigger asChild>
                        <button
                          onClick={() => {
                            setSelectedDay(date);
                            setShowDayDialog(true);
                          }}
                          className={`w-full min-h-[72px] sm:min-h-[84px] rounded-2xl border border-transparent text-gray-800 transition-all flex flex-col items-center justify-center gap-1 px-3 py-2 ${getTileClass(
                            count,
                            isToday
                          )}`}
                          title={dayjs(date).format("YYYY-MM-DD")}
                        >
                          <div className="text-sm sm:text-base font-bold tracking-tight">
                            {dayjs(date).format("MM/DD")}
                          </div>
                          <div className="text-[10px] sm:text-xs opacity-90">
                            {count} 次{isToday ? " · 今天" : ""}
                          </div>
                        </button>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content
                          className="max-w-xs bg-gray-900 text-white text-xs px-2 py-1.5 rounded-md shadow-lg"
                          sideOffset={6}
                        >
                          <div className="space-y-1">
                            <div className="font-medium">
                              {dayjs(date).format("MM月DD日")} · {count} 次
                            </div>
                            <div
                              className="opacity-80"
                              style={{ whiteSpace: "pre-line" }}
                            >
                              {[...logsByDate[date]]
                                .sort((a, b) => a.timestamp - b.timestamp)
                                .map(
                                  (l, idx) =>
                                    `#${idx + 1} ${dayjs(l.timestamp).format(
                                      "HH:mm"
                                    )}${l.isMakeup ? " · 补卡" : ""}`
                                )
                                .join("\n")}
                            </div>
                          </div>
                          <Tooltip.Arrow className="fill-gray-900" />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  );
                })}
              </div>
            </div>
          </Tooltip.Provider>
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

      {/* 新增打卡弹窗（快捷键） */}
      <EnhancedDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onConfirm={handleAddCheckin}
      >
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
      </EnhancedDialog>

      {/* 补卡弹窗 */}
      <Dialog.Root open={showMakeupDialog} onOpenChange={setShowMakeupDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 sm:p-8 w-full max-w-sm sm:max-w-md mx-4 shadow-2xl z-50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 text-orange-600" />
                </div>
                <Dialog.Title className="text-2xl font-semibold text-gray-800">
                  补卡
                </Dialog.Title>
              </div>
              <Dialog.Close asChild>
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </Dialog.Close>
            </div>

            <div className="space-y-4">
              {getAvailableMakeupDates().length > 0 ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      选择补卡日期
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {getAvailableMakeupDates().map((date) => (
                        <button
                          key={date.toISOString()}
                          onClick={() => setSelectedMakeupDate(date)}
                          className={`px-3 py-2 rounded-lg border text-sm transition-all duration-200 ${
                            selectedMakeupDate.toDateString() ===
                            date.toDateString()
                              ? "border-orange-500 bg-orange-50 text-orange-700"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <div className="text-center">
                            <div className="font-medium">
                              {dayjs(date).format("MM/DD")}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatRelativeDay(date)}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      补卡备注
                    </label>
                    <textarea
                      value={makeupNote}
                      onChange={(e) => setMakeupNote(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all duration-200 resize-none"
                      placeholder="说明一下为什么要补卡..."
                      rows={2}
                    />
                  </div>
                </>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <CalendarDays className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">前一周内没有可补卡的日期</p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Dialog.Close asChild>
                <button className="px-6 py-2.5 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium">
                  取消
                </button>
              </Dialog.Close>
              <button
                onClick={handleMakeupCheckin}
                disabled={getAvailableMakeupDates().length === 0}
                className="px-6 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认补卡
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* 编辑备注弹窗（快捷键） */}
      <EnhancedDialog
        open={showEditDialog}
        onOpenChange={(open) => {
          setShowEditDialog(open);
          if (!open) {
            setEditingLog(null);
            setEditNote("");
          }
        }}
        onConfirm={handleSaveEdit}
      >
        <div className="flex items-center justify-between mb-6">
          <Dialog.Title className="text-2xl font-semibold text-gray-800">
            编辑备注
          </Dialog.Title>
          <Dialog.Close asChild>
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </Dialog.Close>
        </div>
        <div className="space-y-4">
          <textarea
            value={editNote}
            onChange={(e) => setEditNote(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent outline-none transition-all duration-200 resize-none"
            placeholder="更新这次打卡的备注..."
            rows={4}
          />
        </div>
        <div className="flex justify-end space-x-3 mt-8">
          <Dialog.Close asChild>
            <button className="px-6 py-2.5 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium">
              取消
            </button>
          </Dialog.Close>
          <button
            onClick={handleSaveEdit}
            className="px-6 py-2.5 bg-[#FF5A5F] text-white rounded-xl hover:bg-pink-600 transition-colors duration-200 font-medium shadow-md hover:shadow-lg"
          >
            保存
          </button>
        </div>
      </EnhancedDialog>

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

      {/* 当天详情弹窗 */}
      <EnhancedDialog open={showDayDialog} onOpenChange={setShowDayDialog}>
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF5A5F] to-[#FF7A84] text-white flex items-center justify-center shadow">
              {selectedDay ? dayjs(selectedDay).format("DD") : ""}
            </div>
            <Dialog.Title className="text-xl sm:text-2xl font-semibold text-gray-800">
              {selectedDay ? dayjs(selectedDay).format("MM月DD日") : "当天详情"}
            </Dialog.Title>
          </div>
          <Dialog.Close asChild>
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </Dialog.Close>
        </div>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {selectedDayLogs
            .slice()
            .sort((a, b) => b.timestamp - a.timestamp)
            .map((log, idx) => (
              <div
                key={log.id}
                className="flex items-start justify-between bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm"
              >
                <div>
                  <div className="text-sm sm:text-base font-medium text-gray-800">
                    #{idx + 1} {dayjs(log.timestamp).format("HH:mm")}{" "}
                    {log.isMakeup ? "· 补卡" : ""}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">
                    {log.note || "无备注"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditLog(log)}
                    className="px-2.5 py-1.5 text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 text-xs sm:text-sm"
                  >
                    编辑
                  </button>
                  <AlertDialog.Root>
                    <AlertDialog.Trigger asChild>
                      <button className="px-2.5 py-1.5 text-red-600 border border-red-200 rounded-md hover:bg-red-50 text-xs sm:text-sm">
                        删除
                      </button>
                    </AlertDialog.Trigger>
                    <AlertDialog.Portal>
                      <AlertDialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
                      <AlertDialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl z-50">
                        <AlertDialog.Title className="text-lg font-semibold text-gray-800 mb-2">
                          确认删除
                        </AlertDialog.Title>
                        <AlertDialog.Description className="text-gray-600 mb-4">
                          确定要删除这条打卡记录吗？此操作无法撤销。
                        </AlertDialog.Description>
                        <div className="flex justify-end gap-2">
                          <AlertDialog.Cancel asChild>
                            <button className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                              取消
                            </button>
                          </AlertDialog.Cancel>
                          <AlertDialog.Action asChild>
                            <button
                              onClick={() => handleDeleteLog(log.id)}
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
              </div>
            ))}
          {selectedDayLogs.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              这一天没有打卡记录
            </div>
          )}
        </div>
      </EnhancedDialog>
    </div>
  );
};

export default HabitDetail;
