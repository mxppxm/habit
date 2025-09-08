import AV from "leancloud-storage";
import { Category, Habit, HabitLog } from "../types";
import { SyncProvider, SyncProviderCallbacks } from "./syncProvider";

const appId = import.meta.env.VITE_LEANCLOUD_APP_ID || "";
const appKey = import.meta.env.VITE_LEANCLOUD_APP_KEY || "";
const serverURL = import.meta.env.VITE_LEANCLOUD_SERVER_URL || "";

let initialized = false;

function ensureInit() {
  if (!initialized) {
    AV.init({ appId, appKey, serverURL });
    initialized = true;
  }
}

function mapAVToCategory(obj: AV.Object): Category {
  return {
    id: obj.get("id"),
    name: obj.get("name"),
  } as Category;
}

function mapAVToHabit(obj: AV.Object): Habit {
  return {
    id: obj.get("id"),
    categoryId: obj.get("categoryId"),
    name: obj.get("name"),
    reminderTime: obj.get("reminderTime") || undefined,
  } as Habit;
}

function mapAVToHabitLog(obj: AV.Object): HabitLog {
  const base: HabitLog = {
    id: obj.get("id"),
    habitId: obj.get("habitId"),
    timestamp: obj.get("timestamp"),
    note: obj.get("note") || "",
  };
  const isMakeup = obj.get("isMakeup");
  const originalDate = obj.get("originalDate");
  return {
    ...base,
    ...(typeof isMakeup === "boolean" ? { isMakeup } : {}),
    ...(typeof originalDate === "number" ? { originalDate } : {}),
  } as HabitLog;
}

async function upsertList<T extends { id: string }>(
  className: string,
  list: T[]
): Promise<void> {
  const query = new AV.Query(className);
  query.select(["id"]);
  let existing: AV.Object[] = [];
  try {
    existing = await query.find();
  } catch (_e) {
    existing = [];
  }

  const idToObj = new Map<string, AV.Object>();
  for (const obj of existing) {
    idToObj.set(obj.get("id"), obj);
  }

  const toSave: AV.Object[] = [];
  for (const item of list) {
    const obj = idToObj.get(item.id) || new AV.Object(className);
    if (!idToObj.get(item.id)) obj.set("id", item.id);
    Object.entries(item).forEach(([k, v]) => obj.set(k, v as any));
    obj.set("lastModified", Date.now());
    toSave.push(obj);
    idToObj.delete(item.id);
  }

  if (toSave.length) {
    await AV.Object.saveAll(toSave);
  }

  const extras = Array.from(idToObj.values());
  if (extras.length) {
    await AV.Object.destroyAll(extras);
  }
}

async function downloadAll<T>(
  className: string,
  mapper: (obj: AV.Object) => T
): Promise<T[]> {
  const query = new AV.Query(className);
  try {
    const list = await query.find();
    return list.map(mapper);
  } catch (_e) {
    // 类不存在时返回空数组，避免 404 造成页面报错
    return [] as T[];
  }
}

type LiveHandle = {
  on: (
    event: "create" | "update" | "delete",
    handler: (object: AV.Object) => void
  ) => void;
  unsubscribe: () => void | Promise<void>;
};

export class LeanCloudSyncService implements SyncProvider {
  private liveQueries: LiveHandle[] = [];

  getCurrentUser(): { userId: string; email: string } | null {
    ensureInit();
    const u = AV.User.current();
    if (!u) return null;
    return {
      userId: u.id,
      email: (u.getEmail?.() as string) || (u.getUsername?.() as string) || "",
    };
  }

  login = async (email: string, password: string) => {
    ensureInit();
    const user = await AV.User.loginWithEmail(email, password);
    return { userId: user.id, email: user.getEmail() || email };
  };

  register = async (email: string, password: string) => {
    ensureInit();
    const user = new AV.User();
    user.setUsername(email);
    user.setEmail(email);
    user.setPassword(password);
    const signed = await user.signUp();
    return { userId: signed.id, email };
  };

  logout = async () => {
    ensureInit();
    await AV.User.logOut();
  };

  isNetworkOnline = () => navigator.onLine;

  fullSyncUp = async (data: {
    categories: Category[];
    habits: Habit[];
    habitLogs: HabitLog[];
  }) => {
    ensureInit();
    const current = AV.User.current();
    if (!current) throw new Error("未登录 LeanCloud");
    await upsertList("Category", data.categories);
    await upsertList("Habit", data.habits);
    await upsertList("HabitLog", data.habitLogs);
  };

