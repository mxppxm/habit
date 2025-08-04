import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useHabitStore } from "../stores/useHabitStore";
import { Plus, X, Edit2, Trash2, Clock, ChevronDown } from "lucide-react";

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

const Management: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory } =
    useHabitStore();
  const { habits, addHabit, updateHabit, deleteHabit } = useHabitStore();
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

  const handleCategorySubmit = async () => {
    if (!categoryName.trim()) return;

    if (editCategory) {
      await updateCategory(editCategory.id, categoryName);
      setEditCategory(null);
    } else {
      await addCategory(categoryName);
    }
    setCategoryName("");
    setCategoryDialogOpen(false);
  };

  const handleHabitSubmit = async () => {
    if (!habitName.trim() || !selectedCategory) return;

    if (editHabit) {
      await updateHabit(editHabit.id, habitName, reminderTime);
      setEditHabit(null);
    } else {
      await addHabit(selectedCategory, habitName, reminderTime);
    }
    setHabitName("");
    setSelectedCategory("");
    setReminderTime("");
    setHabitDialogOpen(false);
  };

  const openAddCategoryDialog = () => {
    setEditCategory(null);
    setCategoryName("");
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
    setSelectedCategory("");
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

  return (
    <div className="space-y-8">
      {/* 分类管理 */}
      <div className="card p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">分类管理</h2>
          <button
            onClick={openAddCategoryDialog}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-[#FF5A5F] text-white rounded-lg hover:bg-pink-600 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>添加分类</span>
          </button>
        </div>

        {categories.length > 0 ? (
          <div className="space-y-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="group flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-[#FF5A5F] transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-[#FF5A5F]"></div>
                  <span className="font-medium text-gray-800">
                    {category.name}
                  </span>
                </div>
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => openEditCategoryDialog(category)}
                    className="flex items-center space-x-1 px-3 py-1.5 text-[#00A699] hover:bg-green-50 rounded-md transition-colors duration-200"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span className="text-sm">编辑</span>
                  </button>
                  <button
                    onClick={() => deleteCategory(category.id)}
                    className="flex items-center space-x-1 px-3 py-1.5 text-[#FC642D] hover:bg-red-50 rounded-md transition-colors duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm">删除</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg mb-2">还没有分类</p>
            <p className="text-gray-400 text-sm">创建分类来组织你的习惯项目</p>
          </div>
        )}

        <Dialog.Root
          open={categoryDialogOpen}
          onOpenChange={setCategoryDialogOpen}
        >
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
            <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl z-50">
              <div className="flex items-center justify-between mb-6">
                <Dialog.Title className="text-2xl font-semibold text-gray-800">
                  {editCategory ? "编辑分类" : "添加分类"}
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
                    分类名称
                  </label>
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent outline-none transition-all duration-200"
                    placeholder="输入分类名称"
                    autoFocus
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
                  onClick={handleCategorySubmit}
                  className="px-6 py-2.5 bg-[#FF5A5F] text-white rounded-xl hover:bg-pink-600 transition-colors duration-200 font-medium shadow-md hover:shadow-lg"
                  disabled={!categoryName.trim()}
                >
                  保存
                </button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      {/* 项目管理 */}
      <div className="card p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">项目管理</h2>
          <button
            onClick={openAddHabitDialog}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-[#FF5A5F] text-white rounded-lg hover:bg-pink-600 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>添加项目</span>
          </button>
        </div>

        {habits.length > 0 ? (
          <div className="space-y-3">
            {habits.map((habit) => {
              const category = categories.find(
                (c) => c.id === habit.categoryId
              );
              return (
                <div
                  key={habit.id}
                  className="group flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-[#FF5A5F] transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-medium text-gray-800 text-lg">
                        {habit.name}
                      </span>
                      {category && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {category.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>提醒时间：{habit.reminderTime || "未设置"}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => openEditHabitDialog(habit)}
                      className="flex items-center space-x-1 px-3 py-1.5 text-[#00A699] hover:bg-green-50 rounded-md transition-colors duration-200"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span className="text-sm">编辑</span>
                    </button>
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="flex items-center space-x-1 px-3 py-1.5 text-[#FC642D] hover:bg-red-50 rounded-md transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm">删除</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg mb-2">还没有习惯项目</p>
            <p className="text-gray-400 text-sm">
              创建你的第一个习惯项目开始打卡
            </p>
          </div>
        )}

        <Dialog.Root open={habitDialogOpen} onOpenChange={setHabitDialogOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
            <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl z-50">
              <div className="flex items-center justify-between mb-6">
                <Dialog.Title className="text-2xl font-semibold text-gray-800">
                  {editHabit ? "编辑项目" : "添加项目"}
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </Dialog.Close>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    项目名称
                  </label>
                  <input
                    type="text"
                    value={habitName}
                    onChange={(e) => setHabitName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent outline-none transition-all duration-200"
                    placeholder="输入项目名称"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    选择分类
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent outline-none transition-all duration-200 bg-white"
                  >
                    <option value="">请选择分类</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {categories.length === 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      请先创建分类再添加项目
                    </p>
                  )}
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
                  disabled={!habitName.trim() || !selectedCategory}
                >
                  保存
                </button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </div>
  );
};

export default Management;
