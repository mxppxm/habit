import React from "react";
import { Edit2, Trash2, Clock, CheckSquare, Square } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HabitCardProps {
  habit: {
    id: string;
    name: string;
    categoryId: string;
    reminderTime?: string;
  };
  categoryName: string;
  isSelected: boolean;
  inBatchMode: boolean;
  onClick?: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  categoryName,
  isSelected,
  inBatchMode,
  onClick,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (inBatchMode && onClick) {
      onClick();
    } else if (!inBatchMode) {
      navigate(`/habit/${habit.id}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`p-4 bg-white border ${
        isSelected
          ? "border-blue-400 bg-blue-50"
          : "border-gray-200 hover:border-gray-300"
      } rounded-xl transition-all duration-200 cursor-pointer group hover:shadow-md`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          {inBatchMode && (
            <div className="flex-shrink-0">
              {isSelected ? (
                <CheckSquare className="w-5 h-5 text-blue-500" />
              ) : (
                <Square className="w-5 h-5 text-gray-400" />
              )}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-800 truncate">
                {habit.name}
              </span>
              {habit.reminderTime && (
                <div className="flex items-center space-x-1 text-xs text-gray-500 flex-shrink-0">
                  <Clock className="w-3 h-3" />
                  <span>{habit.reminderTime}</span>
                </div>
              )}
            </div>
            <div className="flex items-center mt-1">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {categoryName}
              </span>
            </div>
          </div>
        </div>

        {!inBatchMode && (
          <div className="flex items-center space-x-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1.5 text-[#00A699] hover:bg-green-50 rounded-md transition-colors duration-200"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 text-[#FC642D] hover:bg-red-50 rounded-md transition-colors duration-200"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
