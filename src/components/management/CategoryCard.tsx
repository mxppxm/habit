import React from "react";
import { Edit2, Trash2, Brain, CheckSquare, Square } from "lucide-react";

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
  };
  habitCount: number;
  isSelected: boolean;
  inBatchMode: boolean;
  isFiltered: boolean;
  aiEnabled: boolean;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onGenerateAI: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  habitCount,
  isSelected,
  inBatchMode,
  isFiltered,
  aiEnabled,
  onClick,
  onEdit,
  onDelete,
  onGenerateAI,
}) => {
  return (
    <div
      onClick={onClick}
      className={`p-4 bg-white border ${
        isSelected
          ? "border-orange-400 bg-orange-50"
          : "border-gray-200 hover:border-gray-300"
      } rounded-xl transition-all duration-200 cursor-pointer group hover:shadow-md`}
    >
      <div className="flex flex-col space-y-2 flex-1">
        {/* 第一行：标题和习惯数 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 lg:space-x-3 min-w-0">
            {inBatchMode && (
              <div className="flex-shrink-0">
                {isSelected ? (
                  <CheckSquare className="w-5 h-5 text-[#FF5A5F]" />
                ) : (
                  <Square className="w-5 h-5 text-gray-400" />
                )}
              </div>
            )}
            <div
              className={`w-3 h-3 rounded-full flex-shrink-0 ${
                isFiltered ? "bg-orange-500" : "bg-[#FF5A5F]"
              }`}
            />
            <span className="font-medium text-gray-800 truncate">
              {category.name}
            </span>
            {isFiltered && (
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full flex-shrink-0">
                已筛选
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500 flex-shrink-0">
            {habitCount} 个习惯
          </span>
        </div>

        {/* 第二行：操作按钮 */}
        {!inBatchMode && (
          <div className="flex items-center space-x-1 lg:space-x-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {aiEnabled && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onGenerateAI();
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
                onEdit();
              }}
              className="flex items-center space-x-1 px-2 sm:px-3 py-1.5 text-[#00A699] hover:bg-green-50 rounded-md transition-colors duration-200"
            >
              <Edit2 className="w-4 h-4" />
              <span className="text-xs sm:text-sm hidden sm:inline">编辑</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="flex items-center space-x-1 px-2 sm:px-3 py-1.5 text-[#FC642D] hover:bg-red-50 rounded-md transition-colors duration-200"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-xs sm:text-sm hidden sm:inline">删除</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
