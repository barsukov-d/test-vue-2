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
          "danger",
          "outline-danger",
          "outline-secondary",
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
      validator: (value) => ["button", "submit"].includes(value),
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

  &--danger {
    background-color: $danger-color;
    border-color: $danger-color;
    color: $white;

    &:hover:not(:disabled) {
      background-color: $danger-dark;
      border-color: $danger-dark;
    }
  }

  // Outline варианты
  &--outline-secondary {
    background-color: transparent;
    border-color: $secondary-color;
    color: $secondary-color;

    &:hover:not(:disabled) {
      background-color: $secondary-color;
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
