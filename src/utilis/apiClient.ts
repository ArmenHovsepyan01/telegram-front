import axios from 'axios';
import { getCookie } from 'cookies-next';

const apiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}`,
  timeout: 10000
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getCookie('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // // @ts-ignore
    // config.headers = {
    //   ...config.headers,
    //   'ngrok-skip-browser-warning': 'true',
    //   // optionally override User-Agent too
    //   'User-Agent': 'MyApp/1.0.0'
    // };

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response?.data;
  },
  (error) => {
    const errorResponse = error?.response?.data;
    if (errorResponse) {
      return Promise.reject(errorResponse);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
