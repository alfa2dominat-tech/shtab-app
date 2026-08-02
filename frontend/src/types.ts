export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  created_at: string;
  task_count?: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  created_at: string;
  members?: User[];
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  due_date: string | null;
  status: 'new' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee_id: string | null;
  assignee?: User;
  author_id: string;
  author?: User;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

export interface UserStats {
  total_closed: number;
  closed_week: number;
  closed_month: number;
  daily_dynamics: {
    date: string;
    count: number;
  }[];
}
