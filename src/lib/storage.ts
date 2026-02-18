import { TrackerData, UserProfile, ExportPayload } from "./types";
import { defaultCategories, defaultItems } from "./defaults";

const USERS_KEY = "ramadan-tracker-users";
const ACTIVE_USER_KEY = "ramadan-tracker-active-user";
const DATA_PREFIX = "ramadan-tracker-data-";
const EXPORT_VERSION = 1;

// ── Default data ──

export function getDefaultData(): TrackerData {
  return {
    categories: defaultCategories.map((c) => ({ ...c })),
    items: defaultItems.map((i) => ({ ...i })),
    entries: {},
  };
}

// ── User management ──

export function getUsers(): UserProfile[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(USERS_KEY);
    if (stored) return JSON.parse(stored) as UserProfile[];
  } catch (e) {
    console.error("Failed to load users:", e);
  }
  return [];
}

function saveUsers(users: UserProfile[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error("Failed to save users:", e);
  }
}

export function getActiveUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_USER_KEY);
}

export function setActiveUserId(userId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACTIVE_USER_KEY, userId);
}

export function getActiveUser(): UserProfile | null {
  const users = getUsers();
  const activeId = getActiveUserId();
  if (!activeId) return users[0] || null;
  return users.find((u) => u.id === activeId) || users[0] || null;
}

export function createUser(name: string): UserProfile {
  const user: UserProfile = {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    createdAt: new Date().toISOString(),
  };
  const users = getUsers();
  users.push(user);
  saveUsers(users);
  setActiveUserId(user.id);
  // Initialize with default data
  saveTrackerData(user.id, getDefaultData());
  return user;
}

export function updateUserName(userId: string, name: string): void {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx !== -1) {
    users[idx].name = name;
    saveUsers(users);
  }
}

export function deleteUser(userId: string): void {
  let users = getUsers();
  users = users.filter((u) => u.id !== userId);
  saveUsers(users);
  // Remove user data
  if (typeof window !== "undefined") {
    localStorage.removeItem(DATA_PREFIX + userId);
  }
  // If active user was deleted, switch to first remaining
  if (getActiveUserId() === userId) {
    if (users.length > 0) {
      setActiveUserId(users[0].id);
    } else {
      localStorage.removeItem(ACTIVE_USER_KEY);
    }
  }
}

// ── Tracker data (user-specific) ──

export function loadTrackerData(userId: string): TrackerData {
  if (typeof window === "undefined") return getDefaultData();

  try {
    const stored = localStorage.getItem(DATA_PREFIX + userId);
    if (stored) {
      const parsed = JSON.parse(stored) as TrackerData;
      if (parsed.categories && parsed.items && parsed.entries) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to load tracker data:", e);
  }

  return getDefaultData();
}

export function saveTrackerData(userId: string, data: TrackerData): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(DATA_PREFIX + userId, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save tracker data:", e);
  }
}

// ── Export / Import ──

export function exportUserData(userId: string, userName: string): string {
  const data = loadTrackerData(userId);
  const payload: ExportPayload = {
    version: EXPORT_VERSION,
    exportDate: new Date().toISOString(),
    userName,
    data,
  };
  return JSON.stringify(payload, null, 2);
}

export function downloadExport(userId: string, userName: string): void {
  const json = exportUserData(userId, userName);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ramadan-tracker-${userName}-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importUserData(
  jsonString: string
): { data: TrackerData; userName: string } | null {
  try {
    const payload = JSON.parse(jsonString);

    // Validate structure
    if (!payload.data) return null;
    const { data } = payload;
    if (!data.categories || !data.items || !data.entries) return null;
    if (!Array.isArray(data.categories) || !Array.isArray(data.items))
      return null;

    return {
      data: data as TrackerData,
      userName: payload.userName || "",
    };
  } catch (e) {
    console.error("Failed to parse import data:", e);
    return null;
  }
}