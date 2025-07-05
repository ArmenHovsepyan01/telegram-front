import { UserEndpoints } from '@/utilis/enums/endpoints';
import apiClient from '@/utilis/apiClient';
import { AxiosInstance } from 'axios';

class UserService {
  private apiService: AxiosInstance;
  endpoint: UserEndpoints;

  constructor() {
    this.apiService = apiClient;
    this.endpoint = UserEndpoints.CREATE;
  }

  async create(data) {
    return await this.apiService.post(UserEndpoints.CREATE, data);
  }

  async searchUsers(searchTerm?: string) {
    return await this.apiService.get(UserEndpoints.CREATE, {
      params: searchTerm ? { searchTerm } : {}
    });
  }

  async saveFCMToken(data: { fcmToken: string }) {
    return await this.apiService.post(UserEndpoints.FCM_TOKEN, data);
  }
}

export default UserService;
