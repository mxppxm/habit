import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Category, Habit, HabitLog, DailyReminderSettings } from "../types";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import {
  initDB,
  getAllData,
  addData,
  putData,
  deleteData,
  clearAllData,
} from "../services/db";
import { leanCloudSyncService } from "../services/leanCloudSyncService";

function deduplicateById<T extends { id: string }>(list: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of list) {
    map.set(item.id, item);
  }
  return Array.from(map.values());
}

interface HabitStore {
  categories: Category[];
  habits: Habit[];
  habitLogs: HabitLog[];
  userName: string;
  loading: boolean;
  error: string | null;
  aiEnabled: boolean;
  apiKey: string;
  // 每日提醒设置
  dailyReminder: DailyReminderSettings;
  // 同步相关状态
  syncEnabled: boolean;
  // 单一提供者：LeanCloud
  lastSyncTime: number;
  isSyncing: boolean;
  syncError: string | null;
  isOnline: boolean;
  // LeanCloud 认证状态
  leanAuthenticated: boolean;
  leanEmail: string;
  leanUserId: string;
  // 显示设置
  showDashboardAIIcon: boolean;

  // 今日目标庆祝标记：categoryId -> YYYY-MM-DD
  categoryDailyCelebrated: Record<string, string>;

  init: () => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  insertCategory: (category: Category) => Promise<void>;
  updateCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addHabit: (
    categoryId: string,
    name: string,
    reminderTime?: string
  ) => Promise<void>;
  insertHabit: (habit: Habit) => Promise<void>;
  updateHabit: (
    id: string,
    name: string,
    reminderTime?: string
  ) => Promise<void>;
  updateHabitCategory: (id: string, categoryId: string) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  checkinHabit: (habitId: string, note: string) => Promise<void>;
  makeupCheckinHabit: (
    habitId: string,
    note: string,
    originalDate: Date
  ) => Promise<void>;
  deleteHabitLog: (logId: string) => Promise<void>;
  updateHabitLog: (logId: string, note: string) => Promise<void>;
  updateUserName: (name: string) => void;
  setAIEnabled: (enabled: boolean) => void;
  setApiKey: (key: string) => void;
  setShowDashboardAIIcon: (enabled: boolean) => void;
  setDailyReminderEnabled: (enabled: boolean) => void;
  setDailyReminderTime: (time: string) => void;
  clearAll: () => Promise<void>;

  // 同步相关方法
  setSyncEnabled: (enabled: boolean) => void;
  syncToCloud: () => Promise<void>;
  syncFromCloud: () => Promise<void>;
  enableAutoSync: () => void;
  disableAutoSync: () => void;
  // 注销：清空云端数据
  clearRemoteAndLogout: () => Promise<void>;
  // 登录后引导检查
  checkSyncOnboarding: () => Promise<{
    remoteEmpty: boolean;
    hasLocal: boolean;
  }>;
  // 合并去重并双向同步
  mergeCloudAndLocal: () => Promise<void>;
  repairCloudData: () => Promise<void>;
  // LeanCloud 认证
  leanRegisterOrLogin: (email: string, password: string) => Promise<void>;
  leanLogout: () => Promise<void>;

  // 目标完成庆祝相关
  hasCategoryCelebratedToday: (categoryId: string) => boolean;
  markCategoryCelebratedToday: (categoryId: string) => void;
}

let autoSyncUnsubscribe: (() => void) | null = null;
let autoSyncTimer: number | null = null;

function scheduleAutoSyncUp(): void {
  const s = useHabitStore.getState();
  if (!s.syncEnabled || !s.isOnline || !s.leanAuthenticated) return;
  if (autoSyncTimer) {
    window.clearTimeout(autoSyncTimer);
  }
  autoSyncTimer = window.setTimeout(async () => {
    const state = useHabitStore.getState();
    try {
      const delta = buildDeltaFromQueue();
      if (
        delta.upserts.categories.length === 0 &&
        delta.upserts.habits.length === 0 &&
        delta.upserts.habitLogs.length === 0 &&
        delta.deletes.categories.length === 0 &&
        delta.deletes.habits.length === 0 &&
        delta.deletes.habitLogs.length === 0
      ) {
        return;
      }
      await (leanCloudSyncService.deltaSync
        ? leanCloudSyncService.deltaSync(delta)
        : leanCloudSyncService.fullSyncUp({
            categories: state.categories,
            habits: state.habits,
            habitLogs: state.habitLogs,
          }));
      clearDeltaQueues();
      useHabitStore.setState({ lastSyncTime: Date.now() });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "自动同步失败";
      useHabitStore.setState({ syncError: message });
    }
  }, 800);
}

