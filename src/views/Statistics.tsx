import React from "react";
import { useHabitStore } from "../stores/useHabitStore";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";

const Statistics: React.FC = () => {
  const { habitLogs } = useHabitStore();

  // 生成最近7天的日期数组
  const lastSevenDays = Array.from({ length: 7 }, (_, i) =>
    dayjs().subtract(i, "day")
  );

  // 计算每日打卡数
  const data = lastSevenDays
    .map((day) => {
      const date = day.format("YYYY-MM-DD");
      const count = habitLogs.filter((log) =>
        dayjs(log.timestamp).isSame(day, "day")
      ).length;
      return {
        date,
        count,
      };
    })
    .reverse();

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">今日进度</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Statistics;
