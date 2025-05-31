<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    :type="type"
    @click="handleClick"
    v-bind="$attrs"
    v-on="$listenersWithoutClick"
  >
    <span v-if="loading" class="btn-spinner"></span>
    <slot v-if="!loading"></slot>
    <span v-if="loading">{{ loadingText }}</span>
  </button>
</template>

<script>
export default {
  name: "BaseButton",

  inheritAttrs: false,

  props: {
    variant: {
      type: String,
      default: "primary",
      validator: (value) =>
        [
          "primary",
          "secondary",
          "success",
          "danger",
          "warning",
          "info",
          "light",
          "dark",
          "ghost",
          "outline-primary",
          "outline-secondary",
          "outline-success",
          "outline-danger",
          "outline-warning",
          "outline-info",
          "outline-light",
          "outline-dark",
        ].includes(value),
    },
    size: {
      type: String,
      default: "medium",
      validator: (value) => ["small", "medium", "large"].includes(value),
    },
    type: {
      type: String,
      default: "button",
      validator: (value) => ["button", "submit", "reset"].includes(value),
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    loadingText: {
      type: String,
      default: "Загрузка...",
    },
    block: {
      type: Boolean,
      default: false,
    },
    rounded: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      lastClickTime: 0,
      clickCooldown: 300, // 300ms cooldown to prevent rapid clicks
    };
  },

  computed: {
    buttonClasses() {
      return [
        "btn",
        `btn--${this.variant}`,
        `btn--${this.size}`,
        {
          "btn--block": this.block,
          "btn--rounded": this.rounded,
          "btn--loading": this.loading,
          "btn--disabled": this.disabled,
        },
      ];
    },

    // Исключаем событие click из $listeners чтобы избежать двойной обработки
    $listenersWithoutClick() {
      // eslint-disable-next-line no-unused-vars
      const { click, ...otherListeners } = this.$listeners;
      return otherListeners;
    },
  },

  methods: {
    handleClick(event) {
      if (!this.disabled && !this.loading) {
        // Prevent rapid clicks
        const now = Date.now();
        if (now - this.lastClickTime < this.clickCooldown) {
          return;
        }
        this.lastClickTime = now;

        this.$emit("click", event);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@use "@/styles/variables" as *;

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid transparent;
  border-radius: $border-radius;
  font-family: inherit;
  font-weight: 500;
  text-align: center;
  text-decoration: none;
  white-space: nowrap;
  vertical-align: middle;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  position: relative;
  min-height: 2.5rem;

  &:focus {
    outline: 2px solid rgba($primary-color, 0.25);
    outline-offset: 2px;
  }

  &:disabled,
  &--disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  // Размеры
  &--small {
    padding: 0.25rem 0.75rem;
    font-size: 0.875rem;
    min-height: 2rem;
  }

  &--medium {
    padding: 0.5rem 1rem;
    font-size: 1rem;
    min-height: 2.5rem;
  }

  &--large {
    padding: 0.75rem 1.5rem;
    font-size: 1.125rem;
    min-height: 3rem;
  }

  // Варианты
  &--primary {
    background-color: $primary-color;
    border-color: $primary-color;
    color: $white;

    &:hover:not(:disabled) {
      background-color: $primary-dark;
      border-color: $primary-dark;
    }
  }

  &--secondary {
    background-color: $secondary-color;
    border-color: $secondary-color;
    color: $white;

    &:hover:not(:disabled) {
      background-color: $secondary-dark;
      border-color: $secondary-dark;
    }
  }

  &--success {
    background-color: $success-color;
    border-color: $success-color;
    color: $white;

    &:hover:not(:disabled) {
      background-color: $success-dark;
      border-color: $success-dark;
    }
  }

  &--danger {
    background-color: $danger-color;
    border-color: $danger-color;
    color: $white;

    &:hover:not(:disabled) {
      background-color: $danger-dark;
      border-color: $danger-dark;
    }
  }

  &--warning {
    background-color: $warning-color;
    border-color: $warning-color;
    color: $dark-color;

    &:hover:not(:disabled) {
      background-color: $warning-dark;
      border-color: $warning-dark;
    }
  }

  &--info {
    background-color: $info-color;
    border-color: $info-color;
    color: $white;

    &:hover:not(:disabled) {
      background-color: $info-dark;
      border-color: $info-dark;
    }
  }

  &--light {
    background-color: $light-color;
    border-color: $light-color;
    color: $dark-color;

    &:hover:not(:disabled) {
      background-color: $light-dark;
      border-color: $light-dark;
    }
  }

  &--dark {
    background-color: $dark-color;
    border-color: $dark-color;
    color: $white;

    &:hover:not(:disabled) {
      background-color: $dark-light;
      border-color: $dark-light;
    }
  }

  &--ghost {
    background-color: transparent;
    border-color: transparent;
    color: $text-primary;

    &:hover:not(:disabled) {
      background-color: $bg-secondary;
    }
  }

  // Outline варианты
  &--outline-primary {
    background-color: transparent;
    border-color: $primary-color;
    color: $primary-color;

    &:hover:not(:disabled) {
      background-color: $primary-color;
      color: $white;
    }
  }

  &--outline-secondary {
    background-color: transparent;
    border-color: $secondary-color;
    color: $secondary-color;

    &:hover:not(:disabled) {
      background-color: $secondary-color;
      color: $white;
    }
  }

  &--outline-success {
    background-color: transparent;
    border-color: $success-color;
    color: $success-color;

    &:hover:not(:disabled) {
      background-color: $success-color;
      color: $white;
    }
  }

  &--outline-danger {
    background-color: transparent;
    border-color: $danger-color;
    color: $danger-color;

    &:hover:not(:disabled) {
      background-color: $danger-color;
      color: $white;
    }
  }

  &--outline-warning {
    background-color: transparent;
    border-color: $warning-color;
    color: $warning-color;

    &:hover:not(:disabled) {
      background-color: $warning-color;
      color: $dark-color;
    }
  }

  &--outline-info {
    background-color: transparent;
    border-color: $info-color;
    color: $info-color;

    &:hover:not(:disabled) {
      background-color: $info-color;
      color: $white;
    }
  }

  &--outline-light {
    background-color: transparent;
    border-color: $light-color;
    color: $text-primary;

    &:hover:not(:disabled) {
      background-color: $light-color;
      color: $dark-color;
    }
  }

  &--outline-dark {
    background-color: transparent;
    border-color: $dark-color;
    color: $dark-color;

    &:hover:not(:disabled) {
      background-color: $dark-color;
      color: $white;
    }
  }

  // Модификаторы
  &--block {
    display: flex;
    width: 100%;
  }

  &--rounded {
    border-radius: 50px;
  }

  &--loading {
    cursor: wait;
  }
}

.btn-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
