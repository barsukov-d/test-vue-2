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
  async initializeAuth({ commit, dispatch, state }) {
    commit("SET_LOADING", true);

    try {
      // Инициализируем токен из sessionStorage
      authService.initializeAuth();

      // Проверяем, есть ли валидный токен
      if (authService.isAuthenticated()) {
        try {
          await authService.validateToken();
          // Поскольку validateToken больше не возвращает user данные,
          // устанавливаем состояние авторизации с существующими данными пользователя
          commit("SET_AUTH_DATA", {
            user: state.user, // Сохраняем существующие данные пользователя
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
      // authService уже показывает уведомления, поэтому здесь их не дублируем
      const authData = await authService.login(credentials);

      commit("SET_AUTH_DATA", {
        user: authData.user,
        token: authData.token,
      });

      return authData;
    } catch (error) {
      const errorMessage = error.message || "Ошибка авторизации";
      commit("SET_ERROR", errorMessage);
      // Уведомление об ошибке уже показано в authService
      throw new Error(errorMessage);
    } finally {
      commit("SET_LOADING", false);
    }
  },

  async logout({ commit }) {
    commit("SET_LOADING", true);

    try {
      // authService уже показывает уведомления, поэтому здесь их не дублируем
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
      // Уведомление об ошибке уже показано в authService
    } finally {
      commit("CLEAR_AUTH_DATA");
      commit("SET_LOADING", false);
    }
  },

  async validateToken({ commit, dispatch, state }) {
    try {
      if (!authService.isAuthenticated()) {
        throw new Error("No token found");
      }

      await authService.validateToken();
      // Поскольку validateToken больше не возвращает user данные,
      // сохраняем существующие данные пользователя
      commit("SET_AUTH_DATA", {
        user: state.user, // Сохраняем существующие данные пользователя
        token: authService.getToken(),
      });

      return true;
    } catch (error) {
      console.error("Token validation failed:", error);
      await dispatch("logout");
      return false;
    }
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
