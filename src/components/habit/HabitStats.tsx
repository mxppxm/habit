import React from "react";
import { Target, TrendingUp, Calendar, CheckCircle2 } from "lucide-react";

interface HabitStatsProps {
  totalDays: number;
  currentStreak: number;
  thisWeekCount: number;
  thisMonthCount: number;
  onStatsClick: (type: "total" | "streak" | "thisWeek" | "thisMonth") => void;
}

export const HabitStats: React.FC<HabitStatsProps> = ({
  totalDays,
  currentStreak,
  thisWeekCount,
  thisMonthCount,
  onStatsClick,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
      <button
        onClick={() => onStatsClick("total")}
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
        onClick={() => onStatsClick("streak")}
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
        onClick={() => onStatsClick("thisWeek")}
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
        onClick={() => onStatsClick("thisMonth")}
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
  );
};