// -------------------- 增量同步内存队列（不持久化） --------------------
const upsertQueues = {
  categories: new Map<string, Category>(),
  habits: new Map<string, Habit>(),
  habitLogs: new Map<string, HabitLog>(),
};
const deleteQueues = {
  categories: new Set<string>(),
  habits: new Set<string>(),
  habitLogs: new Set<string>(),
};

function enqueueUpsert(
  kind: "categories" | "habits" | "habitLogs",
  item: Category | Habit | HabitLog
): void {
  // upsert 与 delete 冲突时，以 upsert 为准
  // @ts-expect-error narrow at runtime
  upsertQueues[kind].set((item as any).id, item);
  // @ts-expect-error narrow at runtime
  deleteQueues[kind].delete((item as any).id);
}

function enqueueDelete(
  kind: "categories" | "habits" | "habitLogs",
  id: string
): void {
  // delete 与 upsert 冲突时，以 delete 为准
  // @ts-expect-error narrow at runtime
  upsertQueues[kind].delete(id);
  // @ts-expect-error narrow at runtime
  deleteQueues[kind].add(id);
}

function buildDeltaFromQueue() {
  return {
    upserts: {
      categories: Array.from(upsertQueues.categories.values()),
      habits: Array.from(upsertQueues.habits.values()),
      habitLogs: Array.from(upsertQueues.habitLogs.values()),
    },
    deletes: {
      categories: Array.from(deleteQueues.categories.values()),
      habits: Array.from(deleteQueues.habits.values()),
      habitLogs: Array.from(deleteQueues.habitLogs.values()),
    },
  } as const;
}

function clearDeltaQueues(): void {
  upsertQueues.categories.clear();
  upsertQueues.habits.clear();
  upsertQueues.habitLogs.clear();
  deleteQueues.categories.clear();
  deleteQueues.habits.clear();
  deleteQueues.habitLogs.clear();
}

