import { CallStatus } from '@/utilis/enums';

export type User = {
  id: number;
  name: string;
  lastName: string;
  email: string;
  nickname: string;
};

export interface Call {
  caller_id: number;
  startedAt: Date;
  endedAt: Date;
  status: CallStatus;
}

export interface ChatMessage extends Call {
  id: string;
  message: string;
  userId: number;
  chatId: string;
  created_at: Date;
  updated_at: Date;
  type: 'message' | 'call';
  role: 'user' | 'assistant';
  inProgress?: boolean;
}

export interface Chat {
  id: string;
  isPrivate?: boolean;
  created_at?: Date;
}

export interface ChatResponse {
  id: string;
  users: User[];
}

export interface ChatWithMessages extends Chat {
  messages: ChatMessage[];
  users: User[];
}