  deltaSync = async (delta: {
    upserts: { categories: Category[]; habits: Habit[]; habitLogs: HabitLog[] };
    deletes: { categories: string[]; habits: string[]; habitLogs: string[] };
  }) => {
    ensureInit();
    const current = AV.User.current();
    if (!current) throw new Error("未登录 LeanCloud");

    // 批量 upsert：按 id 查询已存在项，然后 saveAll
    const upsertByClass = async (className: string, items: any[]) => {
      if (!items.length) return;
      const ids = items.map((x) => x.id);
      const q = new AV.Query(className);
      q.containedIn("id", ids);
      const existing = await q.find();
      const idToObj = new Map<string, AV.Object>();
      for (const obj of existing) idToObj.set(obj.get("id"), obj);

      const toSave: AV.Object[] = [];
      for (const item of items) {
        const obj = idToObj.get(item.id) || new AV.Object(className);
        if (!idToObj.get(item.id)) obj.set("id", item.id);
        Object.entries(item).forEach(([k, v]) => obj.set(k, v as any));
        obj.set("lastModified", Date.now());
        toSave.push(obj);
      }
      if (toSave.length) await AV.Object.saveAll(toSave);
    };

    await upsertByClass("Category", delta.upserts.categories);
    await upsertByClass("Habit", delta.upserts.habits);
    await upsertByClass("HabitLog", delta.upserts.habitLogs);

    // 批量 deletes
    const destroyByIds = async (className: string, ids: string[]) => {
      if (!ids.length) return;
      const q = new AV.Query(className);
      q.containedIn("id", ids);
      const list = await q.find();
      if (list.length) await AV.Object.destroyAll(list);
    };
    await destroyByIds("Category", delta.deletes.categories);
    await destroyByIds("Habit", delta.deletes.habits);
    await destroyByIds("HabitLog", delta.deletes.habitLogs);
  };

  fullSyncDown = async () => {
    ensureInit();
    const current = AV.User.current();
    if (!current) throw new Error("未登录 LeanCloud");
    const [categories, habits, habitLogs] = await Promise.all([
      downloadAll("Category", mapAVToCategory),
      downloadAll("Habit", mapAVToHabit),
      downloadAll("HabitLog", mapAVToHabitLog),
    ]);
    return { categories, habits, habitLogs };
  };

  subscribeToChanges = ({
    onCategoriesChange,
    onHabitsChange,
    onHabitLogsChange,
  }: SyncProviderCallbacks) => {
    ensureInit();
    const subs: LiveHandle[] = [];

    const createSub = async (
      className: string,
      onChange: (list: any[]) => void
    ) => {
      const query = new AV.Query(className);
      const refetch = async () => {
        try {
          const data = await query.find();
          onChange(data);
        } catch (_e) {
          onChange([]);
        }
      };
      try {
        const live = (await query.subscribe()) as LiveHandle;
        live.on("create", refetch);
        live.on("update", refetch);
        live.on("delete", refetch);
        subs.push(live);
      } catch (_subErr) {
        // 类不存在时订阅可能失败；先不建立订阅，仅做一次空拉取
      }
      await refetch();
    };

    createSub("Category", (list) =>
      onCategoriesChange(list.map(mapAVToCategory))
    );
    createSub("Habit", (list) => onHabitsChange(list.map(mapAVToHabit)));
    createSub("HabitLog", (list) =>
      onHabitLogsChange(list.map(mapAVToHabitLog))
    );

    this.liveQueries = subs;
    return () => {
      subs.forEach((s) => s.unsubscribe());
    };
  };

  cleanup = () => {
    this.liveQueries.forEach((s) => s.unsubscribe());
    this.liveQueries = [];
  };

  clearRemoteData = async () => {
    ensureInit();
    const current = AV.User.current();
    if (!current) throw new Error("未登录 LeanCloud");
    const classes = ["Category", "Habit", "HabitLog"] as const;
    for (const className of classes) {
      const query = new AV.Query(className);
      const list = await query.find();
      await AV.Object.destroyAll(list);
    }
  };

  // 维护任务：为没有 id 的历史对象补齐 id，并去除重复（保留最新 lastModified）
  repairCloudData = async () => {
    ensureInit();
    const current = AV.User.current();
    if (!current) throw new Error("未登录 LeanCloud");
    const classes = ["Category", "Habit", "HabitLog"] as const;
    for (const className of classes) {
      const all = await new AV.Query(className).find();
      const withId: AV.Object[] = [];
      const withoutId: AV.Object[] = [];
      for (const obj of all) {
        if (obj.get("id")) withId.push(obj);
        else withoutId.push(obj);
      }
      // 为无 id 的对象补 id（用 objectId 兜底）
      for (const obj of withoutId) {
        obj.set("id", obj.id);
        if (!obj.get("lastModified")) obj.set("lastModified", Date.now());
      }
      if (withoutId.length) await AV.Object.saveAll(withoutId);

      // 去重：同 id 只保留 lastModified 最大的那个
      const idToObj: Map<string, AV.Object[]> = new Map();
      for (const obj of withId) {
        const id = obj.get("id");
        const arr = idToObj.get(id) || [];
        arr.push(obj);
        idToObj.set(id, arr);
      }
      const toDelete: AV.Object[] = [];
      idToObj.forEach((arr) => {
        if (arr.length <= 1) return;
        arr.sort(
          (a, b) => (b.get("lastModified") || 0) - (a.get("lastModified") || 0)
        );
        // 保留第一条，其余删除
        for (let i = 1; i < arr.length; i++) toDelete.push(arr[i]);
      });
      if (toDelete.length) await AV.Object.destroyAll(toDelete);
    }
  };
}

export const leanCloudSyncService = new LeanCloudSyncService();
