import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// Interceptor para injetar o Token JWT em cada pedido
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ddjlaw_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para capturar erros e respostas
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Se não for rota de login, podemos limpar o estado expirado
      if (!error.config.url.includes('/auth/login')) {
        localStorage.removeItem('ddjlaw_token');
        localStorage.removeItem('ddjlaw_user');
      }
    }
    const customError = {
      message: error.response?.data?.message || error.message || 'Erro de comunicação com o servidor',
      status: error.response?.status || 500,
    };
    return Promise.reject(customError);
  }
);
