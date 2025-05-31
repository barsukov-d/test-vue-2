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

      // Сохраняем токен в sessionStorage (более безопасно чем localStorage)
      if (response.data.access_token || response.data.token) {
        const token = response.data.access_token || response.data.token;
        this.setToken(token);
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

  // Инициализация токена при загрузке приложения
  initializeAuth() {
    const token = this.getToken();
    if (token) {
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  },

  // Получение токена из sessionStorage
  getToken() {
    return sessionStorage.getItem("auth_token");
  },

  // Проверка авторизации
  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;

    // Дополнительная проверка: токен не должен быть пустым или слишком коротким
    return token.length > 10;
  },

  // Проверка валидности токена и получение данных пользователя
  async validateToken() {
    try {
      // Проверяем наличие токена локально
      const token = this.getToken();
      if (!token) {
        throw new Error("No token found");
      }

      // Возвращаем успешный результат без запроса к API
      // (так как эндпоинт /api/v1/user не существует)
      return {
        user: { email: "user@example.com" }, // Заглушка
        isValid: true,
      };
    } catch (error) {
      console.error("Token validation error:", error);
      this.clearToken();
      throw error;
    }
  },

  // Получение текущего пользователя
  async getCurrentUser() {
    // Возвращаем заглушку пользователя, так как эндпоинт /api/v1/user не существует
    return { email: "user@example.com", name: "Пользователь" };
  },

  // Выход из системы
  async logout() {
    try {
      // Очищаем токен безопасным способом
      this.clearToken();

      // Не делаем запрос к API, так как эндпоинт /api/v1/logout не существует
      return { message: "Успешный выход" };
    } catch (error) {
      console.error("Logout error:", error);
      // Все равно очищаем токен
      this.clearToken();
      throw error;
    }
  },

  // Безопасная установка токена
  setToken(token) {
    if (!token || typeof token !== "string") {
      throw new Error("Invalid token");
    }
    sessionStorage.setItem("auth_token", token);
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  },

  // Безопасная очистка токена
  clearToken() {
    sessionStorage.removeItem("auth_token");
    delete apiClient.defaults.headers.common["Authorization"];
  },
};
