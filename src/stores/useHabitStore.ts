import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Category, Habit, HabitLog } from "../types";
import { v4 as uuidv4 } from "uuid";
import {
  initDB,
  getAllData,
  addData,
  putData,
  deleteData,
  clearAllData,
} from "../services/db";

interface HabitStore {
  categories: Category[];
  habits: Habit[];
  habitLogs: HabitLog[];
  userName: string;
  loading: boolean;
  error: string | null;
  aiEnabled: boolean;
  apiKey: string;
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
  deleteHabitLog: (logId: string) => Promise<void>;
  updateHabitLog: (logId: string, note: string) => Promise<void>;
  updateUserName: (name: string) => void;
  setAIEnabled: (enabled: boolean) => void;
  setApiKey: (key: string) => void;
  clearAll: () => Promise<void>;
}

export const useHabitStore = create<HabitStore>()(
  persist(
    (set) => ({
      categories: [],
      habits: [],
      habitLogs: [],
      userName: "亲爱的朋友",
      loading: false,
      error: null,
      aiEnabled: false,
      apiKey: "",
      init: async () => {
        try {
          set({ loading: true });
          await initDB();
          const categories = await getAllData<Category>("categories");
          const habits = await getAllData<Habit>("habits");
          const habitLogs = await getAllData<HabitLog>("habitLogs");
          set({ categories, habits, habitLogs, loading: false });
        } catch (error: any) {
          set({ error: error.message, loading: false });
        }
      },
      addCategory: async (name) => {
        try {
          const newCategory: Category = { id: uuidv4(), name };
          await addData("categories", newCategory);
          set((state) => ({ categories: [...state.categories, newCategory] }));
        } catch (error: any) {
          set({ error: error.message });
        }
      },
      insertCategory: async (category: Category) => {
        try {
          await addData("categories", category);
          set((state) => ({ categories: [...state.categories, category] }));
        } catch (error: any) {
          set({ error: error.message });
        }
      },
      updateCategory: async (id, name) => {
        try {
          await putData("categories", { id, name });
          set((state) => ({
            categories: state.categories.map((c) =>
              c.id === id ? { id, name } : c
            ),
          }));
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
          set((state) => ({ habits: [...state.habits, newHabit] }));
        } catch (error: any) {
          set({ error: error.message });
        }
      },
      insertHabit: async (habit: Habit) => {
        try {
          await addData("habits", habit);
          set((state) => ({ habits: [...state.habits, habit] }));
        } catch (error: any) {
          set({ error: error.message });
        }
      },
      updateHabit: async (id, name, reminderTime) => {
        try {
          await putData("habits", { id, name, reminderTime });
          set((state) => ({
            habits: state.habits.map((h) =>
              h.id === id ? { ...h, name, reminderTime } : h
            ),
          }));
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
        } catch (error: any) {
          set({ error: error.message });
        }
      },
      deleteHabitLog: async (logId) => {
        try {
          await deleteData("habitLogs", logId);
          set((state) => ({
            habitLogs: state.habitLogs.filter((log) => log.id !== logId),
          }));
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
          });
        } catch (error: any) {
          set({ error: error.message });
        }
      },
    }),
    {
      name: "habit-store",
      getStorage: () => localStorage,
      partialize: (state) => ({
        userName: state.userName,
        aiEnabled: state.aiEnabled,
        apiKey: state.apiKey,
      }),
    }
  )
);
