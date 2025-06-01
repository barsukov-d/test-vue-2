import Vue from "vue";
import Vuex from "vuex";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./plugins/vee-validate";

// Подключение сервиса уведомлений
import notificationService from "./services/notificationService";

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
  const app = new Vue({
    router,
    store,
    render: (h) => h(App),
  }).$mount("#app");

  // Инициализируем сервис уведомлений с экземпляром Vue
  notificationService.init(app);

  // Делаем сервис доступным глобально для удобства
  Vue.prototype.$notify = notificationService;

  return app;
}

// Запускаем приложение
initializeApp();
