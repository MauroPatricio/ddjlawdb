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
  async (error) => {
    if (error.response?.status === 401) {
      // Se não for rota de login, podemos limpar o estado expirado
      if (!error.config?.url?.includes('/auth/login')) {
        localStorage.removeItem('ddjlaw_token');
        localStorage.removeItem('ddjlaw_user');
      }
    }

    let message = error.message || 'Erro de comunicação com o servidor';
    if (error.response?.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        const json = JSON.parse(text);
        if (json?.message) message = json.message;
      } catch {
        // mantém a mensagem padrão
      }
    } else if (error.response?.data?.message) {
      message = error.response.data.message;
    }

    const customError = {
      message,
      status: error.response?.status || 500,
    };
    return Promise.reject(customError);
  }
);

/**
 * Retorna o URL correto para carregar ficheiros estáticos (logos e PDFs anexados)
 * tanto em ambiente local como em produção.
 */
export const getFileUrl = (urlPath) => {
  if (!urlPath) return '';
  if (urlPath.startsWith('http://') || urlPath.startsWith('https://')) {
    return urlPath;
  }

  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl && apiUrl.startsWith('http')) {
    try {
      const parsed = new URL(apiUrl);
      return `${parsed.origin}${urlPath.startsWith('/') ? '' : '/'}${urlPath}`;
    } catch {
      // fallback
    }
  }

  return urlPath;
};

