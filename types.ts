export enum Page {
  DASHBOARD = 'DASHBOARD',
  ANALYZER = 'ANALYZER',
  QA = 'QA',
  CHAT = 'CHAT',
  DRAFTING = 'DRAFTING'
}

export interface QAItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface CaseAnalysis {
  summary: string;
  facts: string[];
  issues: string[];
  ruling: string;
  reasoning: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}