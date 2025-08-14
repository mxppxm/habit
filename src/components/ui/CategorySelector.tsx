import React, { useState, useEffect } from "react";
import { ChevronDown, Tag } from "lucide-react";

interface CategorySelectorProps {
  value: string;
  onChange: (value: string) => void;
  categories: { id: string; name: string }[];
  placeholder?: string;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  value,
  onChange,
  categories,
  placeholder = "请选择目标",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedCategory = categories.find((cat) => cat.id === value);

  // 关闭下拉菜单当点击外部时
  useEffect(() => {
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
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent outline-none transition-all duration-200 text-left flex items-center justify-between bg-white hover:border-gray-300"
      >
        <div className="flex items-center space-x-2">
          <Tag className="w-5 h-5 text-gray-400" />
          <span className={selectedCategory ? "text-gray-900" : "text-gray-400"}>
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
        <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
          {categories.length > 0 ? (
            categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  onChange(cat.id);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2 ${
                  cat.id === value ? "bg-[#FF5A5F] text-white hover:bg-[#FF5A5F]" : ""
                } ${categories[0].id === cat.id ? "rounded-t-lg" : ""} ${
                  categories[categories.length - 1].id === cat.id
                    ? "rounded-b-lg"
                    : ""
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    cat.id === value ? "bg-white" : "bg-[#FF5A5F]"
                  }`}
                />
                <span>{cat.name}</span>
              </button>
            ))
          ) : (
            <div className="px-4 py-8 text-center text-gray-500">
              暂无目标，请先创建目标
            </div>
          )}
        </div>
      )}
    </div>
  );
};
