import React, { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Plus, Info, Clock } from "lucide-react";
import { EnhancedDialog } from "../ui/EnhancedDialog";
import { CategorySelector } from "../ui/CategorySelector";
import { TimePicker } from "../ui/TimePicker";

const MAX_INPUTS = 10;

interface HabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editHabit: {
    id: string;
    name: string;
    categoryId: string;
    reminderTime?: string;
  } | null;
  categories: { id: string; name: string }[];
  onSubmit: (
    habits: { name: string; reminderTime: string }[],
    categoryId: string,
    editId?: string
  ) => Promise<void>;
}

export const HabitDialog: React.FC<HabitDialogProps> = ({
  open,
  onOpenChange,
  editHabit,
  categories,
  onSubmit,
}) => {
  const [habitName, setHabitName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [habitInputs, setHabitInputs] = useState([""]);
  const [habitReminderTimes, setHabitReminderTimes] = useState([""]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  useEffect(() => {
    if (open) {
      if (editHabit) {
        setHabitName(editHabit.name);
        setSelectedCategory(editHabit.categoryId);
        setReminderTime(editHabit.reminderTime || "");
        setHabitInputs([editHabit.name]);
        setHabitReminderTimes([editHabit.reminderTime || ""]);
      } else {
        setHabitName("");
        setSelectedCategory("");
        setReminderTime("");
        setHabitInputs([""]);
        setHabitReminderTimes([""]);
      }
      setFocusedIndex(0);
    }
  }, [open, editHabit]);

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

  const handleDialogKeyDown = (e: React.KeyboardEvent, index?: number) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (habitInputs.length < MAX_INPUTS) {
        addHabitInput();
      }
    } else if (e.key === "Enter" && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      handleSubmit();
    } else if ((e.metaKey || e.ctrlKey) && e.key === "Backspace") {
      e.preventDefault();
      if (typeof index !== "undefined" && habitInputs.length > 1) {
        removeHabitInput(index);
      }
    }
  };

  const handleSubmit = async () => {
    if (editHabit) {
      if (!habitName.trim() || !selectedCategory) return;
      await onSubmit(
        [{ name: habitName, reminderTime }],
        selectedCategory,
        editHabit.id
      );
    } else {
      const validInputs = habitInputs
        .map((name, index) => ({
          name: name.trim(),
          reminderTime: habitReminderTimes[index] || "",
        }))
        .filter((input) => input.name.length > 0);

      if (validInputs.length === 0 || !selectedCategory) return;
      await onSubmit(validInputs, selectedCategory);
    }
    onOpenChange(false);
  };

  return (
    <EnhancedDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={handleSubmit}
      confirmDisabled={
        editHabit
          ? !habitName.trim() || !selectedCategory
          : habitInputs.every((name) => !name.trim()) || !selectedCategory
      }
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 sm:p-8 w-full max-w-sm sm:max-w-lg mx-4 shadow-2xl z-50 max-h-[90vh] overflow-y-auto"
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
                提醒时间 <span className="text-gray-400 font-normal">(可选)</span>
              </label>
              <TimePicker value={reminderTime} onChange={setReminderTime} />
              <p className="text-xs text-gray-500 mt-1">
                不设置时间则不会收到提醒
              </p>
            </div>
          </>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-1">
                  创建习惯
                </label>
                <p className="text-sm text-gray-500">设定你想要养成的好习惯</p>
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
                          onChange={(e) => updateHabitInput(index, e.target.value)}
                          onKeyDown={(e) => handleDialogKeyDown(e, index)}
                          className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300 bg-white"
                          placeholder={`习惯名称 ${index + 1}，如：每天运动30分钟`}
                          autoFocus={index === focusedIndex}
                        />
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600 font-medium">
                              提醒时间
                            </span>
                            <span className="text-xs text-gray-400 font-normal">
                              (可选)
                            </span>
                          </div>
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
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {habitInputs.length < MAX_INPUTS && (
                <button
                  onClick={addHabitInput}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>添加更多习惯</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </EnhancedDialog>
  );
};
