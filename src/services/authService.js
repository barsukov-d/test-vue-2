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

  // Инициализация токена при загрузке приложения
  initializeAuth() {
    const token = this.getToken();
    if (token) {
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  },
};
