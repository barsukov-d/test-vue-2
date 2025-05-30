import apiClient from "./api";

export const authService = {
  // Авторизация пользователя
  async login(credentials) {
    try {
      const response = await apiClient.post("/api/v1/login", {
        email: credentials.email,
        password: credentials.password,
        remember_me: "1",
      });

      // Сохраняем токен в localStorage
      if (response.data.access_token || response.data.token) {
        const token = response.data.access_token || response.data.token;
        localStorage.setItem("auth_token", token);

        // Устанавливаем токен в заголовки для будущих запросов
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }

      return {
        user: response.data.user || response.data,
        token: response.data.access_token || response.data.token,
        message: response.data.message || "Успешная авторизация",
      };
    } catch (error) {
      console.error("Login error:", error);
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Ошибка авторизации"
      );
    }
  },

  // Выход из системы
  async logout() {
    try {
      // Очищаем токен из localStorage и заголовков без отправки запроса на сервер
      localStorage.removeItem("auth_token");
      delete apiClient.defaults.headers.common["Authorization"];
    } catch (error) {
      console.error("Logout error:", error);
      // Продолжаем выход даже если запрос неудачен
    }
  },

  // Проверка валидности токена и получение данных пользователя
  async validateToken() {
    try {
      // Проверяем наличие токена локально, так как эндпоинт /api/v1/user не существует
      const token = this.getToken();
      if (!token) {
        throw new Error("No token found");
      }

      // Возвращаем успешный результат без запроса к API
      return {
        user: { email: "user@example.com" }, // Заглушка
        isValid: true,
      };
    } catch (error) {
      console.error("Token validation error:", error);
      localStorage.removeItem("auth_token");
      delete apiClient.defaults.headers.common["Authorization"];
      throw error;
    }
  },

  // Получение текущего пользователя
  async getCurrentUser() {
    // Возвращаем заглушку пользователя, так как эндпоинт /api/v1/user не существует
    return { email: "user@example.com", name: "Пользователь" };
  },

  // Проверка авторизации
  isAuthenticated() {
    const token = localStorage.getItem("auth_token");
    if (token) {
      // Устанавливаем токен в заголовки при загрузке приложения
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      return true;
    }
    return false;
  },

  // Получение токена
  getToken() {
    return localStorage.getItem("auth_token");
  },

  // Инициализация токена при загрузке приложения
  initializeAuth() {
    const token = this.getToken();
    if (token) {
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  },
};
