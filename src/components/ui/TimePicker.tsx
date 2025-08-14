import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Clock, ChevronDown, X } from "lucide-react";
import { EnhancedDialog } from "./EnhancedDialog";

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
}

export const TimePicker: React.FC<TimePickerProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0")
  );
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0")
  );

  // 获取当前时间作为默认值
  const getCurrentTime = () => {
    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, "0");
    const currentMinute = now.getMinutes().toString().padStart(2, "0");
    return [currentHour, currentMinute];
  };

  const [hour, minute] = value ? value.split(":") : getCurrentTime();

  const handleTimeChange = (newHour: string, newMinute: string) => {
    onChange(`${newHour}:${newMinute}`);
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent outline-none transition-all duration-200 text-left flex items-center justify-between bg-white hover:border-gray-300"
      >
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-gray-400" />
          <span className={value ? "text-gray-900" : "text-gray-400"}>
            {value || `不设置提醒时间 (当前: ${getCurrentTime().join(":")})`}
          </span>
        </div>
        <ChevronDown className="w-5 h-5 text-gray-400" />
      </button>

      {/* 时间选择弹窗 */}
      <EnhancedDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl z-[100000]"
      >
        <div className="flex items-center justify-between mb-6">
          <Dialog.Title className="text-xl font-semibold text-gray-800">
            选择提醒时间
          </Dialog.Title>
          <Dialog.Close asChild>
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </Dialog.Close>
        </div>

        <div className="space-y-4">
          <div className="text-center mb-4">
            <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
              <Clock className="w-4 h-4" />
              <span>当前时间: {getCurrentTime().join(":")}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">小时</p>
              <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-lg">
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
              <p className="text-sm font-medium text-gray-700 mb-3">分钟</p>
              <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-lg">
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

          <div className="flex justify-center space-x-2 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                onChange("");
                setIsOpen(false);
              }}
              className="px-3 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm"
            >
              清除时间
            </button>
            <button
              onClick={() => {
                const [currentHour, currentMinute] = getCurrentTime();
                onChange(`${currentHour}:${currentMinute}`);
                setIsOpen(false);
              }}
              className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm"
            >
              当前时间
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-2 bg-[#FF5A5F] text-white rounded-lg hover:bg-pink-600 transition-colors duration-200 text-sm"
            >
              确定
            </button>
          </div>
        </div>
      </EnhancedDialog>
    </>
  );
};
