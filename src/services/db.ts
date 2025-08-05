import { openDB, DBSchema, IDBPDatabase } from "idb";

// 定义数据库 Schema
interface HabitTrackerDB extends DBSchema {
  categories: {
    key: string;
    value: {
      id: string;
      name: string;
    };
  };
  habits: {
    key: string;
    value: {
      id: string;
      categoryId: string;
      name: string;
      reminderTime: string;
    };
  };
  habitLogs: {
    key: string;
    value: {
      id: string;
      habitId: string;
      timestamp: number;
      note: string;
    };
  };
  quotes: {
    key: string;
    value: {
      id: string;
      text: string;
      author: string;
      category: string;
      translation?: string;
      fetchDate: string; // YYYY-MM-DD 格式
    };
  };
}

const DB_NAME = "HabitTrackerDB";
const DB_VERSION = 2;

let db: IDBPDatabase<HabitTrackerDB>;

/**
 * 初始化数据库
 */
export const initDB = async (): Promise<void> => {
  db = await openDB<HabitTrackerDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // 创建 categories 存储
      if (!db.objectStoreNames.contains("categories")) {
        db.createObjectStore("categories", { keyPath: "id" });
      }

      // 创建 habits 存储
      if (!db.objectStoreNames.contains("habits")) {
        db.createObjectStore("habits", { keyPath: "id" });
      }

      // 创建 habitLogs 存储
      if (!db.objectStoreNames.contains("habitLogs")) {
        db.createObjectStore("habitLogs", { keyPath: "id" });
      }

      // 创建 quotes 存储
      if (!db.objectStoreNames.contains("quotes")) {
        db.createObjectStore("quotes", { keyPath: "id" });
      }
    },
  });
};

/**
 * 获取所有数据
 * @param storeName 存储名称
 * @returns 数据数组
 */
export const getAllData = async <T>(
  storeName: "categories" | "habits" | "habitLogs" | "quotes"
): Promise<T[]> => {
  if (!db) await initDB();
  return (await db.getAll(storeName)) as T[];
};

/**
 * 添加数据
 * @param storeName 存储名称
 * @param data 要添加的数据
 */
export const addData = async <T extends { id: string }>(
  storeName: "categories" | "habits" | "habitLogs" | "quotes",
  data: T
): Promise<void> => {
  if (!db) await initDB();
  await db.add(storeName, data as any);
};

/**
 * 更新数据
 * @param storeName 存储名称
 * @param data 要更新的数据
 */
export const putData = async <T extends { id: string }>(
  storeName: "categories" | "habits" | "habitLogs" | "quotes",
  data: T
): Promise<void> => {
  if (!db) await initDB();
  await db.put(storeName, data as any);
};

/**
 * 删除数据
 * @param storeName 存储名称
 * @param id 要删除的数据 ID
 */
export const deleteData = async (
  storeName: "categories" | "habits" | "habitLogs" | "quotes",
  id: string
): Promise<void> => {
  if (!db) await initDB();
  await db.delete(storeName, id);
};

/**
 * 清空所有数据
 */
export const clearAllData = async (): Promise<void> => {
  if (!db) await initDB();
  const transaction = db.transaction(
    ["categories", "habits", "habitLogs", "quotes"],
    "readwrite"
  );

  // 清空用户数据
  await Promise.all([
    transaction.objectStore("categories").clear(),
    transaction.objectStore("habits").clear(),
    transaction.objectStore("habitLogs").clear(),
  ]);

  // 只清空API获取的名言，保留本地名言
  const quotesStore = transaction.objectStore("quotes");
  const allQuotes = await quotesStore.getAll();

  for (const quote of allQuotes) {
    if (quote.fetchDate !== "local") {
      await quotesStore.delete(quote.id);
    }
  }

  await transaction.done;
};

/**
 * 清空所有名言数据（包括本地名言）
 */
export const clearAllQuotes = async (): Promise<void> => {
  if (!db) await initDB();
  const transaction = db.transaction(["quotes"], "readwrite");
  await transaction.objectStore("quotes").clear();
  await transaction.done;
};
