import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { EnhancedDialog } from "../ui/EnhancedDialog";
import { X } from "lucide-react";
import { formatShortcut } from "../../hooks/useKeyboardShortcuts";
import dayjs from "dayjs";

interface CheckinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit: {
    id: string;
    name: string;
  };
  isChecked: boolean;
  todayLogs: Array<{
    id: string;
    timestamp: Date;
    note: string;
  }>;
  note: string;
  onNoteChange: (note: string) => void;
  onCheckin: () => void;
  onCancelTodayCheckins: () => void;
  onCancelLastCheckin: () => void;
}

export const CheckinDialog: React.FC<CheckinDialogProps> = ({
  open,
  onOpenChange,
  habit,
  isChecked,
  todayLogs,
  note,
  onNoteChange,
  onCheckin,
  onCancelTodayCheckins,
  onCancelLastCheckin,
}) => {
  return (
    <EnhancedDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onCheckin}
      confirmShortcut={{
        key: "Enter",
        ctrlKey: true,
        metaKey: true,
      }}
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md sm:max-w-lg mx-4 shadow-2xl z-50"
    >
      <div className="flex items-center justify-between mb-6">
        <Dialog.Title className="text-xl sm:text-2xl font-semibold text-gray-800">
          {isChecked ? `已打卡: ${habit.name}` : `打卡: ${habit.name}`}
        </Dialog.Title>
        <Dialog.Close asChild>
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </Dialog.Close>
      </div>

      {isChecked ? (
        <div>
          <Dialog.Description className="text-gray-600 mb-4">
            今天已经打卡 {todayLogs.length} 次，你可以继续打卡
            {todayLogs.length === 1
              ? "或者取消今天的打卡记录"
              : "或者取消上一次打卡记录"}
            。
          </Dialog.Description>

          <div className="space-y-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-700">
                  今天的打卡记录
                </span>
              </div>
              {todayLogs.map((log, index) => (
                <div key={log.id} className="text-sm text-green-600 mb-1">
                  #{index + 1} {dayjs(log.timestamp).format("HH:mm")} -{" "}
                  {log.note || "无备注"}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                继续打卡备注
              </label>
              <textarea
                value={note}
                onChange={(e) => onNoteChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent outline-none transition-all duration-200 resize-none"
                placeholder="继续记录今天的感受..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-between space-x-3 mt-8">
            <button
              onClick={() => {
                if (todayLogs.length === 1) {
                  onCancelTodayCheckins();
                } else {
                  onCancelLastCheckin();
                }
              }}
              className="px-4 py-2.5 text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors duration-200 font-medium"
            >
              {todayLogs.length === 1 ? "取消今天打卡" : "取消上一次打卡"}
            </button>
            <div className="flex space-x-3">
              <Dialog.Close asChild>
                <button className="px-6 py-2.5 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium">
                  关闭
                </button>
              </Dialog.Close>
              <button
                onClick={onCheckin}
                className="px-6 py-2.5 bg-[#FF5A5F] text-white rounded-xl hover:bg-pink-600 transition-colors duration-200 font-medium shadow-md hover:shadow-lg relative group"
              >
                继续打卡
                <span className="text-xs text-pink-200 ml-2 opacity-70">
                  {formatShortcut({
                    key: "Enter",
                    ctrlKey: true,
                    metaKey: true,
                  })}
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <Dialog.Description className="text-gray-600 mb-4">
            添加一些备注来记录这次打卡的感受吧
          </Dialog.Description>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                今天的感受
              </label>
              <textarea
                value={note}
                onChange={(e) => onNoteChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent outline-none transition-all duration-200 resize-none"
                placeholder="今天完成这个习惯的感受如何？"
                rows={4}
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
              onClick={onCheckin}
              className="px-6 py-2.5 bg-[#FF5A5F] text-white rounded-xl hover:bg-pink-600 transition-colors duration-200 font-medium shadow-md hover:shadow-lg relative group"
            >
              确认打卡
              <span className="text-xs text-pink-200 ml-2 opacity-70">
                {formatShortcut({
                  key: "Enter",
                  ctrlKey: true,
                  metaKey: true,
                })}
              </span>
            </button>
          </div>
        </div>
      )}
    </EnhancedDialog>
  );
};
