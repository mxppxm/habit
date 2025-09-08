import { Category, Habit, HabitLog } from "../types";

export interface SyncProviderCallbacks {
  onCategoriesChange: (categories: Category[]) => void;
  onHabitsChange: (habits: Habit[]) => void;
  onHabitLogsChange: (habitLogs: HabitLog[]) => void;
}

export interface SyncProvider {
  // Optional for providers that require logical namespace (e.g., Firebase)
  setUserId?: (userId: string) => void;

  // Authentication lifecycle (no-op for providers that do not require auth)
  login: (
    email: string,
    password: string
  ) => Promise<{ userId: string; email: string }>;
  register?: (
    email: string,
    password: string
  ) => Promise<{ userId: string; email: string }>;
  logout: () => Promise<void>;

  // Connectivity
  isNetworkOnline: () => boolean;

  // Full sync up/down
  fullSyncUp: (data: {
    categories: Category[];
    habits: Habit[];
    habitLogs: HabitLog[];
  }) => Promise<void>;

  fullSyncDown: () => Promise<{
    categories: Category[];
    habits: Habit[];
    habitLogs: HabitLog[];
  }>;

  // Realtime subscription
  subscribeToChanges: (callbacks: SyncProviderCallbacks) => () => void;

  // Cleanup resources
  cleanup: () => void;

  // Clear all remote data that belongs to current namespace/account
  clearRemoteData: () => Promise<void>;

  // Optional: get current authenticated user info if provider supports it
  getCurrentUser?: () => { userId: string; email: string } | null;

  // Optional: delta sync (preferred for performance)
  deltaSync?: (delta: {
    upserts: {
      categories: Category[];
      habits: Habit[];
      habitLogs: HabitLog[];
    };
    deletes: {
      categories: string[]; // ids
      habits: string[];
      habitLogs: string[];
    };
  }) => Promise<void>;

  // One-off maintenance: ensure 'id' exists, remove duplicates by id (keep latest)
  repairCloudData?: () => Promise<void>;
}
