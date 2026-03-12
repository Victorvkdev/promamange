export interface Income {
  id: string;
  date: string;
  value: number;
  description: string;
  source: string;
}

export interface UserStats {
  name: string;
  xp: number;
  level: number;
  rank: string;
  proCoins: number;
  streakDays: number;
  lastLoginDate: string | null;
  shieldActive: boolean;
  optimizationMode: boolean;
  language: 'pt' | 'en' | 'es';
}

export interface Expense {
  id: string;
  date: string;
  value: number;
  description: string;
  category: string;
  account: string;
  status: 'pending' | 'paid';
}

export interface MajorGoal {
  id: string;
  title: string;
  totalSteps: number;
  completedSteps: number;
  dueDate: string;
  stepValue: number;
  totalValue: number;
  paidValue: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'project' | 'tax' | 'goal' | 'planner';
  status: 'active' | 'completed' | 'failed';
  dueDate: string;
  rewardXp: number;
  rewardCoins: number;
  progress?: number;
  target?: number;
  priority: 'low' | 'medium' | 'high';
  favorite: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
}

