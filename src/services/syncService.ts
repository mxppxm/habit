import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  enableNetwork,
  disableNetwork,
} from "firebase/firestore";
import { Category, Habit, HabitLog } from "../types";

// Firebase 配置 - 需要从 Firebase Console 获取
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 开发环境连接到模拟器
if (
  import.meta.env.MODE === "development" &&
  !import.meta.env.VITE_FIREBASE_USE_EMULATOR
) {
  // 如果需要使用本地模拟器，取消下面的注释
  // connectFirestoreEmulator(db, 'localhost', 8080);
}

export interface SyncConfig {
  userId: string;
  enabled: boolean;
  lastSyncTime: number;
}

export class SyncService {
  private userId: string | null = null;
  private listeners: (() => void)[] = [];
  private isOnline = navigator.onLine;

  constructor() {
    // 监听网络状态
    window.addEventListener("online", this.handleOnline);
    window.addEventListener("offline", this.handleOffline);
  }

  private handleOnline = () => {
    this.isOnline = true;
    enableNetwork(db);
  };

  private handleOffline = () => {
    this.isOnline = false;
    disableNetwork(db);
  };

  /**
   * 设置用户 ID（可以是设备 ID 或用户输入的 ID）
   */
  setUserId(userId: string) {
    this.userId = userId;
  }

  /**
   * 获取当前用户 ID
   */
  getUserId(): string | null {
    return this.userId;
  }

  /**
   * 检查是否在线
   */
  isNetworkOnline(): boolean {
    return this.isOnline;
  }

  /**
   * 上传分类数据
   */
  async syncCategories(categories: Category[]): Promise<void> {
    if (!this.userId) throw new Error("User ID not set");

    const userCategoriesRef = collection(
      db,
      "users",
      this.userId,
      "categories"
    );

    // 获取云端现有数据
    const cloudSnapshot = await getDocs(userCategoriesRef);
    const cloudCategories = new Set(
      cloudSnapshot.docs.map((doc: any) => doc.id)
    );

    // 上传本地数据
    const promises = categories.map((category) =>
      setDoc(doc(userCategoriesRef, category.id), {
        ...category,
        lastModified: Date.now(),
      })
    );

    await Promise.all(promises);

    // 删除云端多余的数据
    const localCategoryIds = new Set(categories.map((c) => c.id));
    const toDelete = [...cloudCategories].filter(
      (id: any) => !localCategoryIds.has(id)
    );

    const deletePromises = toDelete.map((id) =>
      deleteDoc(doc(userCategoriesRef, id))
    );

    await Promise.all(deletePromises);
  }

  /**
   * 上传习惯数据
   */
  async syncHabits(habits: Habit[]): Promise<void> {
    if (!this.userId) throw new Error("User ID not set");

    const userHabitsRef = collection(db, "users", this.userId, "habits");

    const cloudSnapshot = await getDocs(userHabitsRef);
    const cloudHabits = new Set(cloudSnapshot.docs.map((doc: any) => doc.id));

    const promises = habits.map((habit) =>
      setDoc(doc(userHabitsRef, habit.id), {
        ...habit,
        lastModified: Date.now(),
      })
    );

    await Promise.all(promises);

    const localHabitIds = new Set(habits.map((h) => h.id));
    const toDelete = [...cloudHabits].filter(
      (id: any) => !localHabitIds.has(id)
    );

    const deletePromises = toDelete.map((id) =>
      deleteDoc(doc(userHabitsRef, id))
    );

    await Promise.all(deletePromises);
  }

  /**
   * 上传习惯记录数据
   */
  async syncHabitLogs(habitLogs: HabitLog[]): Promise<void> {
    if (!this.userId) throw new Error("User ID not set");

    const userLogsRef = collection(db, "users", this.userId, "habitLogs");

    const cloudSnapshot = await getDocs(userLogsRef);
    const cloudLogs = new Set(cloudSnapshot.docs.map((doc: any) => doc.id));

    const promises = habitLogs.map((log) =>
      setDoc(doc(userLogsRef, log.id), {
        ...log,
        lastModified: Date.now(),
      })
    );

    await Promise.all(promises);

    const localLogIds = new Set(habitLogs.map((l) => l.id));
    const toDelete = [...cloudLogs].filter((id: any) => !localLogIds.has(id));

    const deletePromises = toDelete.map((id) =>
      deleteDoc(doc(userLogsRef, id))
    );

    await Promise.all(deletePromises);
  }

