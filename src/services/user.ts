import { UserEndpoints } from '@/utilis/enums/endpoints';
import apiClient from '@/utilis/apiClient';

class UserService {
  private apiService;
  constructor() {
    this.apiService = apiClient;
  }

  async create(data) {
    return await this.apiService.post(UserEndpoints.CREATE, data);
  }
}

export default UserService;
