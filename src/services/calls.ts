import { AxiosInstance } from 'axios';
import { CallEndpoints } from '@/utilis/enums/endpoints';
import apiClient from '@/utilis/apiClient';

class CallService {
  private apiService: AxiosInstance;
  endpoint: CallEndpoints;

  constructor() {
    this.apiService = apiClient;
    this.endpoint = CallEndpoints.GET_CALL;
  }

  async getCallTranscription(callId: string): Promise<{ url: string }> {
    return await this.apiService.get(`${this.endpoint}/${callId}/transcript-pdf`);
  }
}

export default CallService;
