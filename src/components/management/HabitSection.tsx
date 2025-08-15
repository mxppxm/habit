import React from "react";
import { Target, Plus, CheckSquare, X, Archive, Trash2, Info, Edit2, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HabitSectionProps {
  habits: any[];
  categories: any[];
  habitLogs: any[];
  selectedHabits: Set<string>;
  batchMode: boolean;
  selectedCategoryFilter: string | null;
  onEnterBatchMode: () => void;
  onExitBatchMode: () => void;
  onSelectAll: () => void;
  onToggleSelection: (id: string) => void;
  onAddHabit: () => void;
  onEditHabit: (habit: any) => void;
  onDeleteHabit: (id: string) => void;
  onBatchDelete: () => void;
  onBatchMove: () => void;
  onClearFilter: () => void;
}

export const HabitSection: React.FC<HabitSectionProps> = ({
  habits,
  categories,
  habitLogs,
  selectedHabits,
  batchMode,
  selectedCategoryFilter,
  onAddHabit,
  onEditHabit,
  onDeleteHabit,
  onEnterBatchMode,
  onExitBatchMode,
  onToggleSelection,
  onSelectAll,
  onBatchDelete,
  onBatchMove,
  onClearFilter,
}) => {
  const navigate = useNavigate();
  const habitBatchMode = batchMode;
  const filteredHabits = habits;

  return (
    <div className="w-full lg:w-3/5 xl:w-2/3 min-h-0">
      <div className="card p-4 sm:p-6 lg:p-8 h-full flex flex-col">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <Target className="w-6 h-6 text-[#FF5A5F]" />
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
              习惯
            </h2>
            {selectedCategoryFilter && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">筛选:</span>
                <span className="bg-gradient-to-r from-orange-100 to-pink-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                  {categories.find((c) => c.id === selectedCategoryFilter)?.name || "未知目标"}
                </span>
                <button
                  onClick={onClearFilter}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="清除筛选"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {habitBatchMode && selectedHabits.size > 0 && (
              <span className="bg-[#FF5A5F] text-white px-2 py-1 rounded-full text-sm">
                已选择 {selectedHabits.size} 项
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!habitBatchMode ? (
              <>
                {filteredHabits.length > 0 && (
                  <button
                    onClick={onEnterBatchMode}
                    className="inline-flex items-center space-x-2 px-3 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm"
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span className="hidden sm:inline">批量选择</span>
                  </button>
                )}
                <button
                  onClick={onAddHabit}
                  className="inline-flex items-center space-x-2 px-3 sm:px-4 py-2 bg-[#FF5A5F] text-white rounded-lg hover:bg-pink-600 transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">创建习惯</span>
                  <span className="sm:hidden">创建</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onSelectAll}
                  className="inline-flex items-center space-x-2 px-3 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-all duration-200 text-sm"
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>全选</span>
                  <span className="text-xs opacity-70 hidden sm:inline">
                    {filteredHabits.length} 项
                  </span>
                </button>
                {selectedHabits.size > 0 && (
                  <>
                    <button
                      onClick={onBatchMove}
                      className="inline-flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 text-sm"
                    >
                      <Archive className="w-4 h-4" />
                      <span>移动到</span>
                    </button>
                    <button
                      onClick={onBatchDelete}
                      className="inline-flex items-center space-x-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>删除</span>
                      <span className="text-xs opacity-70 hidden sm:inline">Del</span>
                    </button>
                  </>
                )}
                <button
                  onClick={onExitBatchMode}
                  className="inline-flex items-center space-x-2 px-3 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm"
                >
                  <X className="w-4 h-4" />
                  <span>退出</span>
                  <span className="text-xs opacity-70 hidden sm:inline">Esc</span>
                </button>
              </>
            )}
          </div>
        </div>

        {filteredHabits.length > 0 ? (
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar min-h-0">
            {filteredHabits.map((habit) => {
              const category = categories.find((c) => c.id === habit.categoryId);
              return (
                <div
                  key={habit.id}
                  className={`group flex items-center justify-between p-3 lg:p-4 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer ${
                    habitBatchMode && selectedHabits.has(habit.id)
                      ? "border-[#FF5A5F] bg-pink-50"
                      : "border-gray-200 hover:border-[#FF5A5F]"
                  }`}
                  onClick={() => {
                    if (habitBatchMode) {
                      onToggleSelection(habit.id);
                    }
                  }}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {habitBatchMode && (
                      <div className="flex-shrink-0">
                        {selectedHabits.has(habit.id) ? (
                          <CheckSquare className="w-5 h-5 text-[#FF5A5F]" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                        <span className="font-medium text-gray-800 text-base sm:text-lg truncate">
                          {habit.name}
                        </span>
                        {category && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full flex-shrink-0">
                            {category.name}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col space-y-1">
                        {habit.reminderTime && (
                          <div className="flex items-center space-x-1 text-xs sm:text-sm text-gray-500">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>提醒时间：{habit.reminderTime}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <CheckSquare className="w-3 h-3" />
                          <span>
                            已打卡：
                            {habitLogs.filter((log) => log.habitId === habit.id).length} 次
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {!habitBatchMode && (
                    <div className="flex items-center space-x-1 sm:space-x-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/habit/${habit.id}`);
                        }}
                        className="flex items-center space-x-1 px-2 sm:px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
                      >
                        <Info className="w-4 h-4" />
                        <span className="text-xs sm:text-sm hidden sm:inline">详情</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditHabit(habit);
                        }}
                        className="flex items-center space-x-1 px-2 sm:px-3 py-1.5 text-[#00A699] hover:bg-green-50 rounded-md transition-colors duration-200"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span className="text-xs sm:text-sm hidden sm:inline">编辑</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteHabit(habit.id);
                        }}
                        className="flex items-center space-x-1 px-2 sm:px-3 py-1.5 text-[#FC642D] hover:bg-red-50 rounded-md transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-xs sm:text-sm hidden sm:inline">删除</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Target className="w-8 h-8 text-gray-400" />
            </div>
            {selectedCategoryFilter ? (
              <>
                <p className="text-gray-500 text-lg mb-2">该目标下还没有习惯</p>
                <p className="text-gray-400 text-sm">为这个目标创建一些习惯吧</p>
                <button
                  onClick={onClearFilter}
                  className="mt-4 px-4 py-2 text-sm text-orange-600 hover:text-orange-700 border border-orange-200 hover:border-orange-300 rounded-lg transition-colors"
                >
                  查看所有习惯
                </button>
              </>
            ) : (
              <>
                <p className="text-gray-500 text-lg mb-2">还没有创建习惯</p>
                <p className="text-gray-400 text-sm">创建你的习惯来达成目标</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// 添加缺失的 Square 图标导入
const Square: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
  </svg>
);
