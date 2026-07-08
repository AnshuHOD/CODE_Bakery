// axios.js — Preconfigured Axios instance
// Base URL set hai, aur har request ke saath Authorization header
// automatically JWT token ke saath bheja jaata hai (localStorage se).

import axios from 'axios';

const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bakery_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('bakery_admin_token');
      // Redirect to login page if we get a 401 Unauthorized
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
