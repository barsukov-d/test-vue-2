import { authService } from "@/services/authService";

const state = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const getters = {
  user: (state) => state.user,
  token: (state) => state.token,
  isAuthenticated: (state) => state.isAuthenticated,
  isLoggedIn: (state) => state.isAuthenticated,
  isLoading: (state) => state.isLoading,
  error: (state) => state.error,
  userEmail: (state) => state.user?.email,
  userName: (state) =>
    state.user?.name || state.user?.firstName || "Пользователь",
  userInfo: (state) => state.user,
};

const mutations = {
  SET_LOADING(state, loading) {
    state.isLoading = loading;
  },

  SET_ERROR(state, error) {
    state.error = error;
  },

  SET_AUTH_DATA(state, { user, token }) {
    state.user = user;
    state.token = token;
    state.isAuthenticated = true;
    state.error = null;
  },

  CLEAR_AUTH_DATA(state) {
    state.user = null;
    state.token = null;
    state.isAuthenticated = false;
    state.error = null;
  },

  SET_USER(state, user) {
    state.user = user;
  },
};

const actions = {
  async initializeAuth({ commit, dispatch }) {
    commit("SET_LOADING", true);

    try {
      // Инициализируем токен из localStorage
      authService.initializeAuth();

      // Проверяем, есть ли валидный токен
      if (authService.isAuthenticated()) {
        try {
          const userData = await authService.validateToken();
          commit("SET_AUTH_DATA", {
            user: userData.user,
            token: authService.getToken(),
          });
          return true;
        } catch (error) {
          console.error("Token validation failed:", error);
          await dispatch("logout");
          return false;
        }
      } else {
        // Если токена нет, очищаем состояние
        commit("CLEAR_AUTH_DATA");
        return false;
      }
    } catch (error) {
      console.error("Auth initialization failed:", error);
      await dispatch("logout");
      return false;
    } finally {
      commit("SET_LOADING", false);
    }
  },

  async login({ commit }, credentials) {
    commit("SET_LOADING", true);
    commit("SET_ERROR", null);

    try {
      const authData = await authService.login(credentials);

      commit("SET_AUTH_DATA", {
        user: authData.user,
        token: authData.token,
      });

      return authData;
    } catch (error) {
      const errorMessage = error.message || "Ошибка авторизации";
      commit("SET_ERROR", errorMessage);
      throw new Error(errorMessage);
    } finally {
      commit("SET_LOADING", false);
    }
  },

  async logout({ commit }) {
    commit("SET_LOADING", true);

    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      commit("CLEAR_AUTH_DATA");
      commit("SET_LOADING", false);
    }
  },

  async validateToken({ commit, dispatch }) {
    try {
      if (!authService.isAuthenticated()) {
        throw new Error("No token found");
      }

      const userData = await authService.validateToken();
      commit("SET_AUTH_DATA", {
        user: userData.user,
        token: authService.getToken(),
      });

      return true;
    } catch (error) {
      console.error("Token validation failed:", error);
      await dispatch("logout");
      return false;
    }
  },

  async fetchCurrentUser({ commit }) {
    commit("SET_LOADING", true);
    commit("SET_ERROR", null);

    try {
      const user = await authService.getCurrentUser();
      commit("SET_USER", user);
      return user;
    } catch (error) {
      const errorMessage =
        error.message || "Ошибка получения данных пользователя";
      commit("SET_ERROR", errorMessage);
      throw new Error(errorMessage);
    } finally {
      commit("SET_LOADING", false);
    }
  },

  clearError({ commit }) {
    commit("SET_ERROR", null);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
