import axios from "axios";

// Создаем экземпляр axios с базовой конфигурацией
const apiClient = axios.create({
  baseURL: "https://dev-api.aiscreen.io", // Реальный API endpoint
  timeout: 10000, // 10 секунд
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Interceptor для добавления токена авторизации к запросам
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
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
      localStorage.removeItem("auth_token");

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
