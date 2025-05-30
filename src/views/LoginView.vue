<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1 class="login-title">Template Manager</h1>
          <p class="login-subtitle">Войдите в систему для продолжения</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <BaseInput
              v-model="form.email"
              type="email"
              label="Email"
              placeholder="Введите ваш email"
              :error="errors.email"
              :disabled="isLoading"
              autofocus
              required
            />
          </div>

          <div class="form-group">
            <BaseInput
              v-model="form.password"
              type="password"
              label="Пароль"
              placeholder="Введите пароль"
              :error="errors.password"
              :disabled="isLoading"
              required
            />
          </div>

          <!-- Общая ошибка -->
          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <!-- Успешное сообщение -->
          <div v-if="successMessage" class="success-message">
            {{ successMessage }}
          </div>

          <BaseButton
            type="submit"
            variant="primary"
            size="large"
            :loading="isLoading"
            :disabled="!isFormValid"
            full-width
          >
            Войти
          </BaseButton>

          <!-- Демо данные -->
          <div class="demo-credentials">
            <h4>Демо-данные для входа:</h4>
            <p><strong>Email:</strong> hello@aiscreen.io</p>
            <p><strong>Пароль:</strong> Demo!1234</p>
            <BaseButton
              type="button"
              variant="outline-secondary"
              size="small"
              @click="fillDemoCredentials"
              :disabled="isLoading"
            >
              Заполнить демо-данными
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { validateLoginForm } from "@/utils/validation";
import BaseInput from "@/components/ui/BaseInput.vue";
import BaseButton from "@/components/ui/BaseButton.vue";

export default {
  name: "LoginView",

  components: {
    BaseInput,
    BaseButton,
  },

  data() {
    return {
      form: {
        email: "",
        password: "",
      },
      errors: {
        email: "",
        password: "",
      },
      error: "",
      successMessage: "",
    };
  },

  computed: {
    ...mapGetters("auth", ["isLoading"]),

    isFormValid() {
      const validation = validateLoginForm(this.form);
      return validation.isValid && this.form.email && this.form.password;
    },
  },

  mounted() {
    // Автофокус на поле email
    this.$nextTick(() => {
      const emailInput = this.$el.querySelector('input[type="email"]');
      if (emailInput) {
        emailInput.focus();
      }
    });
  },

  methods: {
    ...mapActions("auth", ["login"]),

    validateField(fieldName) {
      const validation = validateLoginForm(this.form);
      this.errors[fieldName] = validation.errors[fieldName] || "";
    },

    validateForm() {
      const validation = validateLoginForm(this.form);
      this.errors = { ...validation.errors };
      return validation.isValid;
    },

    async handleLogin() {
      this.error = "";
      this.successMessage = "";

      // Валидация формы
      if (!this.validateForm()) {
        return;
      }

      try {
        await this.login({
          email: this.form.email.trim(),
          password: this.form.password,
        });

        this.successMessage = "Авторизация прошла успешно!";

        // Небольшая задержка для отображения сообщения об успехе
        setTimeout(() => {
          // Navigation guard сам перенаправит нас на нужную страницу
          this.$router.push("/");
        }, 500);
      } catch (error) {
        this.error = error.message || "Ошибка авторизации";
        console.error("Login error:", error);
      }
    },

    // Метод для быстрого заполнения демо-данными
    fillDemoCredentials() {
      this.form.email = "hello@aiscreen.io";
      this.form.password = "Demo!1234";
      this.errors = { email: "", password: "" };
    },
  },
};
</script>

<style lang="scss" scoped>
@use "@/styles/variables" as *;

.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, $primary-light 0%, $primary-color 100%);
  padding: 1rem;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-card {
  background: $white;
  border-radius: $border-radius-lg;
  box-shadow: $box-shadow-lg;
  overflow: hidden;
}

.login-header {
  background: $white;
  padding: 2rem 2rem 1rem;
  text-align: center;
}

.login-title {
  font-size: 2rem;
  font-weight: 700;
  color: $primary-color;
  margin: 0 0 0.5rem;
}

.login-subtitle {
  color: $text-secondary;
  margin: 0;
  font-size: 1rem;
}

.login-form {
  padding: 1rem 2rem 2rem;

  .login-submit {
    margin-top: 1rem;
  }
}

.login-error {
  background-color: rgba($danger-color, 0.1);
  border: 1px solid rgba($danger-color, 0.2);
  color: $danger-color;
  padding: 0.75rem;
  border-radius: $border-radius;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  text-align: center;
}

.login-footer {
  background: $bg-secondary;
  padding: 1.5rem 2rem;
  border-top: 1px solid $border-color;
}

.error-message {
  background-color: rgba($danger-color, 0.1);
  border: 1px solid rgba($danger-color, 0.2);
  color: $danger-color;
  padding: 0.75rem;
  border-radius: $border-radius;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  text-align: center;
}

.success-message {
  background-color: rgba($success-color, 0.1);
  border: 1px solid rgba($success-color, 0.2);
  color: $success-dark;
  padding: 0.75rem;
  border-radius: $border-radius;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  text-align: center;
}

.demo-credentials {
  text-align: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid $border-color;

  h4 {
    margin: 0 0 1rem;
    font-size: 0.875rem;
    color: $text-secondary;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  p {
    margin: 0.25rem 0;
    font-size: 0.875rem;
    color: $text-primary;

    strong {
      color: $primary-color;
    }
  }

  button {
    margin-top: 1rem;
  }
}

// Адаптивность
@media (max-width: 480px) {
  .login-page {
    padding: 0.5rem;
  }

  .login-header {
    padding: 1.5rem 1.5rem 1rem;
  }

  .login-form {
    padding: 1rem 1.5rem 1.5rem;
  }

  .login-footer {
    padding: 1.5rem;
  }

  .login-title {
    font-size: 1.75rem;
  }
}

// Анимации
.login-card {
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
