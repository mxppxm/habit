import { openDB, DBSchema, IDBPDatabase } from 'idb';

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
}

const DB_NAME = 'HabitTrackerDB';
const DB_VERSION = 1;

let db: IDBPDatabase<HabitTrackerDB>;

/**
 * 初始化数据库
 */
export const initDB = async (): Promise<void> => {
  db = await openDB<HabitTrackerDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // 创建 categories 存储
      if (!db.objectStoreNames.contains('categories')) {
        db.createObjectStore('categories', { keyPath: 'id' });
      }
      
      // 创建 habits 存储
      if (!db.objectStoreNames.contains('habits')) {
        db.createObjectStore('habits', { keyPath: 'id' });
      }
      
      // 创建 habitLogs 存储
      if (!db.objectStoreNames.contains('habitLogs')) {
        db.createObjectStore('habitLogs', { keyPath: 'id' });
      }
    },
  });
};

/**
 * 获取所有数据
 * @param storeName 存储名称
 * @returns 数据数组
 */
export const getAllData = async <T>(storeName: 'categories' | 'habits' | 'habitLogs'): Promise<T[]> => {
  if (!db) await initDB();
  return (await db.getAll(storeName)) as T[];
};

/**
 * 添加数据
 * @param storeName 存储名称
 * @param data 要添加的数据
 */
export const addData = async <T extends { id: string }>(
  storeName: 'categories' | 'habits' | 'habitLogs',
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
  storeName: 'categories' | 'habits' | 'habitLogs',
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
  storeName: 'categories' | 'habits' | 'habitLogs',
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
  const transaction = db.transaction(['categories', 'habits', 'habitLogs'], 'readwrite');
  
  await Promise.all([
    transaction.objectStore('categories').clear(),
    transaction.objectStore('habits').clear(),
    transaction.objectStore('habitLogs').clear(),
  ]);
  
  await transaction.done;
};
