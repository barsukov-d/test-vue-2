import axios from "axios";
import { API_BASE_URL } from "@/config/constants";

// Создаем экземпляр axios с базовой конфигурацией
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 секунд
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Interceptor для добавления токена авторизации к запросам
apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor для обработки ответов и ошибок
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Обработка ошибки 401 (неавторизован)
    if (error.response?.status === 401) {
      sessionStorage.removeItem("auth_token");

      // Перенаправляем на страницу логина только если мы не на ней
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    // Обработка других ошибок
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Произошла ошибка при выполнении запроса";

    console.error("API Error:", {
      status: error.response?.status,
      message: errorMessage,
      url: error.config?.url,
      method: error.config?.method,
    });

    return Promise.reject({
      ...error,
      message: errorMessage,
    });
  }
);

export default apiClient;
