import { useEffect, useRef } from "react";
import { Habit, DailyReminderSettings } from "../types";
import dayjs from "dayjs";

/**
 * 请求浏览器通知权限
 */
export const requestPermission = async (): Promise<NotificationPermission> => {
  if (!("Notification" in window)) {
    console.warn("该浏览器不支持桌面通知");
    return "denied";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
};

/**
 * 通知提醒 Hook
 * @param habits 习惯列表
 * @param dailyReminder 每日提醒设置
 */
export const useNotification = (
  habits: Habit[],
  dailyReminder: DailyReminderSettings
) => {
  const intervalRef = useRef<number | null>(null);
  const notifiedTodayRef = useRef<Set<string>>(new Set());
  const dailyNotifiedRef = useRef<boolean>(false);

  useEffect(() => {
    // 请求通知权限
    requestPermission();

    // 每天重置已通知集合
    const resetNotified = () => {
      const now = dayjs();
      if (now.hour() === 0 && now.minute() === 0) {
        notifiedTodayRef.current.clear();
        dailyNotifiedRef.current = false;
      }
    };

    // 检查并发送通知
    const checkAndNotify = () => {
      const now = dayjs();
      const currentTime = now.format("HH:mm");

      // 检查每日打卡提醒
      if (
        dailyReminder.enabled &&
        dailyReminder.time === currentTime &&
        !dailyNotifiedRef.current &&
        Notification.permission === "granted"
      ) {
        // 发送每日打卡提醒
        new Notification("每日打卡提醒", {
          body: "该完成今天的习惯打卡了！坚持就是胜利 💪",
          icon: "/favicon.svg",
          tag: "daily-reminder",
        });

        // 标记为已通知
        dailyNotifiedRef.current = true;
      }

      // 检查单个习惯提醒
      habits.forEach((habit) => {
        // 检查是否到了提醒时间且今天还未提醒过
        if (
          habit.reminderTime &&
          habit.reminderTime === currentTime &&
          !notifiedTodayRef.current.has(habit.id) &&
          Notification.permission === "granted"
        ) {
          // 发送通知
          new Notification("习惯打卡提醒", {
            body: `是时候完成「${habit.name}」了！`,
            icon: "/favicon.svg",
            tag: habit.id,
          });

          // 标记为已通知
          notifiedTodayRef.current.add(habit.id);
        }
      });

      // 检查是否需要重置
      resetNotified();
    };

    // 立即检查一次
    checkAndNotify();

    // 设置定时器，每秒检查一次
    intervalRef.current = window.setInterval(checkAndNotify, 1000);

    // 清理函数
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [habits, dailyReminder]);
};
