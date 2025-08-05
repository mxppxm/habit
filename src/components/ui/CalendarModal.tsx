import React, { useMemo, useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  FileText,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import dayjs from "dayjs";
import { HabitLog } from "../../types";

interface CalendarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  habitLogs: HabitLog[];
  defaultMonth?: Date;
}

const CalendarModal: React.FC<CalendarModalProps> = ({
  open,
  onOpenChange,
  title,
  habitLogs,
  defaultMonth,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // 将打卡记录转换为日期数组
  const checkedDates = useMemo(() => {
    return habitLogs.map((log) => new Date(log.timestamp));
  }, [habitLogs]);

  // 按日期分组打卡记录，用于显示详细信息
  const logsByDate = useMemo(() => {
    return habitLogs.reduce((acc, log) => {
      const date = dayjs(log.timestamp).format("YYYY-MM-DD");
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(log);
      return acc;
    }, {} as Record<string, HabitLog[]>);
  }, [habitLogs]);

  // 当弹窗打开时，检查今天是否有打卡记录，如果有就默认选中今天
  useEffect(() => {
    if (open) {
      const today = new Date();
      const todayKey = dayjs(today).format("YYYY-MM-DD");
      const todayLogs = logsByDate[todayKey];

      if (todayLogs && todayLogs.length > 0) {
        setSelectedDate(today);
      } else {
        setSelectedDate(null);
      }
    }
  }, [open, logsByDate]);

  // 获取选中日期的打卡记录
  const selectedDateLogs = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = dayjs(selectedDate).format("YYYY-MM-DD");
    return logsByDate[dateKey] || [];
  }, [selectedDate, logsByDate]);

  // 处理日期点击事件
  const handleDayClick = (date: Date) => {
    const dateKey = dayjs(date).format("YYYY-MM-DD");
    const logs = logsByDate[dateKey];

    if (logs && logs.length > 0) {
      setSelectedDate(date);
    } else {
      setSelectedDate(null);
    }
  };

  // 重置选中状态
  const handleModalClose = (open: boolean) => {
    if (!open) {
      setSelectedDate(null);
    }
    onOpenChange(open);
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleModalClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50"
          style={{ width: "1200px", height: "700px" }}
        >
          {/* 头部 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#FF5A5F] to-[#FF6B7A] rounded-2xl flex items-center justify-center shadow-lg">
                <CalendarIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <Dialog.Title className="text-2xl font-bold text-gray-800">
                  {title}
                </Dialog.Title>
                <p className="text-sm text-gray-500 mt-1">
                  共 {checkedDates.length} 天打卡记录
                </p>
              </div>
            </div>
            <Dialog.Close asChild>
              <button className="p-3 rounded-2xl hover:bg-gray-100 transition-all duration-200 group">
                <X className="w-6 h-6 text-gray-400 group-hover:text-gray-600" />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex px-6 pt-3 " style={{ height: "588px" }}>
            {/* 左侧日历 */}
            <div className="flex-1">
              <div className="mb-3">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-[#FF5A5F] rounded-full"></div>
                    <span className="text-gray-600">有打卡记录</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600">今天</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-purple-500 rounded-full border-2 border-blue-400"></div>
                    <span className="text-gray-600">今天已打卡</span>
                  </div>
                </div>
              </div>

              <div className="calendar-container bg-white rounded-2xl p-4 shadow-lg border border-gray-100 mr-3">
                <DayPicker
                  mode="single"
                  selected={selectedDate || undefined}
                  onDayClick={handleDayClick}
                  defaultMonth={defaultMonth || new Date()}
                  showOutsideDays
                  fixedWeeks
                  modifiers={{
                    hasCheckIn: checkedDates,
                  }}
                  modifiersClassNames={{
                    hasCheckIn: "has-checkin-day",
                  }}
                  classNames={{
                    root: "premium-calendar",
                    months: "flex flex-col",
                    month: "w-full flex flex-col items-center",
                    month_caption:
                      "calendar-header w-full relative flex items-center justify-center bg-red-500",
                    caption_label: "calendar-title",
                    nav: "calendar-nav",
                    button_previous: "calendar-nav-btn",
                    button_next: "calendar-nav-btn",
                    table: "calendar-table bg-red-500",
                    head_row: "bg-red-500",
                    head_cell: "calendar-weekday bg-red-500",
                    row: "bg-red-500",
                    cell: "bg-red-500",
                    day: "calendar-day",
                    day_button: "calendar-day-button",
                    outside: "calendar-outside",
                    today: "calendar-today",
                    selected: "calendar-selected",
                    disabled: "calendar-disabled",
                  }}
                  components={{
                    Chevron: ({ orientation }) =>
                      orientation === "left" ? (
                        <ChevronLeft className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      ),
                  }}
                />
              </div>
            </div>

            {/* 右侧详情面板 */}
            <div
              className="border-l border-gray-100 bg-gray-50 flex flex-col"
              style={{ width: "450px", height: "100%" }}
            >
              {selectedDate ? (
                <div className="flex flex-col h-full">
                  {/* 固定的头部 */}
                  <div className="p-6 pb-0 flex-shrink-0">
                    <div className="mb-6">
                      <div className="flex items-center space-x-3 mb-2">
                        <CheckCircle className="w-6 h-6 text-[#FF5A5F]" />
                        <h3 className="text-lg font-bold text-gray-800">
                          {dayjs(selectedDate).format("MM月DD日")}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-500">
                        {dayjs(selectedDate).format("dddd")} ·{" "}
                        {selectedDateLogs.length} 次打卡
                      </p>
                    </div>
                  </div>

                  {/* 可滚动的内容区域 */}
                  <div className="flex-1 overflow-y-auto px-6 pb-6">
                    <div className="space-y-4">
                      {selectedDateLogs
                        .sort((a, b) => b.timestamp - a.timestamp)
                        .map((log, index) => (
                          <div
                            key={log.id}
                            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200"
                          >
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-8 h-8 bg-[#FF5A5F] bg-opacity-10 rounded-xl flex items-center justify-center">
                                <Clock className="w-4 h-4 text-[#FF5A5F]" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800">
                                  {dayjs(log.timestamp).format("HH:mm")}
                                </p>
                                <p className="text-xs text-gray-500">
                                  第 {index + 1} 次打卡
                                </p>
                              </div>
                            </div>

                            {log.note && (
                              <div className="flex items-start space-x-3">
                                <FileText className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                                <p className="text-sm text-gray-600 leading-relaxed">
                                  {log.note}
                                </p>
                              </div>
                            )}

                            {!log.note && (
                              <div className="flex items-center space-x-3">
                                <FileText className="w-4 h-4 text-gray-300" />
                                <p className="text-sm text-gray-400 italic">
                                  无备注
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center p-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CalendarIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      选择日期
                    </h3>
                    <p className="text-sm text-gray-500 max-w-48">
                      点击左侧日历中的红色日期查看详细的打卡记录
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>

      <style>{`
        /* 高端日历样式 */
        .premium-calendar {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            sans-serif;
          width: 100%;
          margin: 0;
          padding: 0;
          position: relative;
        }

        /* 头部样式 */
        .premium-calendar .calendar-header {
          padding: 20px 24px !important;
          margin-bottom: 20px !important;
          background: linear-gradient(135deg, #f8fafc, #f1f5f9) !important;
          border-radius: 16px !important;
          border: 1px solid #e2e8f0 !important;
          height: 80px !important;
          position: relative !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .premium-calendar .calendar-title {
          font-size: 22px !important;
          font-weight: 800 !important;
          color: #1e293b !important;
          text-align: center !important;
          letter-spacing: -0.5px !important;
          margin: 0 !important;
          z-index: 1 !important;
          position: relative !important;
        }

        .premium-calendar .calendar-nav {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          padding: 0 24px !important;
          z-index: 0;
        }

        .premium-calendar .calendar-nav button {
          all: unset !important;
        }

        /* 导航按钮 */
        .premium-calendar .calendar-nav-btn,
        .premium-calendar .calendar-nav button {
          width: 48px !important;
          height: 48px !important;
          background: linear-gradient(135deg, #ffffff, #f8fafc) !important;
          border: 2px solid #e2e8f0 !important;
          border-radius: 14px !important;
          color: #64748b !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          cursor: pointer !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
          flex-shrink: 0 !important;
        }

        .premium-calendar .calendar-nav-btn:hover,
        .premium-calendar .calendar-nav button:hover {
          background: linear-gradient(135deg, #ffffff, #f1f5f9) !important;
          border-color: #cbd5e1 !important;
          color: #334155 !important;
          transform: scale(1.08) translateY(-2px) !important;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12) !important;
        }

        .premium-calendar .calendar-nav-btn:active,
        .premium-calendar .calendar-nav button:active {
          transform: scale(1.02) translateY(0px) !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
        }

        .premium-calendar .calendar-nav-btn:disabled,
        .premium-calendar .calendar-nav button:disabled {
          opacity: 0.3 !important;
          cursor: not-allowed !important;
          transform: none !important;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04) !important;
        }

        .premium-calendar .calendar-nav-btn:disabled:hover,
        .premium-calendar .calendar-nav button:disabled:hover {
          transform: none !important;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04) !important;
        }

        /* 表格布局 */
        .calendar-table {
          width: 100%;
          border-spacing: 8px;
          border-collapse: separate;
          margin: 0;
        }

        .calendar-weekdays-row {
          margin-bottom: 8px;
        }

        .calendar-row {
          margin: 2px 0;
        }

        .calendar-cell {
          padding: 2px;
          text-align: center;
        }

        /* 星期标题 */
        .calendar-weekday {
          font-size: 13px;
          font-weight: 700;
          color: #64748b;
          text-align: center;
          padding: 14px 8px;
          text-transform: uppercase;
          letter-spacing: 1px;
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          border-radius: 14px;
          border: 1px solid #e2e8f0;
        }

        /* 日期基础样式 */
        .calendar-day {
          position: relative;
          margin: 2px;
        }

        .calendar-day-button {
          width: 52px;
          height: 52px;
          border: none;
          background: #ffffff;
          color: #1e293b;
          font-size: 16px;
          font-weight: 600;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 2px solid #f1f5f9;
          position: relative;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .calendar-day-button:before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          border-radius: 16px;
          opacity: 0;
          transition: all 0.3s ease;
          z-index: -1;
        }

        .calendar-day-button:hover:before {
          opacity: 1;
        }

        .calendar-day-button:hover {
          transform: translateY(-3px) scale(1.08);
          color: #0f172a;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
          border-color: #e2e8f0;
        }

        /* 有打卡记录的日期 */
        .has-checkin-day .calendar-day-button {
          background: linear-gradient(135deg, #ff6b6b, #ee5a52) !important;
          color: white !important;
          font-weight: 700 !important;
          box-shadow: 0 6px 24px rgba(238, 90, 82, 0.35) !important;
          border-color: rgba(255, 255, 255, 0.3) !important;
          transform: scale(1.02) !important;
        }

        .has-checkin-day .calendar-day-button:before {
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.25),
            rgba(255, 255, 255, 0.1)
          ) !important;
          opacity: 1 !important;
        }

        .has-checkin-day .calendar-day-button:hover {
          background: linear-gradient(135deg, #ff5252, #e53935) !important;
          transform: translateY(-4px) scale(1.1) !important;
          box-shadow: 0 16px 35px rgba(238, 90, 82, 0.45) !important;
        }

        .has-checkin-day .calendar-day-button:after {
          content: "";
          position: absolute;
          width: 8px;
          height: 8px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          top: 6px;
          right: 6px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        /* 今天的日期 */
        .calendar-today .calendar-day-button {
          background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
          color: white !important;
          font-weight: 700 !important;
          box-shadow: 0 6px 24px rgba(59, 130, 246, 0.35) !important;
          border-color: rgba(255, 255, 255, 0.3) !important;
          transform: scale(1.02) !important;
        }

        .calendar-today .calendar-day-button:hover {
          background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;
          transform: translateY(-4px) scale(1.1) !important;
          box-shadow: 0 16px 35px rgba(59, 130, 246, 0.45) !important;
        }

        /* 今天且有打卡记录 */
        .calendar-today.has-checkin-day .calendar-day-button {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed) !important;
          border: 3px solid #3b82f6 !important;
          box-shadow: 0 6px 24px rgba(139, 92, 246, 0.4) !important;
          transform: scale(1.05) !important;
        }

        .calendar-today.has-checkin-day .calendar-day-button:hover {
          background: linear-gradient(135deg, #7c3aed, #6d28d9) !important;
          transform: translateY(-4px) scale(1.12) !important;
          box-shadow: 0 18px 40px rgba(139, 92, 246, 0.55) !important;
        }

        /* 其他月份的日期 */
        .calendar-outside .calendar-day-button {
          color: #cbd5e1 !important;
          background: #f8fafc !important;
          border-color: #f1f5f9 !important;
          opacity: 0.6 !important;
        }

        .calendar-outside .calendar-day-button:hover {
          color: #94a3b8 !important;
          background: #f1f5f9 !important;
          transform: scale(1.02) !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06) !important;
          opacity: 0.8 !important;
        }

        /* 选中状态 */
        .calendar-selected .calendar-day-button {
          border-color: #ff6b6b !important;
          background: linear-gradient(135deg, #ff6b6b, #ee5a52) !important;
          color: white !important;
          transform: scale(1.08) !important;
          box-shadow: 0 8px 28px rgba(238, 90, 82, 0.4) !important;
        }

        /* 禁用状态 */
        .calendar-disabled .calendar-day-button {
          opacity: 0.25 !important;
          cursor: not-allowed !important;
          transform: none !important;
          background: #f8fafc !important;
          color: #cbd5e1 !important;
        }

        .calendar-disabled .calendar-day-button:hover {
          transform: none !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
          opacity: 0.25 !important;
        }
      `}</style>
    </Dialog.Root>
  );
};

export default CalendarModal;
