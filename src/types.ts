export interface Client {
  id: string;
  userId: string;
  name: string;
  color?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  userId: string;
  clientId: string;
  name: string;
  color?: string;
  status: 'active' | 'completed' | 'on_hold';
  createdAt: string;
  images?: { id: string, dataUrl: string, createdAt: string, description?: string }[];
}

export interface Memo {
  id: string;
  userId: string;
  projectId: string;
  content: string;
  createdAt: string;
  targetDate?: string; // ISO string, when this memo should resurface
  isAcknowledged: boolean; // Once resurfaced, the user can mark it as read
  priority?: 1 | 2 | 3; // 1: High (Red), 2: Medium (Yellow), 3: Low (Green)
}