export const useHabitStore = create<HabitStore>()(
  persist(
    (set, get) => ({
      categories: [],
      habits: [],
      habitLogs: [],
      userName: "亲爱的朋友",
      loading: false,
      error: null,
      aiEnabled: false,
      apiKey: "",
      showDashboardAIIcon: false,
      categoryDailyCelebrated: {},
      // 每日提醒默认设置
      dailyReminder: {
        enabled: true,
        time: "20:00",
      },
      // 同步相关初始状态（LeanCloud 单一模式）
      syncEnabled: false,
      lastSyncTime: 0,
      isSyncing: false,
      syncError: null,
      isOnline: navigator.onLine,
      // LeanCloud 登录状态延迟到 provider 内部初始化后再更新
      leanAuthenticated: false,
      leanEmail: "",
      leanUserId: "",
      init: async () => {
        try {
          set({ loading: true });
          await initDB();
          const categories = await getAllData<Category>("categories");
          const habits = await getAllData<Habit>("habits");
          const habitLogs = await getAllData<HabitLog>("habitLogs");
          set({ categories, habits, habitLogs, loading: false });

          // 恢复 LeanCloud 登录态
          const state = useHabitStore.getState();
          const u = leanCloudSyncService.getCurrentUser?.();
          if (u) {
            set({
              leanAuthenticated: true,
              leanEmail: u.email,
              leanUserId: u.userId,
            });
          }

          const shouldSyncFromCloud =
            state.syncEnabled && navigator.onLine && state.leanAuthenticated;

          if (shouldSyncFromCloud) {
            // 静默同步：若失败则忽略，不阻塞启动
            try {
              await useHabitStore.getState().syncFromCloud();
            } catch (_e) {
              // 忽略启动时的云端拉取错误，保持本地数据可用
            }
          }
        } catch (error: any) {
          set({ error: error.message, loading: false });
        }
      },
      addCategory: async (name) => {
        try {
          const newCategory: Category = { id: uuidv4(), name };
          await addData("categories", newCategory);
          set((state) => {
            const next = [...state.categories, newCategory];
            const map = new Map(next.map((c) => [c.id, c]));
            return { categories: Array.from(map.values()) };
          });
          enqueueUpsert("categories", newCategory);
          scheduleAutoSyncUp();
        } catch (error: any) {
          set({ error: error.message });
        }
      },
      insertCategory: async (category: Category) => {
        try {
          await addData("categories", category);
          set((state) => {
            const next = [...state.categories, category];
            const map = new Map(next.map((c) => [c.id, c]));
            return { categories: Array.from(map.values()) };
          });
          enqueueUpsert("categories", category);
          scheduleAutoSyncUp();
        } catch (error: any) {
          set({ error: error.message });
        }
      },
      updateCategory: async (id, name) => {
        try {
          const category = useHabitStore
            .getState()
            .categories.find((c) => c.id === id);
          if (category) {
            const updatedCategory = { ...category, name };
            await putData("categories", updatedCategory);
            set((state) => ({
              categories: state.categories.map((c) =>
                c.id === id ? updatedCategory : c
              ),
            }));
            enqueueUpsert("categories", updatedCategory);
            scheduleAutoSyncUp();
          }
        } catch (error: any) {
          set({ error: error.message });
        }
      },
      deleteCategory: async (id) => {
        try {
          await deleteData("categories", id);
          set((state) => ({
            categories: state.categories.filter((c) => c.id !== id),
          }));
          enqueueDelete("categories", id);
          scheduleAutoSyncUp();
        } catch (error: any) {
          set({ error: error.message });
        }
      },
      addHabit: async (categoryId, name, reminderTime) => {
        try {
          const newHabit: Habit = {
            id: uuidv4(),
            categoryId,
            name,
            reminderTime,
          };
          await addData("habits", newHabit);
          set((state) => {
            const next = [...state.habits, newHabit];
            const map = new Map(next.map((h) => [h.id, h]));
            return { habits: Array.from(map.values()) };
          });
          enqueueUpsert("habits", newHabit);
          scheduleAutoSyncUp();
        } catch (error: any) {
          set({ error: error.message });
        }
      },
      insertHabit: async (habit: Habit) => {
        try {
          await addData("habits", habit);
          set((state) => {
            const next = [...state.habits, habit];
            const map = new Map(next.map((h) => [h.id, h]));
            return { habits: Array.from(map.values()) };
          });
          enqueueUpsert("habits", habit);
          scheduleAutoSyncUp();
        } catch (error: any) {
          set({ error: error.message });
        }
      },
      updateHabit: async (id, name, reminderTime) => {
        try {
          const habit = useHabitStore
            .getState()
            .habits.find((h) => h.id === id);
          if (habit) {
            const updatedHabit = { ...habit, name, reminderTime };
            await putData("habits", updatedHabit);
            set((state) => ({
              habits: state.habits.map((h) => (h.id === id ? updatedHabit : h)),
            }));
            enqueueUpsert("habits", updatedHabit);
            scheduleAutoSyncUp();
          }
        } catch (error: any) {
          set({ error: error.message });
        }
      },
      updateHabitCategory: async (id, categoryId) => {
        try {
          const habit = useHabitStore
            .getState()
            .habits.find((h) => h.id === id);
          if (habit) {
            await putData("habits", { ...habit, categoryId });
            set((state) => ({
              habits: state.habits.map((h) =>
                h.id === id ? { ...h, categoryId } : h
              ),
            }));
            enqueueUpsert("habits", { ...habit, categoryId });
            scheduleAutoSyncUp();
          }
        } catch (error: any) {
          set({ error: error.message });
        }
      },
      deleteHabit: async (id) => {
        try {
          await deleteData("habits", id);
          set((state) => ({
            habits: state.habits.filter((h) => h.id !== id),
          }));
          enqueueDelete("habits", id);
          scheduleAutoSyncUp();
        } catch (error: any) {
          set({ error: error.message });
        }
      },
      checkinHabit: async (habitId, note) => {
        try {
          const newHabitLog: HabitLog = {
            id: uuidv4(),
            habitId,
            timestamp: Date.now(),
            note,
          };
          await addData("habitLogs", newHabitLog);
          set((state) => ({ habitLogs: [...state.habitLogs, newHabitLog] }));
          enqueueUpsert("habitLogs", newHabitLog);
          scheduleAutoSyncUp();
        } catch (error: any) {
          set({ error: error.message });
        }
      },
      makeupCheckinHabit: async (habitId, note, originalDate) => {
        try {
          const newHabitLog: HabitLog = {
            id: uuidv4(),
            habitId,
            timestamp: Date.now(), // 当前时间
            note,
            isMakeup: true,
            originalDate: originalDate.getTime(), // 原本应该打卡的日期
          };
          await addData("habitLogs", newHabitLog);
          set((state) => ({ habitLogs: [...state.habitLogs, newHabitLog] }));
          enqueueUpsert("habitLogs", newHabitLog);
          scheduleAutoSyncUp();
        } catch (error: any) {
          set({ error: error.message });
        }
      },
      deleteHabitLog: async (logId) => {
        try {
          const stateBefore = get();
          const existingLog = stateBefore.habitLogs.find((l) => l.id === logId);

          await deleteData("habitLogs", logId);

          set((state) => {
            const updatedLogs = state.habitLogs.filter(
              (log) => log.id !== logId
            );

            // 如果该分类今天已被标记庆祝，则检查删除后是否仍然“全部完成”
            if (existingLog) {
              const affectedHabit = state.habits.find(
                (h) => h.id === existingLog.habitId
              );
              if (affectedHabit) {
                const categoryId = affectedHabit.categoryId;
                const today = dayjs().startOf("day");
                const categoryHabits = state.habits.filter(
                  (h) => h.categoryId === categoryId
                );
                const allDoneTodayAfterDeletion = categoryHabits.every((h) =>
                  updatedLogs.some(
                    (log) =>
                      log.habitId === h.id &&
                      dayjs(log.timestamp).isSame(today, "day")
                  )
                );
                if (!allDoneTodayAfterDeletion) {
                  const nextCelebrated = { ...state.categoryDailyCelebrated };
                  delete nextCelebrated[categoryId];
                  return {
                    habitLogs: updatedLogs,
                    categoryDailyCelebrated: nextCelebrated,
                  } as Partial<HabitStore>;
                }
              }
            }

            enqueueDelete("habitLogs", logId);
            return { habitLogs: updatedLogs } as Partial<HabitStore>;
          });
          scheduleAutoSyncUp();
        } catch (error: any) {
          set({ error: error.message });
        }
      },
      updateHabitLog: async (logId, note) => {
        try {
          const existingLog = useHabitStore
            .getState()
            .habitLogs.find((log) => log.id === logId);
          if (existingLog) {
            const updatedLog = { ...existingLog, note };
            await putData("habitLogs", updatedLog);
            set((state) => ({
              habitLogs: state.habitLogs.map((log) =>
                log.id === logId ? updatedLog : log
              ),
            }));
            enqueueUpsert("habitLogs", updatedLog);
            scheduleAutoSyncUp();
          }
        } catch (error: any) {
          set({ error: error.message });
        }
      },
      updateUserName: (name) => {
        set({ userName: name });
      },
      setAIEnabled: (enabled) => {
        set({ aiEnabled: enabled });
      },
      setApiKey: (key) => {
        set({ apiKey: key });
      },
      setShowDashboardAIIcon: (enabled) => {
        set({ showDashboardAIIcon: enabled });
      },
      setDailyReminderEnabled: (enabled) => {
        set((state) => ({
          dailyReminder: { ...state.dailyReminder, enabled },
        }));
      },
      setDailyReminderTime: (time) => {
        set((state) => ({
          dailyReminder: { ...state.dailyReminder, time },
        }));
      },
      clearAll: async () => {
        try {
          await clearAllData();
          set({
            categories: [],
            habits: [],
            habitLogs: [],
            userName: "亲爱的朋友", // 重置用户名为默认值
            aiEnabled: false, // 重置AI功能为默认值
            apiKey: "", // 重置API Key
            dailyReminder: { enabled: true, time: "20:00" }, // 重置提醒设置为默认值
            categoryDailyCelebrated: {},
          });
        } catch (error: any) {
          set({ error: error.message });
        }
      },

      // 同步相关方法实现
      setSyncEnabled: (enabled: boolean) => {
        set({ syncEnabled: enabled });
        if (enabled) {
          get().enableAutoSync();
        } else {
          get().disableAutoSync();
        }
      },

      syncToCloud: async () => {
        const state = get();
        if (!state.syncEnabled) throw new Error("同步功能未启用");
        if (!state.leanAuthenticated) throw new Error("请先登录 LeanCloud");

        try {
          set({ isSyncing: true, syncError: null });

          await leanCloudSyncService.fullSyncUp({
            categories: state.categories,
            habits: state.habits,
            habitLogs: state.habitLogs,
          });

          set({
            lastSyncTime: Date.now(),
            isSyncing: false,
          });
        } catch (error: any) {
          set({
            syncError: error.message,
            isSyncing: false,
          });
          throw error;
        }
      },

      syncFromCloud: async () => {
        const state = get();
        if (!state.syncEnabled) throw new Error("同步功能未启用");
        if (!state.leanAuthenticated) throw new Error("请先登录 LeanCloud");

        try {
          set({ isSyncing: true, syncError: null });

          const cloudData = await leanCloudSyncService.fullSyncDown();

          // 清空本地数据库
          await clearAllData();

          // 保存云端数据到本地
          const promises = [
            ...cloudData.categories.map((category) =>
              addData("categories", category)
            ),
            ...cloudData.habits.map((habit) => addData("habits", habit)),
            ...cloudData.habitLogs.map((log) => addData("habitLogs", log)),
          ];

          await Promise.all(promises);

          // 更新状态
          set({
            categories: cloudData.categories,
            habits: cloudData.habits,
            habitLogs: cloudData.habitLogs,
            lastSyncTime: Date.now(),
            isSyncing: false,
          });
        } catch (error: any) {
          set({
            syncError: error.message,
            isSyncing: false,
          });
          throw error;
        }
      },

      // 登录后引导检查：判断云端是否为空、本地是否有数据
      checkSyncOnboarding: async () => {
        if (!get().leanAuthenticated) throw new Error("未登录");
        const [cats, habs, logs] = await Promise.all([
          getAllData<Category>("categories"),
          getAllData<Habit>("habits"),
          getAllData<HabitLog>("habitLogs"),
        ]);
        const hasLocal = cats.length + habs.length + logs.length > 0;
        await leanCloudSyncService.repairCloudData?.();
        const cloud = await leanCloudSyncService.fullSyncDown();
        const remoteEmpty =
          cloud.categories.length +
            cloud.habits.length +
            cloud.habitLogs.length ===
          0;
        return { remoteEmpty, hasLocal } as const;
      },

      // 合并去重并双向同步
      mergeCloudAndLocal: async () => {
        if (!get().leanAuthenticated) throw new Error("未登录");
        try {
          set({ isSyncing: true, syncError: null });
          const cloud = await leanCloudSyncService.fullSyncDown();
          const localCats = await getAllData<Category>("categories");
          const localHabs = await getAllData<Habit>("habits");
          const localLogs = await getAllData<HabitLog>("habitLogs");

          const mapById = <T extends { id: string }>(a: T[], b: T[]) => {
            const m = new Map<string, T>();
            for (const x of a) m.set(x.id, x);
            for (const y of b) if (!m.has(y.id)) m.set(y.id, y);
            return Array.from(m.values());
          };

          const mergedCats = mapById(cloud.categories, localCats);
          const mergedHabs = mapById(cloud.habits, localHabs);
          const mergedLogs = mapById(cloud.habitLogs, localLogs);

          // 覆盖本地
          await clearAllData();
          await Promise.all([
            ...mergedCats.map((c) => addData("categories", c)),
            ...mergedHabs.map((h) => addData("habits", h)),
            ...mergedLogs.map((l) => addData("habitLogs", l)),
          ]);
          set({
            categories: mergedCats,
            habits: mergedHabs,
            habitLogs: mergedLogs,
          });

          // 推送到云端（增量方式）
          if (leanCloudSyncService.deltaSync) {
            await leanCloudSyncService.deltaSync({
              upserts: {
                categories: mergedCats,
                habits: mergedHabs,
                habitLogs: mergedLogs,
              },
              deletes: { categories: [], habits: [], habitLogs: [] },
            });
          } else {
            await leanCloudSyncService.fullSyncUp({
              categories: mergedCats,
              habits: mergedHabs,
              habitLogs: mergedLogs,
            });
          }

          set({ lastSyncTime: Date.now(), isSyncing: false });
        } catch (error: any) {
          set({ syncError: error.message, isSyncing: false });
          throw error;
        }
      },

      // 云端修复：补齐缺失 id，去除重复
      repairCloudData: async () => {
        try {
          set({ isSyncing: true, syncError: null });
          await leanCloudSyncService.repairCloudData?.();
          set({ isSyncing: false });
        } catch (error: any) {
          set({ syncError: error.message, isSyncing: false });
          throw error;
        }
      },

      enableAutoSync: () => {
        const state = get();
        if (!state.syncEnabled || autoSyncUnsubscribe) {
          return;
        }
        if (!state.leanAuthenticated) return;

        // 监听网络状态变化
        const handleOnline = () => set({ isOnline: true });
        const handleOffline = () => set({ isOnline: false });

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        // 订阅云端数据变化
        autoSyncUnsubscribe = leanCloudSyncService.subscribeToChanges(
          (categories) => {
            categories.forEach((category) => putData("categories", category));
            set({ categories: deduplicateById(categories) });
          },
          (habits) => {
            habits.forEach((habit) => putData("habits", habit));
            set({ habits: deduplicateById(habits) });
          },
          (habitLogs) => {
            habitLogs.forEach((log) => putData("habitLogs", log));
            set({ habitLogs: deduplicateById(habitLogs) });
          }
        );

        // 组合清理函数
        const originalUnsubscribe = autoSyncUnsubscribe;
        autoSyncUnsubscribe = () => {
          window.removeEventListener("online", handleOnline);
          window.removeEventListener("offline", handleOffline);
          originalUnsubscribe();
        };
      },

      // LeanCloud 认证：优先注册，若已存在则登录
      leanRegisterOrLogin: async (email: string, password: string) => {
        try {
          set({ isSyncing: true, syncError: null });
          try {
            const info = await leanCloudSyncService.register?.(email, password);
            if (!info) throw new Error("注册失败");
            set({
              leanAuthenticated: true,
              leanEmail: info.email,
              leanUserId: info.userId,
            });
          } catch (regErr: any) {
            const code = regErr?.code as number | undefined;
            if (code === 202 || code === 203) {
              const info = await leanCloudSyncService.login(email, password);
              set({
                leanAuthenticated: true,
                leanEmail: info.email,
                leanUserId: info.userId,
              });
            } else {
              throw regErr;
            }
          }
          if (get().syncEnabled) {
            get().enableAutoSync();
          }
        } catch (error: any) {
          set({ syncError: error.message });
          throw error;
        } finally {
          set({ isSyncing: false });
        }
      },

      leanLogout: async () => {
        // 关闭自动同步，清理订阅
        get().disableAutoSync();
        await leanCloudSyncService.logout();
        set({ leanAuthenticated: false, leanEmail: "", leanUserId: "" });
      },

      clearRemoteAndLogout: async () => {
        const state = get();
        // 仅在启用同步时执行
        try {
          set({ isSyncing: true, syncError: null });
          // 关自动同步
          get().disableAutoSync();
          await leanCloudSyncService.clearRemoteData();
          await leanCloudSyncService.logout();
          set({ leanAuthenticated: false, leanEmail: "", leanUserId: "" });
          // 清空本地数据库
          await clearAllData();
          set({ categories: [], habits: [], habitLogs: [] });
        } catch (error: any) {
          set({ syncError: error.message });
          throw error;
        } finally {
          set({ isSyncing: false });
        }
      },

      disableAutoSync: () => {
        if (autoSyncUnsubscribe) {
          autoSyncUnsubscribe();
          autoSyncUnsubscribe = null;
        }
      },

      hasCategoryCelebratedToday: (categoryId: string) => {
        const today = dayjs().format("YYYY-MM-DD");
        const map = get().categoryDailyCelebrated;
        return map[categoryId] === today;
      },
      markCategoryCelebratedToday: (categoryId: string) => {
        const today = dayjs().format("YYYY-MM-DD");
        const prev = get().categoryDailyCelebrated;
        set({ categoryDailyCelebrated: { ...prev, [categoryId]: today } });
      },
    }),
    {
      name: "habit-store",
      getStorage: () => localStorage,
      partialize: (state) => ({
        userName: state.userName,
        aiEnabled: state.aiEnabled,
        apiKey: state.apiKey,
        showDashboardAIIcon: state.showDashboardAIIcon,
        dailyReminder: state.dailyReminder,
        syncEnabled: state.syncEnabled,
        syncUserId: state.syncUserId,
        lastSyncTime: state.lastSyncTime,
        categoryDailyCelebrated: state.categoryDailyCelebrated,
      }),
    }
  )
);
