import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Edit2, Trash2, Clock, CheckSquare, Square, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HabitCardProps {
  habit: {
    id: string;
    name: string;
    categoryId: string;
    reminderTime?: string;
    description?: string;
    isAIGenerated?: boolean;
    aiDifficulty?: "简单" | "中等" | "困难";
    aiFrequency?: string;
    aiTips?: string;
  };
  categoryName: string;
  isSelected: boolean;
  inBatchMode: boolean;
  onClick?: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const AIBadge: React.FC<{ habit: HabitCardProps["habit"] }> = ({ habit }) => {
  const [visible, setVisible] = useState(false);
  const [delayTimer, setDelayTimer] = useState<number | null>(null);
  const [openUp, setOpenUp] = useState(false);
  const [coords, setCoords] = useState<{ left: number; top: number }>({
    left: 0,
    top: 0,
  });
  const ref = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const tooltipHeight = portalRef.current?.offsetHeight || 180;
    const shouldOpenUp =
      spaceBelow < tooltipHeight + 12 || rect.top > window.innerHeight * 0.6;
    setOpenUp(shouldOpenUp);
    const top = shouldOpenUp
      ? rect.top + window.scrollY - 8
      : rect.bottom + window.scrollY + 8;
    const left = rect.left + window.scrollX;
    setCoords({ left, top });
  };

  useEffect(() => {
    if (!visible) return;
    updatePosition();
    const id = window.requestAnimationFrame(updatePosition);
    const onScroll = () => updatePosition();
    const onResize = () => updatePosition();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
      window.cancelAnimationFrame(id);
    };
  }, [visible]);

  if (!habit.isAIGenerated) return null;
  return (
    <div
      ref={ref}
      className="relative inline-flex items-center"
      onMouseEnter={() => {
        if (delayTimer) window.clearTimeout(delayTimer);
        const id = window.setTimeout(() => setVisible(true), 180);
        setDelayTimer(id);
      }}
      onMouseLeave={() => {
        if (delayTimer) window.clearTimeout(delayTimer);
        setVisible(false);
      }}
    >
      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] sm:text-xs">
        <Brain className="w-3 h-3 mr-1" /> AI
      </span>
      {visible &&
        createPortal(
          <div
            className="z-[9999] fixed w-72 sm:w-80 p-3 rounded-lg bg-white shadow-xl border border-gray-200"
            ref={portalRef}
            style={{
              left: coords.left,
              top: coords.top,
              transform: openUp ? "translateY(-100%)" : "none",
            }}
          >
            {habit.description && (
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                {habit.description}
              </p>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {habit.aiDifficulty && (
                <span
                  className={`px-2 py-0.5 text-[11px] rounded-full border font-medium ${
                    habit.aiDifficulty === "简单"
                      ? "bg-green-100 text-green-700 border-green-200"
                      : habit.aiDifficulty === "中等"
                      ? "bg-amber-100 text-amber-700 border-amber-200"
                      : "bg-red-100 text-red-700 border-red-200"
                  }`}
                >
                  难度：{habit.aiDifficulty}
                </span>
              )}
              {habit.aiFrequency && (
                <span className="px-2 py-0.5 text-[11px] rounded-full border bg-indigo-100 text-indigo-700 border-indigo-200 font-medium">
                  频率：{habit.aiFrequency}
                </span>
              )}
            </div>
            {habit.aiTips && (
              <div className="mt-2 text-[11px] text-gray-600">
                <span className="font-medium text-gray-700">小贴士：</span>
                <span>{habit.aiTips}</span>
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
};

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
      className={`relative p-4 bg-white border ${
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
              <AIBadge habit={habit} />
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
            {habit.description && (
              <p className="text-xs text-gray-500 mt-1 truncate">
                {habit.description}
              </p>
            )}
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
