
export interface DailyLogEntry {
  id: string;
  type: 'good' | 'bad';
  text: string;
  timestamp: number;
}

export interface Habit {
  id: string;
  name: string;
  color: string;
  completions: string[]; // ISO Date strings YYYY-MM-DD
}

export interface Manifestation {
  mainGoal: string;
  dailyActions: string[];
}

export interface Message {
  role: 'user' | 'model';
  content: string;
}

export interface DailyInsight {
  quote: string;
  reminder: string;
  date: string;
}