  /**
   * 下载分类数据
   */
  async downloadCategories(): Promise<Category[]> {
    if (!this.userId) throw new Error("User ID not set");

    const userCategoriesRef = collection(
      db,
      "users",
      this.userId,
      "categories"
    );
    const snapshot = await getDocs(userCategoriesRef);

    return snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: data.id,
        name: data.name,
      } as Category;
    });
  }

  /**
   * 下载习惯数据
   */
  async downloadHabits(): Promise<Habit[]> {
    if (!this.userId) throw new Error("User ID not set");

    const userHabitsRef = collection(db, "users", this.userId, "habits");
    const snapshot = await getDocs(userHabitsRef);

    return snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: data.id,
        categoryId: data.categoryId,
        name: data.name,
        reminderTime: data.reminderTime,
      } as Habit;
    });
  }

  /**
   * 下载习惯记录数据
   */
  async downloadHabitLogs(): Promise<HabitLog[]> {
    if (!this.userId) throw new Error("User ID not set");

    const userLogsRef = collection(db, "users", this.userId, "habitLogs");
    const snapshot = await getDocs(userLogsRef);

    return snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: data.id,
        habitId: data.habitId,
        timestamp: data.timestamp,
        note: data.note,
      } as HabitLog;
    });
  }

  /**
   * 监听云端数据变化
   */
  subscribeToChanges(
    onCategoriesChange: (categories: Category[]) => void,
    onHabitsChange: (habits: Habit[]) => void,
    onHabitLogsChange: (habitLogs: HabitLog[]) => void
  ): () => void {
    if (!this.userId) throw new Error("User ID not set");

    const unsubscribeCategories = onSnapshot(
      collection(db, "users", this.userId, "categories"),
      (snapshot: any) => {
        const categories = snapshot.docs.map((doc: any) => {
          const data = doc.data();
          return { id: data.id, name: data.name } as Category;
        });
        onCategoriesChange(categories);
      }
    );

    const unsubscribeHabits = onSnapshot(
      collection(db, "users", this.userId, "habits"),
      (snapshot: any) => {
        const habits = snapshot.docs.map((doc: any) => {
          const data = doc.data();
          return {
            id: data.id,
            categoryId: data.categoryId,
            name: data.name,
            reminderTime: data.reminderTime,
          } as Habit;
        });
        onHabitsChange(habits);
      }
    );

    const unsubscribeHabitLogs = onSnapshot(
      collection(db, "users", this.userId, "habitLogs"),
      (snapshot: any) => {
        const habitLogs = snapshot.docs.map((doc: any) => {
          const data = doc.data();
          return {
            id: data.id,
            habitId: data.habitId,
            timestamp: data.timestamp,
            note: data.note,
          } as HabitLog;
        });
        onHabitLogsChange(habitLogs);
      }
    );

    const unsubscribeAll = () => {
      unsubscribeCategories();
      unsubscribeHabits();
      unsubscribeHabitLogs();
    };

    this.listeners.push(unsubscribeAll);
    return unsubscribeAll;
  }

  /**
   * 完整同步（上传本地数据到云端）
   */
  async fullSyncUp(data: {
    categories: Category[];
    habits: Habit[];
    habitLogs: HabitLog[];
  }): Promise<void> {
    if (!this.isOnline) {
      throw new Error("网络离线，无法同步");
    }

    await this.syncCategories(data.categories);
    await this.syncHabits(data.habits);
    await this.syncHabitLogs(data.habitLogs);
  }

  /**
   * 完整同步（从云端下载数据）
   */
  async fullSyncDown(): Promise<{
    categories: Category[];
    habits: Habit[];
    habitLogs: HabitLog[];
  }> {
    if (!this.isOnline) {
      throw new Error("网络离线，无法同步");
    }

    const [categories, habits, habitLogs] = await Promise.all([
      this.downloadCategories(),
      this.downloadHabits(),
      this.downloadHabitLogs(),
    ]);

    return { categories, habits, habitLogs };
  }

  /**
   * 清理所有监听器
   */
  cleanup(): void {
    this.listeners.forEach((unsubscribe) => unsubscribe());
    this.listeners = [];
    window.removeEventListener("online", this.handleOnline);
    window.removeEventListener("offline", this.handleOffline);
  }
}

// 导出单例实例
export const syncService = new SyncService();
