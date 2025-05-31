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

  // Сначала получаем текущее состояние аутентификации
  let isAuthenticated = store.getters["auth/isAuthenticated"];

  // Если пользователь не аутентифицирован в store, но возможно есть токен в localStorage
  if (!isAuthenticated) {
    try {
      // Пытаемся инициализировать auth из localStorage
      const authInitialized = await store.dispatch("auth/initializeAuth");
      isAuthenticated = authInitialized;
    } catch (error) {
      console.error("Auth initialization failed in router:", error);
      isAuthenticated = false;
    }
  }

  if (requiresAuth && !isAuthenticated) {
    // Перенаправляем на логин если нужна авторизация
    next({
      name: "login",
      query: { redirect: to.fullPath },
    });
  } else if (isGuestRoute && isAuthenticated) {
    // Перенаправляем авторизованных пользователей с гостевых страниц
    const redirectPath = to.query.redirect || "/";
    next(redirectPath);
  } else {
    next();
  }
});

export default router;
