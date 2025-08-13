import React, { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useHabitStore } from "../stores/useHabitStore";
import { useNavigate } from "react-router-dom";
import { formatShortcut } from "../hooks/useKeyboardShortcuts";
import { EnhancedDialog } from "../components/ui/EnhancedDialog";
import { AIHabitsDialog } from "../components/ui/AIHabitsDialog";
import { useAI } from "../hooks/useAI";
import type { AIHabitSuggestion } from "../types";
import {
  Plus,
  X,
  Edit2,
  Trash2,
  Clock,
  ChevronDown,
  Tag,
  Info,
  CheckSquare,
  Square,
  FolderOpen,
  Target,
  Archive,
  Brain,
} from "lucide-react";

// 自定义时间选择器组件
const TimePicker: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0")
  );
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0")
  );

  const [hour, minute] = value ? value.split(":") : ["08", "00"];

  const handleTimeChange = (newHour: string, newMinute: string) => {
    onChange(`${newHour}:${newMinute}`);
    setIsOpen(false);
  };

  // 关闭下拉菜单当点击外部时
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".time-picker-container")) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative time-picker-container">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent outline-none transition-all duration-200 text-left flex items-center justify-between bg-white"
      >
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-gray-400" />
          <span className={value ? "text-gray-900" : "text-gray-400"}>
            {value || "不设置提醒时间"}
          </span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-[60] p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">小时</p>
              <div className="max-h-32 overflow-y-auto border border-gray-100 rounded-lg custom-scrollbar">
                {hours.map((h) => (
                  <button
                    key={h}
                    onClick={() => handleTimeChange(h, minute)}
                    className={`w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors text-sm ${
                      h === hour
                        ? "bg-[#FF5A5F] text-white hover:bg-[#FF5A5F]"
                        : ""
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">分钟</p>
              <div className="max-h-32 overflow-y-auto border border-gray-100 rounded-lg custom-scrollbar">
                {minutes
                  .filter((_, i) => i % 5 === 0)
                  .map((m) => (
                    <button
                      key={m}
                      onClick={() => handleTimeChange(hour, m)}
                      className={`w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors text-sm ${
                        m === minute
                          ? "bg-[#FF5A5F] text-white hover:bg-[#FF5A5F]"
                          : ""
                      }`}
                    >
                      {m}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 自定义目标选择器组件
const CategorySelector: React.FC<{
  value: string;
  onChange: (value: string) => void;
  categories: { id: string; name: string }[];
  placeholder?: string;
}> = ({ value, onChange, categories, placeholder = "请选择目标" }) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedCategory = categories.find((cat) => cat.id === value);

  // 关闭下拉菜单当点击外部时
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".category-selector-container")) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative category-selector-container">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent outline-none transition-all duration-200 text-left flex items-center justify-between bg-white"
      >
        <div className="flex items-center space-x-2">
          <Tag className="w-5 h-5 text-gray-400" />
          <span
            className={selectedCategory ? "text-gray-900" : "text-gray-400"}
          >
            {selectedCategory ? selectedCategory.name : placeholder}
          </span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-[60] max-h-60 overflow-hidden">
          {categories.length > 0 ? (
            <div className="py-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    onChange(category.id);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3 ${
                    category.id === value
                      ? "bg-[#FF5A5F] text-white hover:bg-[#FF5A5F]"
                      : ""
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full ${
                      category.id === value ? "bg-white" : "bg-[#FF5A5F]"
                    }`}
                  ></div>
                  <span className="font-medium">{category.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <Tag className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">暂无目标</p>
              <p className="text-xs text-gray-400">请先创建目标</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Management: React.FC = () => {
  const navigate = useNavigate();
  const { categories, addCategory, updateCategory, deleteCategory } =
    useHabitStore();
  const { habits, addHabit, updateHabit, deleteHabit, updateHabitCategory } =
    useHabitStore();
  const { aiEnabled, apiKey, habitLogs, init, loading } = useHabitStore();
  const [categoryName, setCategoryName] = useState("");
  const [editCategory, setEditCategory] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [habitName, setHabitName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [reminderTime, setReminderTime] = useState("");
  const [editHabit, setEditHabit] = useState<any>(null);
  const [habitDialogOpen, setHabitDialogOpen] = useState(false);

  // 批量选择状态
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  );
  const [selectedHabits, setSelectedHabits] = useState<Set<string>>(new Set());
  const [batchMode, setBatchMode] = useState(false);
  const [showBatchCategoryActions, setShowBatchCategoryActions] =
    useState(false);
  const [showBatchHabitActions, setShowBatchHabitActions] = useState(false);
  const [batchMoveToCategory, setBatchMoveToCategory] = useState("");
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);

  // 动态输入状态
  const [categoryInputs, setCategoryInputs] = useState<string[]>([""]);
  const [habitInputs, setHabitInputs] = useState<string[]>([""]);
  const [habitReminderTimes, setHabitReminderTimes] = useState<string[]>([""]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  // AI 相关状态
  const {
    isGenerating,
    error: aiError,
    generateHabits,
    clearError: clearAIError,
  } = useAI(apiKey);
  const [aiDialogOpen, setAIDialogOpen] = useState(false);
  const [currentGoalForAI, setCurrentGoalForAI] = useState<string>("");
  const [aiHabits, setAIHabits] = useState<AIHabitSuggestion[] | null>(null);

  // 目标筛选状态
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<
    string | null
  >(null);

  // 处理目标点击筛选
  const handleCategoryClick = (categoryId: string) => {
    if (batchMode) return; // 批量模式下不处理筛选
    setSelectedCategoryFilter(
      selectedCategoryFilter === categoryId ? null : categoryId
    );
  };

  // 获取筛选后的习惯列表
  const filteredHabits = selectedCategoryFilter
    ? habits.filter((habit) => habit.categoryId === selectedCategoryFilter)
    : habits;

  // 初始化数据
  useEffect(() => {
    init();
  }, [init]);

  // 快捷键处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (batchMode) {
        // Ctrl+A 全选
        if (e.ctrlKey && e.key === "a") {
          e.preventDefault();
          if (showBatchCategoryActions) {
            setSelectedCategories(new Set(categories.map((c) => c.id)));
          } else if (showBatchHabitActions) {
            setSelectedHabits(new Set(filteredHabits.map((h) => h.id)));
          }
        }
        // Delete 删除选中项
        else if (e.key === "Delete") {
          e.preventDefault();
          if (selectedCategories.size > 0) {
            handleBatchDeleteCategories();
          } else if (selectedHabits.size > 0) {
            handleBatchDeleteHabits();
          }
        }
        // Escape 退出批量模式
        else if (e.key === "Escape") {
          e.preventDefault();
          exitBatchMode();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    batchMode,
    showBatchCategoryActions,
    showBatchHabitActions,
    selectedCategories,
    selectedHabits,
    categories,
    filteredHabits,
  ]);

  // 批量操作函数
  const enterBatchMode = () => {
    setBatchMode(true);
    setSelectedCategories(new Set());
    setSelectedHabits(new Set());
  };

  const exitBatchMode = () => {
    setBatchMode(false);
    setSelectedCategories(new Set());
    setSelectedHabits(new Set());
    setShowBatchCategoryActions(false);
    setShowBatchHabitActions(false);
  };

  const toggleCategorySelection = (categoryId: string) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId);
    } else {
      newSelected.add(categoryId);
    }
    setSelectedCategories(newSelected);
    setShowBatchCategoryActions(newSelected.size > 0);
  };

  const toggleHabitSelection = (habitId: string) => {
    const newSelected = new Set(selectedHabits);
    if (newSelected.has(habitId)) {
      newSelected.delete(habitId);
    } else {
      newSelected.add(habitId);
    }
    setSelectedHabits(newSelected);
    setShowBatchHabitActions(newSelected.size > 0);
  };

  const selectAllCategories = () => {
    setSelectedCategories(new Set(categories.map((c) => c.id)));
    setShowBatchCategoryActions(true);
  };

  const selectAllHabits = () => {
    setSelectedHabits(new Set(filteredHabits.map((h) => h.id)));
    setShowBatchHabitActions(true);
  };

  const handleBatchDeleteCategories = async () => {
    if (selectedCategories.size === 0) return;

    if (confirm(`确定要删除选中的 ${selectedCategories.size} 个目标吗？`)) {
      try {
        for (const categoryId of selectedCategories) {
          await deleteCategory(categoryId);
        }
        exitBatchMode();
      } catch (error) {
        alert("删除目标时出错，请重试");
      }
    }
  };

  const handleBatchDeleteHabits = async () => {
    if (selectedHabits.size === 0) return;

    if (confirm(`确定要删除选中的 ${selectedHabits.size} 个习惯吗？`)) {
      try {
        for (const habitId of selectedHabits) {
          await deleteHabit(habitId);
        }
        exitBatchMode();
      } catch (error) {
        alert("删除习惯时出错，请重试");
      }
    }
  };

  const handleBatchMoveHabits = async () => {
    if (selectedHabits.size === 0 || !batchMoveToCategory) return;

    try {
      for (const habitId of selectedHabits) {
        await updateHabitCategory(habitId, batchMoveToCategory);
      }
      exitBatchMode();
      setBatchDialogOpen(false);
      setBatchMoveToCategory("");
    } catch (error) {
      alert("移动习惯时出错，请重试");
    }
  };

  // 动态输入管理函数
  const MAX_INPUTS = 10;

  const addCategoryInput = () => {
    if (categoryInputs.length < MAX_INPUTS) {
      setCategoryInputs([...categoryInputs, ""]);
      setFocusedIndex(categoryInputs.length);
    }
  };

  const removeCategoryInput = (index: number) => {
    if (categoryInputs.length > 1) {
      const newInputs = categoryInputs.filter((_, i) => i !== index);
      setCategoryInputs(newInputs);
      setFocusedIndex(Math.max(0, index - 1));
    }
  };

  const updateCategoryInput = (index: number, value: string) => {
    const newInputs = [...categoryInputs];
    newInputs[index] = value;
    setCategoryInputs(newInputs);
  };

  const addHabitInput = () => {
    if (habitInputs.length < MAX_INPUTS) {
      setHabitInputs([...habitInputs, ""]);
      setHabitReminderTimes([...habitReminderTimes, ""]);
      setFocusedIndex(habitInputs.length);
    }
  };

  const removeHabitInput = (index: number) => {
    if (habitInputs.length > 1) {
      const newInputs = habitInputs.filter((_, i) => i !== index);
      const newTimes = habitReminderTimes.filter((_, i) => i !== index);
      setHabitInputs(newInputs);
      setHabitReminderTimes(newTimes);
      setFocusedIndex(Math.max(0, index - 1));
    }
  };

  const updateHabitInput = (index: number, value: string) => {
    const newInputs = [...habitInputs];
    newInputs[index] = value;
    setHabitInputs(newInputs);
  };

  const updateHabitReminderTime = (index: number, value: string) => {
    const newTimes = [...habitReminderTimes];
    newTimes[index] = value;
    setHabitReminderTimes(newTimes);
  };

  // 处理对话框内的快捷键
  const handleDialogKeyDown = (
    e: React.KeyboardEvent,
    isHabit: boolean = false,
    index?: number
  ) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (isHabit) {
        if (habitInputs.length < MAX_INPUTS) {
          addHabitInput();
        }
      } else {
        if (categoryInputs.length < MAX_INPUTS) {
          addCategoryInput();
        }
      }
    } else if (e.key === "Enter" && !e.metaKey && !e.ctrlKey) {
      // 单独的Enter键提交表单
      e.preventDefault();
      if (isHabit) {
        handleHabitSubmit();
      } else {
        handleCategorySubmit();
      }
    } else if ((e.metaKey || e.ctrlKey) && e.key === "Backspace") {
      // Cmd+Delete (在Mac上Backspace就是Delete)
      e.preventDefault();
      if (typeof index !== "undefined") {
        if (isHabit) {
          if (habitInputs.length > 1) {
            removeHabitInput(index);
          }
        } else {
          if (categoryInputs.length > 1) {
            removeCategoryInput(index);
          }
        }
      }
    }
  };

  const handleCategorySubmit = async () => {
    if (editCategory) {
      // 编辑模式，只处理单个目标
      if (!categoryName.trim()) return;
      await updateCategory(editCategory.id, categoryName);
      setEditCategory(null);
      setCategoryName("");
    } else {
      // 创建模式，处理所有有效的输入
      const validNames = categoryInputs.filter(
        (name) => name.trim().length > 0
      );
      if (validNames.length === 0) return;

      try {
        for (const name of validNames) {
          await addCategory(name.trim());
        }
        setCategoryInputs([""]);
      } catch (error) {
        alert("创建目标时出错，请重试");
        return;
      }
    }
    setCategoryDialogOpen(false);
  };

  const handleHabitSubmit = async () => {
    if (editHabit) {
      // 编辑模式，只处理单个习惯
      if (!habitName.trim() || !selectedCategory) return;
      await updateHabit(editHabit.id, habitName, reminderTime);
      setEditHabit(null);
      setHabitName("");
      setSelectedCategory("");
      setReminderTime("");
    } else {
      // 创建模式，处理所有有效的输入
      const validInputs = habitInputs
        .map((name, index) => ({
          name: name.trim(),
          reminderTime: habitReminderTimes[index] || "",
        }))
        .filter((input) => input.name.length > 0);

      if (validInputs.length === 0 || !selectedCategory) return;

      try {
        for (const input of validInputs) {
          await addHabit(selectedCategory, input.name, input.reminderTime);
        }
        setHabitInputs([""]);
        setHabitReminderTimes([""]);
        setSelectedCategory("");
      } catch (error) {
        alert("创建习惯时出错，请重试");
        return;
      }
    }
    setHabitDialogOpen(false);
  };

  const openAddCategoryDialog = () => {
    setEditCategory(null);
    setCategoryName("");
    setCategoryInputs([""]);
    setFocusedIndex(0);
    setCategoryDialogOpen(true);
  };

  const openEditCategoryDialog = (category: { id: string; name: string }) => {
    setEditCategory(category);
    setCategoryName(category.name);
    setCategoryDialogOpen(true);
  };

  const openAddHabitDialog = () => {
    setEditHabit(null);
    setHabitName("");
    setHabitInputs([""]);
    setHabitReminderTimes([""]);
    setFocusedIndex(0);
    // 如果有筛选的目标，默认选择筛选的目标；否则选择第一个目标
    const defaultCategory =
      selectedCategoryFilter || (categories.length > 0 ? categories[0].id : "");
    setSelectedCategory(defaultCategory);
    setReminderTime("");
    setHabitDialogOpen(true);
  };

  const openEditHabitDialog = (habit: any) => {
    setEditHabit(habit);
    setHabitName(habit.name);
    setSelectedCategory(habit.categoryId);
    setReminderTime(habit.reminderTime || "");
    setHabitDialogOpen(true);
  };

  // AI 相关处理函数
  const handleGenerateAIHabits = async (goalName: string) => {
    setCurrentGoalForAI(goalName);
    clearAIError();
    setAIDialogOpen(true);

    try {
      const result = await generateHabits(goalName);
      if (result) {
        setAIHabits(result.habits);
      }
    } catch (error) {
      console.error("生成 AI 习惯失败:", error);
    }
  };

  const handleRetryAIGeneration = async () => {
    if (currentGoalForAI) {
      clearAIError();
      try {
        const result = await generateHabits(currentGoalForAI);
        if (result) {
          setAIHabits(result.habits);
        }
      } catch (error) {
        console.error("重试生成 AI 习惯失败:", error);
      }
    }
  };

  const handleAddAIHabits = async (selectedHabitNames: string[]) => {
    const targetCategory = categories.find((c) => c.name === currentGoalForAI);
    if (!targetCategory) {
      alert("找不到目标分类，请重试");
      return;
    }

    try {
      for (const habitName of selectedHabitNames) {
        await addHabit(targetCategory.id, habitName, "");
      }

      // 重置状态
      setAIDialogOpen(false);
      setCurrentGoalForAI("");
      setAIHabits(null);
      clearAIError();
    } catch (error) {
      console.error("添加 AI 习惯失败:", error);
      alert("添加习惯时出错，请重试");
    }
  };

  const handleCloseAIDialog = () => {
    setAIDialogOpen(false);
    setCurrentGoalForAI("");
    setAIHabits(null);
    clearAIError();
  };

  return (
    <div className="space-y-8">
      {/* 目标 */}
      <div className="card p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <FolderOpen className="w-6 h-6 text-[#FF5A5F]" />
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
              目标
            </h2>
            {batchMode && selectedCategories.size > 0 && (
              <span className="bg-[#FF5A5F] text-white px-2 py-1 rounded-full text-sm">
                已选择 {selectedCategories.size} 项
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {!batchMode ? (
              <>
                {categories.length > 0 && (
                  <button
                    onClick={enterBatchMode}
                    className="inline-flex items-center space-x-2 px-3 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm"
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span className="hidden sm:inline">批量选择</span>
                  </button>
                )}
                <button
                  onClick={openAddCategoryDialog}
                  className="inline-flex items-center space-x-2 px-3 sm:px-4 py-2 bg-[#FF5A5F] text-white rounded-lg hover:bg-pink-600 transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">新建目标</span>
                  <span className="sm:hidden">新建</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={selectAllCategories}
                  className="inline-flex items-center space-x-2 px-3 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-all duration-200 text-sm"
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>全选</span>
                  <span className="text-xs opacity-70 hidden sm:inline">
                    Ctrl+A
                  </span>
                </button>
                {selectedCategories.size > 0 && (
                  <button
                    onClick={handleBatchDeleteCategories}
                    className="inline-flex items-center space-x-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>删除</span>
                    <span className="text-xs opacity-70 hidden sm:inline">
                      Del
                    </span>
                  </button>
                )}
                <button
                  onClick={exitBatchMode}
                  className="inline-flex items-center space-x-2 px-3 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm"
                >
                  <X className="w-4 h-4" />
                  <span>退出</span>
                  <span className="text-xs opacity-70 hidden sm:inline">
                    Esc
                  </span>
                </button>
              </>
            )}
          </div>
        </div>

        {categories.length > 0 ? (
          <div className="space-y-3">
            {!batchMode && (
              <div className="text-sm text-gray-500 mb-4 flex items-center space-x-2">
                <span>💡 点击目标卡片来筛选相关习惯</span>
              </div>
            )}
            {categories.map((category) => (
              <div
                key={category.id}
                className={`group flex items-center justify-between p-3 sm:p-4 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer ${
                  batchMode && selectedCategories.has(category.id)
                    ? "border-[#FF5A5F] bg-pink-50"
                    : selectedCategoryFilter === category.id
                    ? "border-[#FF5A5F] bg-gradient-to-r from-pink-50 to-orange-50 shadow-md"
                    : "border-gray-200 hover:border-[#FF5A5F]"
                }`}
                onClick={() => handleCategoryClick(category.id)}
              >
                <div className="flex items-center space-x-3">
                  {batchMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCategorySelection(category.id);
                      }}
                      className="flex-shrink-0"
                    >
                      {selectedCategories.has(category.id) ? (
                        <CheckSquare className="w-5 h-5 text-[#FF5A5F]" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400 hover:text-[#FF5A5F]" />
                      )}
                    </button>
                  )}
                  <div
                    className={`w-3 h-3 rounded-full ${
                      selectedCategoryFilter === category.id
                        ? "bg-orange-500"
                        : "bg-[#FF5A5F]"
                    }`}
                  ></div>
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-800">
                        {category.name}
                      </span>
                      {selectedCategoryFilter === category.id && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                          已筛选
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {
                        habits.filter((h) => h.categoryId === category.id)
                          .length
                      }{" "}
                      个习惯
                    </span>
                  </div>
                </div>
                {!batchMode && (
                  <div className="flex items-center space-x-1 sm:space-x-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {aiEnabled && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerateAIHabits(category.name);
                        }}
                        className="flex items-center space-x-1 px-2 sm:px-3 py-1.5 text-purple-600 hover:bg-purple-50 rounded-md transition-colors duration-200"
                        title="AI 生成习惯"
                      >
                        <Brain className="w-4 h-4" />
                        <span className="text-xs sm:text-sm hidden sm:inline">
                          AI生成
                        </span>
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditCategoryDialog(category);
                      }}
                      className="flex items-center space-x-1 px-2 sm:px-3 py-1.5 text-[#00A699] hover:bg-green-50 rounded-md transition-colors duration-200"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span className="text-xs sm:text-sm hidden sm:inline">
                        编辑
                      </span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCategory(category.id);
                      }}
                      className="flex items-center space-x-1 px-2 sm:px-3 py-1.5 text-[#FC642D] hover:bg-red-50 rounded-md transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-xs sm:text-sm hidden sm:inline">
                        删除
                      </span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg mb-2">还没有目标</p>
            <p className="text-gray-400 text-sm">创建目标来领导你的习惯</p>
          </div>
        )}

        <EnhancedDialog
          open={categoryDialogOpen}
          onOpenChange={setCategoryDialogOpen}
          onConfirm={handleCategorySubmit}
          confirmDisabled={
            editCategory
              ? !categoryName.trim()
              : categoryInputs.every((name) => !name.trim())
          }
          confirmShortcut={{ key: "Enter", ctrlKey: false, metaKey: false }}
        >
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-2xl font-semibold text-gray-800">
              {editCategory ? "编辑目标" : "新建目标"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            {editCategory ? (
              // 编辑模式：单个输入框
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  目标名称
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent outline-none transition-all duration-200"
                  placeholder="输入目标名称"
                  autoFocus
                />
              </div>
            ) : (
              // 新建模式：动态输入框
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <label className="block text-lg font-semibold text-gray-800 mb-1">
                      创建目标
                    </label>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full">
                        <span className="text-sm font-medium text-purple-700">
                          {categoryInputs.length} / {MAX_INPUTS}
                        </span>
                      </div>
                      <div className="relative group">
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                          <Info className="w-4 h-4" />
                        </button>
                        <div className="absolute right-0 top-8 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap shadow-lg">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs font-mono">
                                ⌘
                              </kbd>
                              <span>+</span>
                              <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs font-mono">
                                Enter
                              </kbd>
                              <span className="text-gray-300">添加新项</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs font-mono">
                                ⌘
                              </kbd>
                              <span>+</span>
                              <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs font-mono">
                                Del
                              </kbd>
                              <span className="text-gray-300">删除当前项</span>
                            </div>
                          </div>
                          <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-900 rotate-45"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                  {categoryInputs.map((value, index) => (
                    <div key={index} className="group relative">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#FF5A5F] to-pink-500 rounded-full flex items-center justify-center shadow-md">
                          <span className="text-white text-sm font-semibold">
                            {index + 1}
                          </span>
                        </div>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) =>
                            updateCategoryInput(index, e.target.value)
                          }
                          onKeyDown={(e) =>
                            handleDialogKeyDown(e, false, index)
                          }
                          className="flex-1 px-4 py-3 border-2 border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#FF5A5F]/20 focus:border-[#FF5A5F] outline-none transition-all duration-300 bg-gray-50/50 hover:bg-white hover:border-gray-200"
                          placeholder={`目标名称 ${index + 1}，如：健康生活`}
                          autoFocus={index === focusedIndex}
                        />
                        {categoryInputs.length > 1 && (
                          <button
                            onClick={() => removeCategoryInput(index)}
                            className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200"
                            type="button"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {categoryInputs.length >= MAX_INPUTS ? (
                  <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-2xl">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      <span className="text-sm text-orange-700 font-medium">
                        已达到最大数量限制 ({MAX_INPUTS} 项)
                      </span>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={addCategoryInput}
                    className="w-full mt-4 py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-600 hover:border-[#FF5A5F] hover:text-[#FF5A5F] hover:bg-pink-50/50 transition-all duration-300 text-sm font-medium group"
                    type="button"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Plus className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                      <span>添加新目标</span>
                      <span className="text-xs text-gray-400">
                        ({categoryInputs.length}/{MAX_INPUTS})
                      </span>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-8">
            <Dialog.Close asChild>
              <button className="px-6 py-2.5 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium">
                取消
              </button>
            </Dialog.Close>
            <button
              onClick={handleCategorySubmit}
              className="px-6 py-2.5 bg-[#FF5A5F] text-white rounded-xl hover:bg-pink-600 transition-colors duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={
                editCategory
                  ? !categoryName.trim()
                  : categoryInputs.every((name) => !name.trim())
              }
            >
              {editCategory ? "保存" : "创建"}
              <span className="text-xs text-pink-200 ml-2 opacity-70">
                Enter
              </span>
            </button>
          </div>
        </EnhancedDialog>
      </div>

      {/* 习惯 */}
      <div className="card p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <Target className="w-6 h-6 text-[#FF5A5F]" />
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
              习惯
            </h2>
            {selectedCategoryFilter && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">筛选:</span>
                <span className="bg-gradient-to-r from-orange-100 to-pink-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                  {categories.find((c) => c.id === selectedCategoryFilter)
                    ?.name || "未知目标"}
                </span>
                <button
                  onClick={() => setSelectedCategoryFilter(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="清除筛选"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {batchMode && selectedHabits.size > 0 && (
              <span className="bg-[#FF5A5F] text-white px-2 py-1 rounded-full text-sm">
                已选择 {selectedHabits.size} 项
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {!batchMode ? (
              <>
                {filteredHabits.length > 0 && (
                  <button
                    onClick={enterBatchMode}
                    className="inline-flex items-center space-x-2 px-3 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm"
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span className="hidden sm:inline">批量选择</span>
                  </button>
                )}
                <button
                  onClick={openAddHabitDialog}
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
                  onClick={selectAllHabits}
                  className="inline-flex items-center space-x-2 px-3 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-all duration-200 text-sm"
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>全选</span>
                  <span className="text-xs opacity-70 hidden sm:inline">
                    Ctrl+A
                  </span>
                </button>
                {selectedHabits.size > 0 && (
                  <>
                    <button
                      onClick={() => setBatchDialogOpen(true)}
                      className="inline-flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 text-sm"
                    >
                      <Archive className="w-4 h-4" />
                      <span>移动到</span>
                    </button>
                    <button
                      onClick={handleBatchDeleteHabits}
                      className="inline-flex items-center space-x-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>删除</span>
                      <span className="text-xs opacity-70 hidden sm:inline">
                        Del
                      </span>
                    </button>
                  </>
                )}
                <button
                  onClick={exitBatchMode}
                  className="inline-flex items-center space-x-2 px-3 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm"
                >
                  <X className="w-4 h-4" />
                  <span>退出</span>
                  <span className="text-xs opacity-70 hidden sm:inline">
                    Esc
                  </span>
                </button>
              </>
            )}
          </div>
        </div>

        {filteredHabits.length > 0 ? (
          <div className="space-y-3">
            {filteredHabits.map((habit) => {
              const category = categories.find(
                (c) => c.id === habit.categoryId
              );
              return (
                <div
                  key={habit.id}
                  className={`group flex items-center justify-between p-3 sm:p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                    batchMode && selectedHabits.has(habit.id)
                      ? "border-[#FF5A5F] bg-pink-50"
                      : "border-gray-200 hover:border-[#FF5A5F]"
                  }`}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {batchMode && (
                      <button
                        onClick={() => toggleHabitSelection(habit.id)}
                        className="flex-shrink-0"
                      >
                        {selectedHabits.has(habit.id) ? (
                          <CheckSquare className="w-5 h-5 text-[#FF5A5F]" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400 hover:text-[#FF5A5F]" />
                        )}
                      </button>
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
                            {
                              habitLogs.filter(
                                (log) => log.habitId === habit.id
                              ).length
                            }{" "}
                            次
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {!batchMode && (
                    <div className="flex items-center space-x-1 sm:space-x-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => navigate(`/habit/${habit.id}`)}
                        className="flex items-center space-x-1 px-2 sm:px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
                      >
                        <Info className="w-4 h-4" />
                        <span className="text-xs sm:text-sm hidden sm:inline">
                          详情
                        </span>
                      </button>
                      <button
                        onClick={() => openEditHabitDialog(habit)}
                        className="flex items-center space-x-1 px-2 sm:px-3 py-1.5 text-[#00A699] hover:bg-green-50 rounded-md transition-colors duration-200"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span className="text-xs sm:text-sm hidden sm:inline">
                          编辑
                        </span>
                      </button>
                      <button
                        onClick={() => deleteHabit(habit.id)}
                        className="flex items-center space-x-1 px-2 sm:px-3 py-1.5 text-[#FC642D] hover:bg-red-50 rounded-md transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-xs sm:text-sm hidden sm:inline">
                          删除
                        </span>
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
                <p className="text-gray-400 text-sm">
                  为这个目标创建一些习惯吧
                </p>
                <button
                  onClick={() => setSelectedCategoryFilter(null)}
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

        <EnhancedDialog
          open={habitDialogOpen}
          onOpenChange={setHabitDialogOpen}
          onConfirm={handleHabitSubmit}
          confirmDisabled={
            editHabit
              ? !habitName.trim() || !selectedCategory
              : habitInputs.every((name) => !name.trim()) || !selectedCategory
          }
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 sm:p-8 w-full max-w-sm sm:max-w-lg mx-4 shadow-2xl z-50"
          confirmShortcut={{ key: "Enter", ctrlKey: false, metaKey: false }}
        >
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-2xl font-semibold text-gray-800">
              {editHabit ? "编辑习惯" : "创建习惯"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </Dialog.Close>
          </div>

          <div className="space-y-6">
            {!editHabit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择目标
                </label>
                <CategorySelector
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  categories={categories}
                  placeholder="请选择目标"
                />
                {categories.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    请先创建目标再添加习惯
                  </p>
                )}
              </div>
            )}

            {editHabit ? (
              // 编辑模式：单个输入框
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    习惯名称
                  </label>
                  <input
                    type="text"
                    value={habitName}
                    onChange={(e) => setHabitName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent outline-none transition-all duration-200"
                    placeholder="输入习惯名称"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    选择目标
                  </label>
                  <CategorySelector
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                    categories={categories}
                    placeholder="请选择目标"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    提醒时间{" "}
                    <span className="text-gray-400 font-normal">(可选)</span>
                  </label>
                  <TimePicker value={reminderTime} onChange={setReminderTime} />
                  <p className="text-xs text-gray-500 mt-1">
                    不设置时间则不会收到提醒
                  </p>
                </div>
              </>
            ) : (
              // 新建模式：动态输入框
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <label className="block text-lg font-semibold text-gray-800 mb-1">
                      创建习惯
                    </label>
                    <p className="text-sm text-gray-500">
                      设定你想要养成的好习惯
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full">
                        <span className="text-sm font-medium text-blue-700">
                          {habitInputs.length} / {MAX_INPUTS}
                        </span>
                      </div>
                      <div className="relative group">
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                          <Info className="w-4 h-4" />
                        </button>
                        <div className="absolute right-0 top-8 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap shadow-lg">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs font-mono">
                                ⌘
                              </kbd>
                              <span>+</span>
                              <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs font-mono">
                                Enter
                              </kbd>
                              <span className="text-gray-300">添加新项</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs font-mono">
                                ⌘
                              </kbd>
                              <span>+</span>
                              <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs font-mono">
                                Del
                              </kbd>
                              <span className="text-gray-300">删除当前项</span>
                            </div>
                          </div>
                          <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-900 rotate-45"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                  {habitInputs.map((value, index) => (
                    <div key={index} className="group relative">
                      <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-2xl p-4 border border-gray-100 hover:border-blue-200 transition-all duration-300">
                        <div className="flex items-start space-x-3 mb-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                            <span className="text-white text-sm font-semibold">
                              {index + 1}
                            </span>
                          </div>
                          <div className="flex-1 space-y-3">
                            <input
                              type="text"
                              value={value}
                              onChange={(e) =>
                                updateHabitInput(index, e.target.value)
                              }
                              onKeyDown={(e) =>
                                handleDialogKeyDown(e, true, index)
                              }
                              className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300 bg-white"
                              placeholder={`习惯名称 ${
                                index + 1
                              }，如：每天运动30分钟`}
                              autoFocus={index === focusedIndex}
                            />
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600 font-medium">
                                提醒时间
                              </span>
                              <TimePicker
                                value={habitReminderTimes[index] || ""}
                                onChange={(time) =>
                                  updateHabitReminderTime(index, time)
                                }
                              />
                            </div>
                          </div>
                          {habitInputs.length > 1 && (
                            <button
                              onClick={() => removeHabitInput(index)}
                              className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200"
                              type="button"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {habitInputs.length >= MAX_INPUTS ? (
                  <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-2xl">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      <span className="text-sm text-orange-700 font-medium">
                        已达到最大数量限制 ({MAX_INPUTS} 项)
                      </span>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={addHabitInput}
                    className="w-full mt-4 py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-300 text-sm font-medium group"
                    type="button"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Plus className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                      <span>添加新习惯</span>
                      <span className="text-xs text-gray-400">
                        ({habitInputs.length}/{MAX_INPUTS})
                      </span>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-8">
            <Dialog.Close asChild>
              <button className="px-6 py-2.5 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium">
                取消
              </button>
            </Dialog.Close>
            <button
              onClick={handleHabitSubmit}
              className="px-6 py-2.5 bg-[#FF5A5F] text-white rounded-xl hover:bg-pink-600 transition-colors duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={
                editHabit
                  ? !habitName.trim() || !selectedCategory
                  : habitInputs.every((name) => !name.trim()) ||
                    !selectedCategory
              }
            >
              {editHabit ? "保存" : "创建"}
              <span className="text-xs text-pink-200 ml-2 opacity-70">
                Enter
              </span>
            </button>
          </div>
        </EnhancedDialog>

        {/* 批量移动对话框 */}
        <EnhancedDialog
          open={batchDialogOpen}
          onOpenChange={setBatchDialogOpen}
          onConfirm={handleBatchMoveHabits}
          confirmDisabled={!batchMoveToCategory}
          confirmShortcut={{ key: "Enter", ctrlKey: false, metaKey: false }}
        >
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-2xl font-semibold text-gray-800">
              批量移动习惯
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </Dialog.Close>
          </div>

          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              将选中的 {selectedHabits.size} 个习惯移动到新的目标：
            </p>
            <div className="space-y-2 max-h-32 overflow-y-auto p-3 bg-gray-50 rounded-lg">
              {Array.from(selectedHabits).map((habitId) => {
                const habit = habits.find((h) => h.id === habitId);
                return habit ? (
                  <div
                    key={habitId}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <div className="w-2 h-2 rounded-full bg-[#FF5A5F]"></div>
                    <span>{habit.name}</span>
                  </div>
                ) : null;
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择目标目标
            </label>
            <CategorySelector
              value={batchMoveToCategory}
              onChange={setBatchMoveToCategory}
              categories={categories}
              placeholder="请选择目标目标"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-8">
            <Dialog.Close asChild>
              <button className="px-6 py-2.5 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium">
                取消
              </button>
            </Dialog.Close>
            <button
              onClick={handleBatchMoveHabits}
              className="px-6 py-2.5 bg-[#FF5A5F] text-white rounded-xl hover:bg-pink-600 transition-colors duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!batchMoveToCategory}
            >
              移动
              <span className="text-xs text-pink-200 ml-2 opacity-70">
                {formatShortcut({ key: "Enter" })}
              </span>
            </button>
          </div>
        </EnhancedDialog>

        {/* AI 习惯生成对话框 */}
        <AIHabitsDialog
          open={aiDialogOpen}
          onOpenChange={handleCloseAIDialog}
          goalName={currentGoalForAI}
          habits={aiHabits}
          isGenerating={isGenerating}
          error={aiError}
          onAddHabits={handleAddAIHabits}
          onRetry={handleRetryAIGeneration}
        />
      </div>
    </div>
  );
};

export default Management;
