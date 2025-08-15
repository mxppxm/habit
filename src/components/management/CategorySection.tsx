import React from "react";
import { FolderOpen, Plus, CheckSquare, X, Trash2 } from "lucide-react";
import { CategoryCard } from "./CategoryCard";

interface CategorySectionProps {
  categories: any[];
  habits: any[];
  categoryBatchMode: boolean;
  selectedCategories: Set<string>;
  selectedCategoryFilter: string | null;
  aiEnabled: boolean;
  onEnterBatchMode: () => void;
  onExitBatchMode: () => void;
  onSelectAll: () => void;
  onToggleSelection: (id: string) => void;
  onCategoryClick: (id: string) => void;
  onEdit: (category: any) => void;
  onDelete: (id: string) => void;
  onGenerateAI: (name: string) => void;
  onAddCategory: () => void;
  onBatchDelete: () => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  categories,
  habits,
  categoryBatchMode,
  selectedCategories,
  selectedCategoryFilter,
  aiEnabled,
  onEnterBatchMode,
  onExitBatchMode,
  onSelectAll,
  onToggleSelection,
  onCategoryClick,
  onEdit,
  onDelete,
  onGenerateAI,
  onAddCategory,
  onBatchDelete,
}) => {
  return (
    <div className="w-full lg:w-2/5 xl:w-1/3 min-h-0">
      <div className="card p-4 sm:p-6 lg:p-8 h-full flex flex-col">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3 shrink-0">
            <FolderOpen className="w-6 h-6 text-[#FF5A5F]" />
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
              目标
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!categoryBatchMode ? (
              <>
                {categories.length > 0 && (
                  <button
                    onClick={onEnterBatchMode}
                    className="inline-flex items-center space-x-2 px-3 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm"
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span className="hidden sm:inline">批量选择</span>
                  </button>
                )}
                <button
                  onClick={onAddCategory}
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
                  onClick={onSelectAll}
                  className="inline-flex items-center space-x-2 px-3 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-all duration-200 text-sm"
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>全选</span>
                  <span className="text-xs opacity-70 hidden sm:inline">
                    {categories.length} 项
                  </span>
                </button>
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

        {selectedCategories.size > 0 && (
          <div className="flex items-center space-x-4 mb-4 justify-end">
            <button
              onClick={onBatchDelete}
              className="inline-flex items-center space-x-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 text-sm"
            >
              <Trash2 className="w-4 h-4" />
              <span>
                删除 {selectedCategories.size} 项
              </span>
              <span className="text-xs opacity-70 hidden sm:inline">Del</span>
            </button>
          </div>
        )}

        {categories.length > 0 ? (
          <div className="flex-1 min-h-0 flex flex-col">
            {!categoryBatchMode && (
              <div className="text-sm text-gray-500 mb-3 flex items-center space-x-2">
                <span>💡 点击目标卡片来筛选相关习惯</span>
              </div>
            )}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar min-h-0">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  habitCount={habits.filter((h) => h.categoryId === category.id).length}
                  isSelected={selectedCategories.has(category.id)}
                  inBatchMode={categoryBatchMode}
                  isFiltered={selectedCategoryFilter === category.id}
                  aiEnabled={aiEnabled}
                  onClick={() => {
                    if (categoryBatchMode) {
                      onToggleSelection(category.id);
                    } else {
                      onCategoryClick(category.id);
                    }
                  }}
                  onEdit={() => onEdit(category)}
                  onDelete={() => onDelete(category.id)}
                  onGenerateAI={() => onGenerateAI(category.name)}
                />
              ))}
            </div>
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
      </div>
    </div>
  );
};
