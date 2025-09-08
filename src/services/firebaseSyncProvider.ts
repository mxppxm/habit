import { Category, Habit, HabitLog } from "../types";
import { SyncProvider, SyncProviderCallbacks } from "./syncProvider";
import { syncService } from "./syncService";

export class FirebaseSyncProvider implements SyncProvider {
  private namespaceUserId: string | null = null;

  setUserId = (userId: string) => {
    this.namespaceUserId = userId;
    syncService.setUserId(userId);
  };

  // Firebase provider 不需要登录，返回占位信息
  login = async (email: string, _password: string) => {
    return { userId: this.namespaceUserId || "", email };
  };

  logout = async () => {
    // no-op for Firebase namespace mode
  };

  isNetworkOnline = () => syncService.isNetworkOnline();

  fullSyncUp = async (data: {
    categories: Category[];
    habits: Habit[];
    habitLogs: HabitLog[];
  }) => {
    await syncService.fullSyncUp(data);
  };

  fullSyncDown = async () => {
    return syncService.fullSyncDown();
  };

  subscribeToChanges = ({
    onCategoriesChange,
    onHabitsChange,
    onHabitLogsChange,
  }: SyncProviderCallbacks) => {
    return syncService.subscribeToChanges(
      onCategoriesChange,
      onHabitsChange,
      onHabitLogsChange
    );
  };

  cleanup = () => {
    syncService.cleanup();
  };

  clearRemoteData = async () => {
    // Firebase 模式下，等价为将空数据全量上传（删除云端多余项）
    await this.fullSyncUp({ categories: [], habits: [], habitLogs: [] });
  };
}

export const firebaseSyncProvider = new FirebaseSyncProvider();
