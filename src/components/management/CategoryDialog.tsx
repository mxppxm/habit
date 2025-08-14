import React, { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Plus, Info } from "lucide-react";
import { EnhancedDialog } from "../ui/EnhancedDialog";

const MAX_INPUTS = 10;

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editCategory: { id: string; name: string } | null;
  onSubmit: (categories: string[], editId?: string) => Promise<void>;
}

export const CategoryDialog: React.FC<CategoryDialogProps> = ({
  open,
  onOpenChange,
  editCategory,
  onSubmit,
}) => {
  const [categoryName, setCategoryName] = useState("");
  const [categoryInputs, setCategoryInputs] = useState([""]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  useEffect(() => {
    if (open) {
      if (editCategory) {
        setCategoryName(editCategory.name);
        setCategoryInputs([editCategory.name]);
      } else {
        setCategoryName("");
        setCategoryInputs([""]);
      }
      setFocusedIndex(0);
    }
  }, [open, editCategory]);

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

  const handleDialogKeyDown = (e: React.KeyboardEvent, index?: number) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (categoryInputs.length < MAX_INPUTS) {
        addCategoryInput();
      }
    } else if (e.key === "Enter" && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      handleSubmit();
    } else if ((e.metaKey || e.ctrlKey) && e.key === "Backspace") {
      e.preventDefault();
      if (typeof index !== "undefined" && categoryInputs.length > 1) {
        removeCategoryInput(index);
      }
    }
  };

  const handleSubmit = async () => {
    if (editCategory) {
      if (!categoryName.trim()) return;
      await onSubmit([categoryName], editCategory.id);
    } else {
      const validNames = categoryInputs.filter((name) => name.trim().length > 0);
      if (validNames.length === 0) return;
      await onSubmit(validNames);
    }
    onOpenChange(false);
  };

  return (
    <EnhancedDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={handleSubmit}
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
                      onChange={(e) => updateCategoryInput(index, e.target.value)}
                      onKeyDown={(e) => handleDialogKeyDown(e, index)}
                      className="flex-1 px-4 py-3 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-[#FF5A5F]/20 focus:border-[#FF5A5F] outline-none transition-all duration-300"
                      placeholder={`目标名称 ${index + 1}，如：健康生活`}
                      autoFocus={index === focusedIndex}
                    />
                    {categoryInputs.length > 1 && (
                      <button
                        onClick={() => removeCategoryInput(index)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {categoryInputs.length < MAX_INPUTS && (
                <button
                  onClick={addCategoryInput}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-[#FF5A5F] hover:text-[#FF5A5F] transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>添加更多目标</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </EnhancedDialog>
  );
};
