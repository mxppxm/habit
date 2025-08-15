import React, { useState, useEffect } from "react";
import { Bell, Clock, Check, Save } from "lucide-react";

interface ReminderSettingsProps {
  dailyReminder: {
    enabled: boolean;
    time: string;
  };
  onReminderEnabledChange: (enabled: boolean) => void;
  onReminderTimeChange: (time: string) => void;
}

export const ReminderSettings: React.FC<ReminderSettingsProps> = ({
  dailyReminder,
  onReminderEnabledChange,
  onReminderTimeChange,
}) => {
  const [tempReminderTime, setTempReminderTime] = useState(dailyReminder.time);
  const [reminderTimeSaved, setReminderTimeSaved] = useState(false);

  // 同步提醒时间设置
  useEffect(() => {
    setTempReminderTime(dailyReminder.time);
  }, [dailyReminder.time]);

  const handleSaveTime = () => {
    onReminderTimeChange(tempReminderTime);
    setReminderTimeSaved(true);
    setTimeout(() => setReminderTimeSaved(false), 2000);
  };

  return (
    <div className="card p-6 sm:p-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
          <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
            每日提醒
          </h2>
          <p className="text-sm sm:text-base text-gray-500">
            设置每日打卡提醒时间，帮助您养成良好习惯
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-800 flex items-center space-x-2">
              <Bell className="w-5 h-5 text-orange-600" />
              <span>启用每日提醒</span>
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              在指定时间提醒您完成今日的习惯打卡
            </p>
          </div>
          <button
            onClick={() => onReminderEnabledChange(!dailyReminder.enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
              dailyReminder.enabled ? "bg-orange-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                dailyReminder.enabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {dailyReminder.enabled && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Clock className="w-3 h-3 text-orange-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-orange-800">
                  提醒时间设置
                </h4>
                <p className="text-xs text-orange-600 mt-1">
                  当前设置: {dailyReminder.time}{" "}
                  {tempReminderTime !== dailyReminder.time
                    ? "(有未保存的修改)"
                    : ""}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="time"
                  value={tempReminderTime}
                  onChange={(e) => {
                    setTempReminderTime(e.target.value);
                    setReminderTimeSaved(false);
                  }}
                  className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-sm"
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-orange-600">
                  {tempReminderTime !== dailyReminder.time
                    ? "时间已修改，请点击保存"
                    : "时间设置已保存"}
                </p>
                <button
                  onClick={handleSaveTime}
                  disabled={tempReminderTime === dailyReminder.time}
                  className={`inline-flex items-center space-x-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    reminderTimeSaved
                      ? "bg-green-500 text-white"
                      : tempReminderTime === dailyReminder.time
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-orange-500 text-white hover:bg-orange-600"
                  }`}
                >
                  {reminderTimeSaved ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>已保存</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3 h-3" />
                      <span>保存时间</span>
                    </>
                  )}
                </button>
              </div>
              <div className="bg-orange-100 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Bell className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-orange-700">
                    <p className="font-medium mb-1">提醒说明:</p>
                    <ul className="space-y-1">
                      <li>• 每日在设定时间发送桌面通知</li>
                      <li>• 需要您授权浏览器通知权限</li>
                      <li>• 只在当天首次到达设定时间时提醒</li>
                      <li>• 建议设置在您方便打卡的时间段</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!dailyReminder.enabled && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bell className="w-3 h-3 text-gray-500" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-600">
                  每日提醒已关闭
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  开启后将在指定时间提醒您完成习惯打卡
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
