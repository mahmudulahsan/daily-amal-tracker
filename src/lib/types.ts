export interface IbadahCategory {
  id: string;
  name: string;
  color: string;
}

export interface IbadahItem {
  id: string;
  name: string;
  categoryId: string;
  parentId?: string;
}

export interface TrackerData {
  categories: IbadahCategory[];
  items: IbadahItem[];
  entries: Record<string, Record<string, boolean>>;
}

export interface UserProfile {
  id: string;
  name: string;
  createdAt: string;
}

export interface ExportPayload {
  version: number;
  exportDate: string;
  userName: string;
  data: TrackerData;
}
