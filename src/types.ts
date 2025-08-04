/**
 * 分类数据结构
 */
export interface Category {
  id: string;
  name: string;
}

/**
 * 习惯项目数据结构
 */
export interface Habit {
  id: string;
  categoryId: string;
  name: string;
  reminderTime?: string; // HH:mm 格式，可选
}

/**
 * 习惯打卡记录数据结构
 */
export interface HabitLog {
  id: string;
  habitId: string;
  timestamp: number;
  note: string;
}
