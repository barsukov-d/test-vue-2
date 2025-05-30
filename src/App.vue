<template>
  <div id="app">
    <!-- Header с навигацией -->
    <header class="app-header" v-if="!isLoginPage">
      <div class="container">
        <div class="header-content">
          <div class="logo">
            <router-link to="/" class="logo-link">
              <h2>Template Manager</h2>
            </router-link>
          </div>

          <nav class="main-nav" v-if="isLoggedIn">
            <router-link to="/" class="nav-link">
              <span>Шаблоны</span>
            </router-link>
            <router-link to="/template/new" class="nav-link nav-link--primary">
              <span>+ Создать</span>
            </router-link>
          </nav>

          <div class="user-menu" v-if="isLoggedIn">
            <div class="user-info">
              <span v-if="userInfo">{{
                userInfo.email || "Пользователь"
              }}</span>
            </div>
            <button @click="handleLogout" class="logout-btn">Выйти</button>
          </div>
        </div>
      </div>
    </header>

    <!-- Основной контент -->
    <main class="app-main" :class="{ 'app-main--no-header': isLoginPage }">
      <router-view />
    </main>

    <!-- Индикатор загрузки -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>

    <!-- Контейнер уведомлений -->
    <ToastContainer />
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import ToastContainer from "@/components/ui/ToastContainer.vue";

export default {
  name: "App",

  components: {
    ToastContainer,
  },

  computed: {
    ...mapGetters("auth", ["isLoggedIn", "userInfo", "isLoading"]),

    isLoginPage() {
      return this.$route.name === "login";
    },
  },

  async mounted() {
    // Проверяем токен при загрузке приложения
    if (
      this.$store.state.auth.token &&
      !this.$store.state.auth.isAuthenticated
    ) {
      try {
        await this.validateToken();
        if (this.$store.state.auth.isAuthenticated) {
          await this.getCurrentUser();
        }
      } catch (error) {
        console.error("Token validation failed:", error);
      }
    }
  },

  methods: {
    ...mapActions("auth", ["logout", "validateToken", "getCurrentUser"]),

    async handleLogout() {
      try {
        await this.logout();
        this.$router.push("/login");
      } catch (error) {
        console.error("Logout failed:", error);
      }
    },
  },
};
</script>

<style lang="scss">
@use "@/styles/variables" as *;

// Global styles
body {
  margin: 0;
  font-family: $font-family-base;
  background-color: $bg-primary;
  color: $text-primary;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

// Main app layout
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

// Контейнер
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;

  @media (min-width: 1200px) {
    padding: 0 2rem;
  }
}

// Header
.app-header {
  background: $white;
  border-bottom: 1px solid $border-color;
  box-shadow: $box-shadow-sm;
  position: sticky;
  top: 0;
  z-index: $zindex-sticky;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
}

.logo {
  h2 {
    color: $primary-color;
    font-weight: $font-weight-bold;
    margin: 0;
  }
}

.logo-link {
  text-decoration: none;

  &:hover h2 {
    color: $primary-dark;
  }
}

// Навигация
.main-nav {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.nav-link {
  padding: 0.5rem 1rem;
  border-radius: $border-radius;
  text-decoration: none;
  color: $text-primary;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background-color: $bg-secondary;
  }

  &.router-link-active {
    background-color: $primary-color;
    color: $white;
  }

  &--primary {
    background-color: $primary-color;
    color: $white;

    &:hover {
      background-color: $primary-dark;
    }
  }
}

// Пользовательское меню
.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  font-size: 0.9rem;
  color: $text-secondary;
}

.logout-btn {
  padding: 0.5rem 1rem;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  background: $white;
  color: $text-primary;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: $danger-color;
    color: $danger-color;
  }
}

// Основной контент
.app-main {
  flex: 1;
  padding: 2rem 0;

  &--no-header {
    padding: 0;
  }
}

// Индикатор загрузки
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: $zindex-modal;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid $border-color;
  border-left-color: $primary-color;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

// Адаптивность
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .main-nav {
    order: 1;
  }

  .user-menu {
    order: 2;
  }
}
</style>
