import { AuthEndpoints } from '@/utilis/enums/endpoints';
import apiClient from '@/utilis/apiClient';
import { loginFormValuesType } from '@/components/LoginForm/LoginForm';
import { User } from '@/types';
import axios, { AxiosInstance } from 'axios';

class AuthService {
  private apiService: AxiosInstance;
  constructor() {
    this.apiService = apiClient;
  }

  async login(data: loginFormValuesType): Promise<{
    data: {
      accessToken: string;
    };
    message: string;
  }> {
    return await this.apiService.post(AuthEndpoints.LOGIN, data);
  }

  async getUserProfile(token: string): Promise<User> {
    const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}${AuthEndpoints.PROFILE}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return data;
  }
}

export default AuthService;
