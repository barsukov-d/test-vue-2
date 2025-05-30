import Vue from "vue";
import Vuex from "vuex";
import App from "./App.vue";
import router from "./router";
import store from "./store";

Vue.use(Vuex);

Vue.config.productionTip = false;

// Инициализация авторизации при запуске приложения
async function initializeApp() {
  try {
    // Проверяем сохраненную авторизацию
    await store.dispatch("auth/initializeAuth");
  } catch (error) {
    console.error("Failed to initialize auth:", error);
  }

  // Создаем экземпляр Vue
  new Vue({
    router,
    store,
    render: (h) => h(App),
  }).$mount("#app");
}

// Запускаем приложение
initializeApp();
