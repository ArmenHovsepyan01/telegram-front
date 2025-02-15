import { AxiosInstance } from 'axios';
import { ChatEndpoints } from '@/utilis/enums/endpoints';
import apiClient from '@/utilis/apiClient';
import { ChatResponse, ChatWithMessages, ChatMessage } from '@/types';

class ChatService {
  private apiService: AxiosInstance;
  endpoint: ChatEndpoints;

  constructor() {
    this.apiService = apiClient;
    this.endpoint = ChatEndpoints.GET_CHATS;
  }

  async getChats(): Promise<{
    data: ChatResponse[];
    message: string;
  }> {
    return await this.apiService.get(this.endpoint);
  }

  async getChat(id: string): Promise<ChatWithMessages> {
    const data = await this.apiService.get(`${this.endpoint}/${id}`);

    return data.data;
  }

  async sendMessage(chatId: string, message: string): Promise<ChatMessage> {
    const { data } = await this.apiService.post(`${this.endpoint}/${chatId}/sendMessage`, {
      message
    });

    return data;
  }

  async createChat(userMail: string) {
    const data = await this.apiService.post(this.endpoint, {
      userMail
    });

    return data.data;
  }
}

export default ChatService;
