import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { EnhancedDialog } from "../ui/EnhancedDialog";
import { CategorySelector } from "../ui/CategorySelector";
import { formatShortcut } from "../../hooks/useKeyboardShortcuts";

interface BatchMoveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedHabits: Set<string>;
  habits: any[];
  categories: any[];
  batchMoveToCategory: string;
  onCategoryChange: (categoryId: string) => void;
  onConfirm: () => void;
}

export const BatchMoveDialog: React.FC<BatchMoveDialogProps> = ({
  open,
  onOpenChange,
  selectedHabits,
  habits,
  categories,
  batchMoveToCategory,
  onCategoryChange,
  onConfirm,
}) => {
  return (
    <EnhancedDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
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
              <div key={habitId} className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-[#FF5A5F]"></div>
                <span>{habit.name}</span>
              </div>
            ) : null;
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          选择目标
        </label>
        <CategorySelector
          value={batchMoveToCategory}
          onChange={onCategoryChange}
          categories={categories}
          placeholder="请选择目标"
        />
      </div>

      <div className="flex justify-end space-x-3 mt-8">
        <Dialog.Close asChild>
          <button className="px-6 py-2.5 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium">
            取消
          </button>
        </Dialog.Close>
        <button
          onClick={onConfirm}
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
  );
};
