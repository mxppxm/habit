import React, { useEffect, useState } from "react";
import { useHabitStore } from "../stores/useHabitStore";
import { useNotification } from "../hooks/useNotification";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, X, Target, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

/**
 * 首页组件 - 显示所有习惯项目并支持打卡
 */
const Dashboard: React.FC = () => {
  const { categories, habits, habitLogs, checkinHabit, init, loading } =
    useHabitStore();
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const navigate = useNavigate();

  // 使用通知提醒 Hook
  useNotification(habits);

  // 初始化数据
  useEffect(() => {
    init();
  }, [init]);

  /**
   * 处理打卡
   */
  const handleCheckin = async () => {
    if (selectedHabitId) {
      await checkinHabit(selectedHabitId, note);
      setSelectedHabitId(null);
      setNote("");
    }
  };

  /**
   * 检查某个习惯今天是否已打卡
   */
  const isCheckedToday = (habitId: string): boolean => {
    const today = dayjs().startOf("day");
    return habitLogs.some(
      (log) =>
        log.habitId === habitId && dayjs(log.timestamp).isSame(today, "day")
    );
  };

  /**
   * 获取今天的打卡时间
   */
  const getTodayCheckinTime = (habitId: string): string | null => {
    const today = dayjs().startOf("day");
    const todayLog = habitLogs.find(
      (log) =>
        log.habitId === habitId && dayjs(log.timestamp).isSame(today, "day")
    );
    return todayLog ? dayjs(todayLog.timestamp).format("HH:mm:ss") : null;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-[#FF5A5F] rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 text-lg">加载习惯数据中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {categories.length > 0 ? (
        categories.map((category) => {
          const categoryHabits = habits.filter(
            (habit) => habit.categoryId === category.id
          );

          if (categoryHabits.length === 0) return null;

          return (
            <div key={category.id} className="card p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-4 h-4 rounded-full bg-[#FF5A5F]"></div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  {category.name}
                </h2>
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {categoryHabits.length} 个习惯
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categoryHabits.map((habit) => {
                  const isChecked = isCheckedToday(habit.id);
                  const checkinTime = getTodayCheckinTime(habit.id);

                  return (
                    <Dialog.Root
                      key={habit.id}
                      open={selectedHabitId === habit.id}
                      onOpenChange={(open) => {
                        if (open && !isChecked) {
                          setSelectedHabitId(habit.id);
                        } else {
                          setSelectedHabitId(null);
                          setNote("");
                        }
                      }}
                    >
                      <Dialog.Trigger asChild>
                        <div
                          className={`
                            group p-6 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-105
                            ${
                              isChecked
                                ? "bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 shadow-lg"
                                : "bg-white border-2 border-gray-100 hover:border-[#FF5A5F] hover:shadow-xl"
                            }
                          `}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                                isChecked
                                  ? "bg-green-500 shadow-lg"
                                  : "bg-gray-100 group-hover:bg-[#FF5A5F]"
                              }`}
                            >
                              <span
                                className={`text-xl transition-all duration-200 ${
                                  isChecked
                                    ? "text-white"
                                    : "group-hover:text-white"
                                }`}
                              >
                                {isChecked ? "✓" : "⏰"}
                              </span>
                            </div>
                            <div className="text-right">
                              {habit.reminderTime && (
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                  {habit.reminderTime}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h3 className="font-semibold text-gray-800 text-lg leading-tight">
                              {habit.name}
                            </h3>
                            {checkinTime ? (
                              <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <p className="text-sm text-green-600 font-medium">
                                  已打卡 {checkinTime}
                                </p>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">点击打卡</p>
                            )}
                          </div>
                        </div>
                      </Dialog.Trigger>

                      <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
                        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl z-50">
                          <div className="flex items-center justify-between mb-6">
                            <Dialog.Title className="text-2xl font-semibold text-gray-800">
                              打卡: {habit.name}
                            </Dialog.Title>
                            <Dialog.Close asChild>
                              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                                <X className="w-5 h-5 text-gray-500" />
                              </button>
                            </Dialog.Close>
                          </div>

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
                                onChange={(e) => setNote(e.target.value)}
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
                              onClick={handleCheckin}
                              className="px-6 py-2.5 bg-[#FF5A5F] text-white rounded-xl hover:bg-pink-600 transition-colors duration-200 font-medium shadow-md hover:shadow-lg"
                            >
                              确认打卡
                            </button>
                          </div>
                        </Dialog.Content>
                      </Dialog.Portal>
                    </Dialog.Root>
                  );
                })}
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[#FF5A5F] to-pink-400 rounded-full flex items-center justify-center shadow-lg">
              <Target className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">
              开始你的习惯之旅
            </h3>
            <p className="text-gray-500 text-lg mb-6 leading-relaxed">
              还没有任何习惯项目，创建你的第一个习惯开始打卡吧！
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/management")}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-[#FF5A5F] text-white rounded-xl hover:bg-pink-600 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
              >
                <Plus className="w-5 h-5" />
                <span>创建第一个习惯</span>
              </button>
              <div className="text-sm text-gray-400">
                或者查看
                <button
                  onClick={() => navigate("/statistics")}
                  className="text-[#FF5A5F] hover:text-pink-600 mx-1 underline"
                >
                  统计页面
                </button>
                了解更多
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
