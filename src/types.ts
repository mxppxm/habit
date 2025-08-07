/**
 * 目标数据结构
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

/**
 * AI 生成的习惯建议数据结构
 */
export interface AIHabitSuggestion {
  name: string;
  description: string;
  difficulty: "简单" | "中等" | "困难";
  frequency: string;
  tips: string;
}

/**
 * AI 习惯生成响应数据结构
 */
export interface AIHabitsResponse {
  habits: AIHabitSuggestion[];
}
