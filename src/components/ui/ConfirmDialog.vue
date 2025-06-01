<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-dialog" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">{{ title }}</h3>
        <button
          class="modal-close"
          @click="$emit('cancel')"
          aria-label="Закрыть"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <p class="modal-message">{{ message }}</p>
      </div>

      <div class="modal-footer">
        <BaseButton
          variant="secondary"
          @click="$emit('cancel')"
          :disabled="loading"
        >
          {{ cancelText }}
        </BaseButton>
        <BaseButton
          :variant="confirmVariant"
          @click="$emit('confirm')"
          :loading="loading"
          :disabled="loading"
        >
          {{ confirmText }}
        </BaseButton>
      </div>
    </div>

    <!-- Затемнение во время загрузки -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner-large"></div>
    </div>
  </div>
</template>

<script>
import BaseButton from "./BaseButton.vue";

export default {
  name: "ConfirmDialog",

  components: {
    BaseButton,
  },

  props: {
    title: {
      type: String,
      default: "Подтверждение",
    },
    message: {
      type: String,
      required: true,
    },
    confirmText: {
      type: String,
      default: "Подтвердить",
    },
    cancelText: {
      type: String,
      default: "Отмена",
    },
    confirmVariant: {
      type: String,
      default: "danger",
      validator: (value) => ["primary", "secondary", "danger"].includes(value),
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["confirm", "cancel"],

  mounted() {
    // Блокируем прокрутку страницы
    document.body.style.overflow = "hidden";

    // Добавляем обработчик клавиши Escape
    document.addEventListener("keydown", this.handleEscape);
  },

  beforeDestroy() {
    // Восстанавливаем прокрутку страницы
    document.body.style.overflow = "";

    // Удаляем обработчик клавиши Escape
    document.removeEventListener("keydown", this.handleEscape);
  },

  methods: {
    handleOverlayClick() {
      // Не закрываем модальное окно во время загрузки
      if (this.loading) {
        return;
      }
      this.$emit("cancel");
    },

    handleEscape(event) {
      // Не закрываем модальное окно во время загрузки
      if (event.key === "Escape" && !this.loading) {
        this.$emit("cancel");
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@use "@/styles/variables" as *;

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba($black, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: $zindex-modal;
  padding: 1rem;
  animation: fadeIn 0.2s ease-out;
}

.modal-dialog {
  background: $white;
  border-radius: $border-radius-lg;
  box-shadow: $box-shadow-lg;
  width: 100%;
  max-width: 500px;
  animation: slideUp 0.3s ease-out;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 0;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: $text-primary;
}

.modal-close {
  background: none;
  border: none;
  padding: 0.5rem;
  color: $text-muted;
  cursor: pointer;
  border-radius: $border-radius;
  transition: all 0.2s ease;

  &:hover {
    color: $text-primary;
    background: $bg-secondary;
  }
}

.modal-body {
  padding: 1.5rem;
}

.modal-message {
  margin: 0;
  color: $text-secondary;
  line-height: 1.5;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 0 1.5rem 1.5rem;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba($black, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $border-radius-lg;
  z-index: 1;
}

.loading-spinner-large {
  width: 48px;
  height: 48px;
  border: 4px solid rgba($white, 0.3);
  border-left-color: $white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

// Адаптивность
@media (max-width: 576px) {
  .modal-dialog {
    margin: 0;
  }

  .modal-footer {
    flex-direction: column-reverse;
  }
}
</style>
