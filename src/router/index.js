import Vue from "vue";
import VueRouter from "vue-router";
import store from "@/store";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("@/views/HomeView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/LoginView.vue"),
    meta: { guest: true },
  },
  {
    path: "/template/new",
    name: "template-create",
    component: () => import("@/views/TemplateView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/template/:id",
    name: "template-edit",
    component: () => import("@/views/TemplateView.vue"),
    meta: { requiresAuth: true },
    props: true,
  },
  {
    path: "/template/:id/view",
    name: "template-view",
    component: () => import("@/views/TemplateView.vue"),
    meta: { requiresAuth: true },
    props: (route) => ({ ...route.params, readonly: true }),
  },
  {
    path: "*",
    redirect: "/",
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const isGuestRoute = to.matched.some((record) => record.meta.guest);
  const isAuthenticated = store.getters["auth/isAuthenticated"];

  // Проверяем валидность токена при необходимости
  if (store.getters["auth/token"] && !isAuthenticated) {
    try {
      await store.dispatch("auth/validateToken");
    } catch (error) {
      console.error("Token validation failed:", error);
      // Токен невалидный, очищаем состояние
      await store.dispatch("auth/logout");
    }
  }

  // Получаем обновленное состояние авторизации
  const currentlyAuthenticated = store.getters["auth/isAuthenticated"];

  if (requiresAuth && !currentlyAuthenticated) {
    // Перенаправляем на логин если нужна авторизация
    next({
      name: "login",
      query: { redirect: to.fullPath },
    });
  } else if (isGuestRoute && currentlyAuthenticated) {
    // Перенаправляем авторизованных пользователей с гостевых страниц
    const redirectPath = to.query.redirect || "/";
    next(redirectPath);
  } else {
    next();
  }
});

export default router;
