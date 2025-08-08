import React, { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  Brain,
  CheckSquare,
  Square,
  Sparkles,
  Clock,
  Target,
  AlertCircle,
} from "lucide-react";
import { EnhancedDialog } from "./EnhancedDialog";
import type { AIHabitSuggestion } from "../../types";

interface AIHabitsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalName: string;
  habits: AIHabitSuggestion[] | null;
  isGenerating: boolean;
  error: string | null;
  onAddHabits: (selectedHabits: string[]) => void;
  onRetry: () => void;
}

export const AIHabitsDialog: React.FC<AIHabitsDialogProps> = ({
  open,
  onOpenChange,
  goalName,
  habits,
  isGenerating,
  error,
  onAddHabits,
  onRetry,
}) => {
  const [selectedHabits, setSelectedHabits] = useState<Set<string>>(new Set());

  // 重置选中状态当对话框关闭时
  useEffect(() => {
    if (!open) {
      setSelectedHabits(new Set());
    }
  }, [open]);

  const toggleHabitSelection = (habitName: string) => {
    const newSelected = new Set(selectedHabits);
    if (newSelected.has(habitName)) {
      newSelected.delete(habitName);
    } else {
      newSelected.add(habitName);
    }
    setSelectedHabits(newSelected);
  };

  const selectAll = () => {
    if (habits) {
      setSelectedHabits(new Set(habits.map((h) => h.name)));
    }
  };

  const selectNone = () => {
    setSelectedHabits(new Set());
  };

  const handleAddSelected = () => {
    const selectedHabitNames = Array.from(selectedHabits);
    onAddHabits(selectedHabitNames);
    onOpenChange(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "简单":
        return "bg-green-100 text-green-700";
      case "中等":
        return "bg-yellow-100 text-yellow-700";
      case "困难":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <EnhancedDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={selectedHabits.size > 0 ? handleAddSelected : undefined}
      confirmDisabled={selectedHabits.size === 0 || isGenerating}
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 shadow-2xl z-50"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <Dialog.Title className="text-xl font-semibold text-gray-800">
              AI 习惯建议
            </Dialog.Title>
            <p className="text-sm text-gray-500">为 "{goalName}" 生成的习惯</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog.Close asChild>
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </Dialog.Close>
        </div>
      </div>

      {/* 加载状态 */}
      {isGenerating && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-purple-500 animate-pulse" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            AI 正在思考...
          </h3>
          <p className="text-gray-500">为您生成个性化的习惯建议</p>
        </div>
      )}

      {/* 错误状态 */}
      {error && !isGenerating && (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">生成失败</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-[#FF5A5F] text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            重试
          </button>
        </div>
      )}

      {/* 习惯列表 */}
      {habits && habits.length > 0 && !isGenerating && (
        <>
          {/* 操作栏 */}
          <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              已选择 {selectedHabits.size} / {habits.length} 个习惯
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={selectAll}
                className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
              >
                全选
              </button>
              <button
                onClick={selectNone}
                className="text-xs px-2 py-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                清空
              </button>
            </div>
          </div>

          {/* 习惯卡片列表 */}
          <div className="max-h-96 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {habits.map((habit, index) => (
              <div
                key={index}
                className={`border-2 rounded-xl p-4 transition-all duration-200 cursor-pointer hover:shadow-md ${
                  selectedHabits.has(habit.name)
                    ? "border-[#FF5A5F] bg-pink-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => toggleHabitSelection(habit.name)}
              >
                <div className="flex items-start space-x-3">
                  <button
                    className="flex-shrink-0 mt-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleHabitSelection(habit.name);
                    }}
                  >
                    {selectedHabits.has(habit.name) ? (
                      <CheckSquare className="w-5 h-5 text-[#FF5A5F]" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-800 leading-tight">
                        {habit.name}
                      </h4>
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium flex-shrink-0 ml-2 ${getDifficultyColor(
                          habit.difficulty
                        )}`}
                      >
                        {habit.difficulty}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                      {habit.description}
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>建议频率：{habit.frequency}</span>
                      </div>

                      <div className="flex items-start space-x-2 text-xs text-gray-500">
                        <Target className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span className="leading-relaxed">{habit.tips}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 底部操作按钮 */}
      {habits && habits.length > 0 && !isGenerating && (
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
          <Dialog.Close asChild>
            <button className="px-6 py-2.5 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium">
              取消
            </button>
          </Dialog.Close>
          <button
            onClick={handleAddSelected}
            disabled={selectedHabits.size === 0}
            className="px-6 py-2.5 bg-[#FF5A5F] text-white rounded-xl hover:bg-pink-600 transition-colors duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            添加选中的习惯 ({selectedHabits.size})
          </button>
        </div>
      )}
    </EnhancedDialog>
  );
};
