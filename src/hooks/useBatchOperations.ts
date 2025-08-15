import { useState, useEffect } from "react";
import { useHabitStore } from "../stores/useHabitStore";

export const useBatchOperations = () => {
  const { categories, habits, deleteCategory, deleteHabit, updateHabitCategory, habitLogs } = useHabitStore();
  
  // 批量选择状态
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedHabits, setSelectedHabits] = useState<Set<string>>(new Set());
  const [categoryBatchMode, setCategoryBatchMode] = useState(false);
  const [habitBatchMode, setHabitBatchMode] = useState(false);
  const [showBatchCategoryActions, setShowBatchCategoryActions] = useState(false);
  const [showBatchHabitActions, setShowBatchHabitActions] = useState(false);
  const [batchMoveToCategory, setBatchMoveToCategory] = useState("");
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);

  // 批量操作函数
  const enterCategoryBatchMode = () => {
    setCategoryBatchMode(true);
    setSelectedCategories(new Set());
  };

  const exitCategoryBatchMode = () => {
    setCategoryBatchMode(false);
    setSelectedCategories(new Set());
    setShowBatchCategoryActions(false);
  };

  const enterHabitBatchMode = () => {
    setHabitBatchMode(true);
    setSelectedHabits(new Set());
  };

  const exitHabitBatchMode = () => {
    setHabitBatchMode(false);
    setSelectedHabits(new Set());
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
    if (selectedCategories.size === categories.length) {
      setSelectedCategories(new Set());
      setShowBatchCategoryActions(false);
    } else {
      setSelectedCategories(new Set(categories.map((c) => c.id)));
      setShowBatchCategoryActions(true);
    }
  };

  const selectAllHabits = (filteredHabits: any[]) => {
    setSelectedHabits(new Set(filteredHabits.map((h) => h.id)));
    setShowBatchHabitActions(true);
  };

  const handleBatchDeleteCategories = async () => {
    if (selectedCategories.size === 0) return;

    const categoriesWithHabits = Array.from(selectedCategories).filter(
      (categoryId) => habits.some((h) => h.categoryId === categoryId)
    );

    let confirmMessage = `确定要删除选中的 ${selectedCategories.size} 个目标吗？`;
    if (categoriesWithHabits.length > 0) {
      confirmMessage += `\n\n其中 ${categoriesWithHabits.length} 个目标包含习惯，删除目标将同时删除其下所有习惯以及相关的打卡记录。`;
    }

    if (confirm(confirmMessage)) {
      try {
        for (const categoryId of selectedCategories) {
          const relatedHabits = habits.filter((h) => h.categoryId === categoryId);
          for (const habit of relatedHabits) {
            await deleteHabit(habit.id);
          }
          await deleteCategory(categoryId);
        }
        exitCategoryBatchMode();
      } catch (error) {
        alert("删除目标时出错，请重试");
      }
    }
  };

  const handleBatchDeleteHabits = async () => {
    if (selectedHabits.size === 0) return;

    const habitsWithLogs = Array.from(selectedHabits).filter((habitId) =>
      habitLogs.some((log) => log.habitId === habitId)
    );

    let confirmMessage = `确定要删除选中的 ${selectedHabits.size} 个习惯吗？`;
    if (habitsWithLogs.length > 0) {
      confirmMessage += `\n\n其中 ${habitsWithLogs.length} 个习惯已有打卡记录，删除习惯将同时删除所有相关的打卡记录。`;
    }

    if (confirm(confirmMessage)) {
      try {
        for (const habitId of selectedHabits) {
          await deleteHabit(habitId);
        }
        exitHabitBatchMode();
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
      exitHabitBatchMode();
      setBatchDialogOpen(false);
      setBatchMoveToCategory("");
    } catch (error) {
      alert("移动习惯时出错，请重试");
    }
  };

  // 快捷键处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (categoryBatchMode || habitBatchMode) {
        if (e.ctrlKey && e.key === "a") {
          e.preventDefault();
          if (categoryBatchMode) {
            setSelectedCategories(new Set(categories.map((c) => c.id)));
            setShowBatchCategoryActions(true);
          } else if (habitBatchMode) {
            // 这里需要传入 filteredHabits
          }
        } else if (e.key === "Delete") {
          e.preventDefault();
          if (categoryBatchMode && selectedCategories.size > 0) {
            handleBatchDeleteCategories();
          } else if (habitBatchMode && selectedHabits.size > 0) {
            handleBatchDeleteHabits();
          }
        } else if (e.key === "Escape") {
          e.preventDefault();
          if (categoryBatchMode) {
            exitCategoryBatchMode();
          } else if (habitBatchMode) {
            exitHabitBatchMode();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    categoryBatchMode,
    habitBatchMode,
    selectedCategories,
    selectedHabits,
    categories,
  ]);

  return {
    selectedCategories,
    selectedHabits,
    categoryBatchMode,
    habitBatchMode,
    showBatchCategoryActions,
    showBatchHabitActions,
    batchMoveToCategory,
    batchDialogOpen,
    setBatchMoveToCategory,
    setBatchDialogOpen,
    enterCategoryBatchMode,
    exitCategoryBatchMode,
    enterHabitBatchMode,
    exitHabitBatchMode,
    toggleCategorySelection,
    toggleHabitSelection,
    selectAllCategories,
    selectAllHabits,
    handleBatchDeleteCategories,
    handleBatchDeleteHabits,
    handleBatchMoveHabits,
  };
};
