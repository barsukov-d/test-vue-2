import apiClient from "./api";
import notificationService from "./notificationService";

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

      const authData = {
        user: response.data.user || response.data,
        token: response.data.access_token || response.data.token,
        message: response.data.message || "Успешная авторизация",
      };

      // Показываем уведомление об успешном входе
      const username = authData.user?.name || authData.user?.email || "";
      notificationService.auth.loginSuccess(username);

      return authData;
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Ошибка авторизации";

      // Показываем уведомление об ошибке входа
      notificationService.auth.loginError(errorMessage);

      throw new Error(errorMessage);
    }
  },

  // Выход из системы (клиентский)
  async logout() {
    try {
      // Очищаем токен локально (без вызова API)
      this.clearToken();

      // Показываем уведомление об успешном выходе
      notificationService.auth.logoutSuccess();

      return { message: "Успешный выход" };
    } catch (error) {
      console.error("Logout error:", error);
      // В любом случае очищаем токен
      this.clearToken();

      const errorMessage = error.message || "Ошибка при выходе из системы";

      // Показываем уведомление об ошибке выхода
      notificationService.auth.logoutError(errorMessage);

      throw new Error(errorMessage);
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

  // Простая валидация токена (только локальная проверка)
  async validateToken() {
    try {
      // Проверяем наличие токена локально
      const token = this.getToken();
      if (!token) {
        throw new Error("No token found");
      }

      // Возвращаем успешную валидацию если токен есть
      // В реальном приложении здесь можно добавить проверку срока действия токена
      return {
        isValid: true,
      };
    } catch (error) {
      console.error("Token validation error:", error);
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
