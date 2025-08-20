import React, { useState, useEffect } from "react";
import { useHabitStore } from "../stores/useHabitStore";
import { AIHabitsDialog } from "../components/ui/AIHabitsDialog";
import { CategoryDialog } from "../components/management/CategoryDialog";
import { HabitDialog } from "../components/management/HabitDialog";
import { DeleteConfirmDialog } from "../components/management/DeleteConfirmDialog";
import { BatchMoveDialog } from "../components/management/BatchMoveDialog";
import { CategorySection } from "../components/management/CategorySection";
import { HabitSection } from "../components/management/HabitSection";
import { useBatchOperations } from "../hooks/useBatchOperations";
import { v4 as uuidv4 } from "uuid";
import type { Habit } from "../types";
import { useAI } from "../hooks/useAI";
import type { AIHabitSuggestion } from "../types";

const Management: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory } =
    useHabitStore();
  const {
    habits,
    addHabit,
    insertHabit,
    updateHabit,
    deleteHabit,
    updateHabitCategory,
  } = useHabitStore();
  const { aiEnabled, apiKey, habitLogs } = useHabitStore();

  // 使用自定义批量操作 hook
  const categoryBatch = useBatchOperations();
  const habitBatch = useBatchOperations();

  // 目标筛选状态（使用 URL 参数持久化，返回后不丢失）
  const initialFilterParam = new URLSearchParams(window.location.search).get(
    "category"
  );
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<
    string | null
  >(initialFilterParam);

  // 对话框状态
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [habitDialogOpen, setHabitDialogOpen] = useState(false);
  const [editHabit, setEditHabit] = useState<any>(null);

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

  // 删除确认状态
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "category" | "habit";
    id: string;
    name: string;
    relatedCount?: number;
  } | null>(null);

  // 处理目标点击筛选
  const handleCategoryClick = (categoryId: string) => {
    if (categoryBatch.categoryBatchMode || habitBatch.habitBatchMode) return;
    const next = selectedCategoryFilter === categoryId ? null : categoryId;
    setSelectedCategoryFilter(next);
    // 仅当有筛选时通过 pushState 记录，便于原生后退返回状态
    const params = new URLSearchParams(window.location.search);
    if (next) {
      params.set("category", next);
      const query = params.toString();
      const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}`;
      window.history.pushState({ category: next }, "", nextUrl);
    } else {
      // 清空筛选时恢复到无查询参数的 URL，同时记录历史
      const nextUrl = window.location.pathname;
      window.history.pushState({}, "", nextUrl);
    }
  };

  // 获取筛选后的习惯列表
  const filteredHabits = selectedCategoryFilter
    ? habits.filter((habit) => habit.categoryId === selectedCategoryFilter)
    : habits;

  // 快捷键处理
  useEffect(() => {
    const onPopState = () => {
      const current = new URLSearchParams(window.location.search).get(
        "category"
      );
      setSelectedCategoryFilter(current);
    };
    window.addEventListener("popstate", onPopState);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (categoryBatch.categoryBatchMode || habitBatch.habitBatchMode) {
        // Ctrl+A 全选
        if (e.ctrlKey && e.key === "a") {
          e.preventDefault();
          if (categoryBatch.categoryBatchMode) {
            categoryBatch.selectAllCategories();
          } else if (habitBatch.habitBatchMode) {
            habitBatch.selectAllHabits(filteredHabits);
          }
        }
        // Delete 删除选中项
        else if (e.key === "Delete") {
          e.preventDefault();
          if (
            categoryBatch.categoryBatchMode &&
            categoryBatch.selectedCategories.size > 0
          ) {
            categoryBatch.handleBatchDeleteCategories();
          } else if (
            habitBatch.habitBatchMode &&
            habitBatch.selectedHabits.size > 0
          ) {
            habitBatch.handleBatchDeleteHabits();
          }
        }
        // Escape 退出批量模式
        else if (e.key === "Escape") {
          e.preventDefault();
          if (categoryBatch.categoryBatchMode) {
            categoryBatch.exitCategoryBatchMode();
          } else if (habitBatch.habitBatchMode) {
            habitBatch.exitHabitBatchMode();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("popstate", onPopState);
    };
  }, [categoryBatch, habitBatch, filteredHabits]);

  // 处理对话框打开
  const openAddCategoryDialog = () => {
    setEditCategory(null);
    setCategoryDialogOpen(true);
  };

  const openEditCategoryDialog = (category: { id: string; name: string }) => {
    setEditCategory(category);
    setCategoryDialogOpen(true);
  };

  const openAddHabitDialog = () => {
    setEditHabit(null);
    setHabitDialogOpen(true);
  };

  const openEditHabitDialog = (habit: any) => {
    setEditHabit(habit);
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
        const suggestion = aiHabits?.find((h) => h.name === habitName);
        if (suggestion) {
          const newHabit: Habit = {
            id: uuidv4(),
            categoryId: targetCategory.id,
            name: suggestion.name,
            reminderTime: "",
            description: suggestion.description,
            isAIGenerated: true,
            aiDifficulty: suggestion.difficulty,
            aiFrequency: suggestion.frequency,
            aiTips: suggestion.tips,
          };
          await insertHabit(newHabit);
        } else {
          // 回退：只存名称
          await addHabit(targetCategory.id, habitName, "");
        }
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

  // 删除确认处理函数
  const handleDeleteCategory = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return;

    const relatedHabits = habits.filter((h) => h.categoryId === categoryId);

    if (relatedHabits.length > 0) {
      setDeleteTarget({
        type: "category",
        id: categoryId,
        name: category.name,
        relatedCount: relatedHabits.length,
      });
      setDeleteConfirmOpen(true);
    } else {
      // 直接删除
      deleteCategory(categoryId);
    }
  };

  const handleDeleteHabit = (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    const relatedLogs = habitLogs.filter((log) => log.habitId === habitId);

    if (relatedLogs.length > 0) {
      setDeleteTarget({
        type: "habit",
        id: habitId,
        name: habit.name,
        relatedCount: relatedLogs.length,
      });
      setDeleteConfirmOpen(true);
    } else {
      // 直接删除
      deleteHabit(habitId);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      if (deleteTarget.type === "category") {
        // 删除目标及其所有习惯和相关的打卡记录
        const relatedHabits = habits.filter(
          (h) => h.categoryId === deleteTarget.id
        );
        for (const habit of relatedHabits) {
          await deleteHabit(habit.id);
        }
        await deleteCategory(deleteTarget.id);
      } else {
        await deleteHabit(deleteTarget.id);
      }
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
    } catch (error) {
      alert("删除时出错，请重试");
    }
  };

  const handleCategorySubmit = async (
    categories: string[],
    editId?: string
  ) => {
    if (editId && editCategory) {
      await updateCategory(editId, categories[0]);
      setEditCategory(null);
    } else {
      for (const name of categories) {
        await addCategory(name);
      }
    }
    setCategoryDialogOpen(false);
  };

  const handleHabitSubmit = async (
    habits: { name: string; reminderTime: string }[],
    categoryId: string,
    editId?: string
  ) => {
    if (editId && editHabit) {
      if (editHabit.categoryId !== categoryId) {
        await updateHabitCategory(editId, categoryId);
      }
      await updateHabit(editId, habits[0].name, habits[0].reminderTime);
      setEditHabit(null);
    } else {
      for (const habit of habits) {
        await addHabit(categoryId, habit.name, habit.reminderTime || "");
      }
    }
    setHabitDialogOpen(false);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-4 lg:gap-6">
      {/* 左侧：目标 */}
      <CategorySection
        categories={categories}
        habits={habits}
        categoryBatchMode={categoryBatch.categoryBatchMode}
        selectedCategories={categoryBatch.selectedCategories}
        selectedCategoryFilter={selectedCategoryFilter}
        aiEnabled={aiEnabled}
        onEnterBatchMode={categoryBatch.enterCategoryBatchMode}
        onExitBatchMode={categoryBatch.exitCategoryBatchMode}
        onSelectAll={categoryBatch.selectAllCategories}
        onToggleSelection={categoryBatch.toggleCategorySelection}
        onCategoryClick={handleCategoryClick}
        onEdit={openEditCategoryDialog}
        onDelete={handleDeleteCategory}
        onGenerateAI={handleGenerateAIHabits}
        onAddCategory={openAddCategoryDialog}
        onBatchDelete={categoryBatch.handleBatchDeleteCategories}
      />

      {/* 右侧：习惯 */}
      <HabitSection
        habits={filteredHabits}
        categories={categories}
        habitLogs={habitLogs}
        selectedHabits={habitBatch.selectedHabits}
        batchMode={habitBatch.habitBatchMode}
        selectedCategoryFilter={selectedCategoryFilter}
        onEnterBatchMode={habitBatch.enterHabitBatchMode}
        onExitBatchMode={habitBatch.exitHabitBatchMode}
        onSelectAll={() => habitBatch.selectAllHabits(filteredHabits)}
        onToggleSelection={habitBatch.toggleHabitSelection}
        onAddHabit={openAddHabitDialog}
        onEditHabit={openEditHabitDialog}
        onDeleteHabit={handleDeleteHabit}
        onBatchDelete={habitBatch.handleBatchDeleteHabits}
        onBatchMove={() => habitBatch.setBatchDialogOpen(true)}
        onClearFilter={() => {
          setSelectedCategoryFilter(null);
          const nextUrl = window.location.pathname;
          window.history.pushState({}, "", nextUrl);
        }}
      />

      {/* 对话框 */}
      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        editCategory={editCategory}
        onSubmit={handleCategorySubmit}
      />

      <HabitDialog
        open={habitDialogOpen}
        onOpenChange={setHabitDialogOpen}
        editHabit={editHabit}
        categories={categories}
        onSubmit={handleHabitSubmit}
      />

      <BatchMoveDialog
        open={habitBatch.batchDialogOpen}
        onOpenChange={habitBatch.setBatchDialogOpen}
        selectedHabits={habitBatch.selectedHabits}
        habits={habits}
        categories={categories}
        onConfirm={habitBatch.handleBatchMoveHabits}
        batchMoveToCategory={habitBatch.batchMoveToCategory}
        onCategoryChange={habitBatch.setBatchMoveToCategory}
      />

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

      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        deleteTarget={deleteTarget}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default Management;
