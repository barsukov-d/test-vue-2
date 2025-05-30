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
        <BaseButton variant="secondary" @click="$emit('cancel')">
          {{ cancelText }}
        </BaseButton>
        <BaseButton :variant="confirmVariant" @click="$emit('confirm')">
          {{ confirmText }}
        </BaseButton>
      </div>
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
      validator: (value) =>
        [
          "primary",
          "secondary",
          "success",
          "danger",
          "warning",
          "info",
        ].includes(value),
    },
  },

  emits: ["confirm", "cancel"],

  mounted() {
    // Блокируем прокрутку страницы
    document.body.style.overflow = "hidden";

    // Добавляем обработчик клавиши Escape
    document.addEventListener("keydown", this.handleEscape);
  },

  beforeUnmount() {
    // Восстанавливаем прокрутку страницы
    document.body.style.overflow = "";

    // Удаляем обработчик клавиши Escape
    document.removeEventListener("keydown", this.handleEscape);
  },

  methods: {
    handleOverlayClick() {
      this.$emit("cancel");
    },

    handleEscape(event) {
      if (event.key === "Escape") {
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
