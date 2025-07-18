import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});
console.log(process.env.NEXT_PUBLIC_BASE_URL +">>>>>>>><<<<<<<<<<<<<<<<<<")
// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwtToken');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    console.log('Request:',  config.data);
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response:', response.status, response.config.url, response.data);
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 401:
          if (typeof window !== 'undefined') {
            localStorage.removeItem('jwtToken');
            window.location.href = '/auth/signin';
          }
          break;
        case 403:
          console.error('Access forbidden');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error(`HTTP error ${status}:`, data);
      }
    } else if (error.request) {
      console.error('Network error - no response received');
    } else {
      console.error('Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
