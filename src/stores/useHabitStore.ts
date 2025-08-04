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
  loading: boolean;
  error: string | null;
  init: () => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  updateCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addHabit: (
    categoryId: string,
    name: string,
    reminderTime?: string
  ) => Promise<void>;
  updateHabit: (
    id: string,
    name: string,
    reminderTime?: string
  ) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  checkinHabit: (habitId: string, note: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

export const useHabitStore = create<HabitStore>()(
  persist(
    (set) => ({
      categories: [],
      habits: [],
      habitLogs: [],
      loading: false,
      error: null,
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
      clearAll: async () => {
        try {
          await clearAllData();
          set({ categories: [], habits: [], habitLogs: [] });
        } catch (error: any) {
          set({ error: error.message });
        }
      },
    }),
    {
      name: "habit-store",
      getStorage: () => localStorage,
    }
  )
);
