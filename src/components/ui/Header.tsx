import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Target, Edit3, RefreshCw } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { useNavigate } from "react-router-dom";
import { useHabitStore } from "../../stores/useHabitStore";
import { getRandomQuote, getRefreshQuote, Quote } from "../../utils/quotes";
import FlipClockCountdown from "@leenguyen/react-flip-clock-countdown";
import "@leenguyen/react-flip-clock-countdown/dist/index.css";
import "./flip-clock-custom.css";

/**
 * Airbnb风格头部组件
 * 显示距离今日结束的倒计时，激励用户抓紧时间完成习惯
 */
export const Header: React.FC = () => {
  const { userName, updateUserName } = useHabitStore();
  const [isEditing, setIsEditing] = useState(false);
  const [tempUserName, setTempUserName] = useState(userName);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [isRefreshingQuote, setIsRefreshingQuote] = useState(false);
  const [urgencyLevel, setUrgencyLevel] = useState<
    "normal" | "warning" | "urgent"
  >("normal");
  const [targetTime, setTargetTime] = useState(dayjs().endOf("day").valueOf());
  const navigate = useNavigate();

  // 更新紧迫程度和目标时间
  useEffect(() => {
    const updateCountdown = () => {
      const now = dayjs();
      const endOfDay = now.endOf("day");
      const diff = endOfDay.diff(now);
      const hours = Math.floor(diff / (1000 * 60 * 60));

      // 更新紧迫程度
      if (hours < 1) {
        setUrgencyLevel("urgent");
      } else if (hours < 3) {
        setUrgencyLevel("warning");
      } else {
        setUrgencyLevel("normal");
      }

      // 更新目标时间
      setTargetTime(endOfDay.valueOf());
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000); // 每秒更新一次
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setTempUserName(userName);
  }, [userName]);

  // 获取名言
  useEffect(() => {
    const loadQuote = async () => {
      const quote = await getRandomQuote();
      setCurrentQuote(quote);
    };
    loadQuote();
  }, []);

  // 刷新名言（从数据库随机获取）
  const handleRefreshQuote = async () => {
    setIsRefreshingQuote(true);
    try {
      const quote = await getRefreshQuote();
      setCurrentQuote(quote);
    } catch (error) {
      console.warn("Failed to refresh quote:", error);
    } finally {
      setIsRefreshingQuote(false);
    }
  };

  const handleSaveUserName = () => {
    if (tempUserName.trim()) {
      updateUserName(tempUserName.trim());
    } else {
      setTempUserName(userName);
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveUserName();
    } else if (e.key === "Escape") {
      setTempUserName(userName);
      setIsEditing(false);
    }
  };

  const getGreeting = () => {
    const hour = dayjs().hour();
    if (hour < 6) return "夜深了";
    if (hour < 12) return "早上好";
    if (hour < 18) return "下午好";
    return "晚上好";
  };

  return (
    <div className="w-full bg-white py-4 px-6 shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-end">
            {/* 左侧：Logo和用户信息 */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <button
                onClick={() => navigate("/")}
                className="flex items-center space-x-2 group"
                title="回到首页"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-[#FF5A5F] to-[#FF7E82] rounded-xl flex items-center justify-center group-hover:shadow-lg transition-shadow duration-200">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-semibold text-[#FF5A5F]">
                  Habit Tracker
                </h1>
              </button>
            </div>

            {/* 用户信息 */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <div>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-gray-500">
                    {getGreeting()}，
                  </span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempUserName}
                      onChange={(e) => setTempUserName(e.target.value)}
                      onBlur={handleSaveUserName}
                      onKeyDown={handleKeyPress}
                      className="text-sm text-gray-700 font-medium bg-transparent border-b border-gray-400 focus:outline-none min-w-20 max-w-32"
                      autoFocus
                    />
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="group flex items-center space-x-1 text-sm text-gray-700 font-medium hover:text-gray-900 transition-colors"
                    >
                      <span>{userName}</span>
                      <Edit3 className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 中间：励志名言 */}
          {currentQuote && (
            <div className="hidden lg:flex flex-1 justify-center px-8">
              <Tooltip.Provider>
                <div className="group max-w-md text-center">
                  <div className="relative">
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <p
                          className={`text-sm text-gray-600 italic leading-relaxed ${
                            currentQuote.translation ? "cursor-help" : ""
                          }`}
                        >
                          "{currentQuote.text}"
                        </p>
                      </Tooltip.Trigger>
                      {currentQuote.translation && (
                        <Tooltip.Portal>
                          <Tooltip.Content
                            className="z-50 rounded-md bg-gray-800 px-3 py-2 text-xs text-white shadow-lg max-w-xs"
                            sideOffset={5}
                          >
                            {currentQuote.translation}
                            <Tooltip.Arrow className="fill-gray-800" />
                          </Tooltip.Content>
                        </Tooltip.Portal>
                      )}
                    </Tooltip.Root>

                    <p className="text-xs text-gray-400 mt-1">
                      — {currentQuote.author}
                    </p>
                    <button
                      onClick={handleRefreshQuote}
                      disabled={isRefreshingQuote}
                      className="absolute -right-8 top-0 p-1 rounded-full hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all duration-200"
                      title="换一句"
                    >
                      <RefreshCw
                        className={`w-3 h-3 text-gray-400 hover:text-gray-600 ${
                          isRefreshingQuote ? "animate-spin" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </Tooltip.Provider>
            </div>
          )}

          {/* 右侧：今日倒计时 */}
          <div className="flex-shrink-0">
            <div className="flex flex-col items-center space-y-1">
              <FlipClockCountdown
                key={targetTime}
                to={targetTime}
                labels={["天", "时", "分", "秒"]}
                renderMap={[false, true, true, true]}
                showLabels={false}
                showSeparators={true}
                digitBlockStyle={{
                  width: 40,
                  height: 60,
                  fontSize: 30,
                  fontWeight: "bold",
                }}
                className={`flip-clock-custom ${urgencyLevel}`}
              />
              <span
                className={`text-xs font-medium ${
                  urgencyLevel === "urgent"
                    ? "text-red-600"
                    : urgencyLevel === "warning"
                    ? "text-orange-600"
                    : "text-green-600"
                }`}
              >
                今日剩余
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
