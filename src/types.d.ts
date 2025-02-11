export type User = {
  id: number;
  name: string;
  lastName: string;
  email: string;
  nickname: string;
};

export interface ChatMessage {
  id: string;
  message: string;
  userId: number;
  chatId: string;
  created_at: Date;
  updated_at: Date;
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
