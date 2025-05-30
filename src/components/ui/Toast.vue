<template>
  <Transition name="toast" appear>
    <div v-if="visible" :class="['toast', variant]">
      <div class="toast-icon">
        <svg
          v-if="variant === 'success'"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <svg
          v-else-if="variant === 'error'"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <svg
          v-else-if="variant === 'warning'"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M13 16H12V12H11M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <div class="toast-content">
        <div v-if="title" class="toast-title">{{ title }}</div>
        <div class="toast-message">{{ message }}</div>
      </div>
      <button v-if="closable" @click="close" class="toast-close">×</button>
    </div>
  </Transition>
</template>

<script>
export default {
  name: "ToastNotification",

  props: {
    title: {
      type: String,
      default: "",
    },
    message: {
      type: String,
      required: true,
    },
    variant: {
      type: String,
      default: "info",
      validator: (value) =>
        ["success", "error", "warning", "info"].includes(value),
    },
    duration: {
      type: Number,
      default: 4000,
    },
    closable: {
      type: Boolean,
      default: true,
    },
  },

  emits: ["close"],

  data() {
    return {
      visible: true,
      timer: null,
    };
  },

  mounted() {
    if (this.duration > 0) {
      this.timer = setTimeout(() => {
        this.close();
      }, this.duration);
    }
  },

  beforeDestroy() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  },

  methods: {
    close() {
      this.visible = false;
      setTimeout(() => {
        this.$emit("close");
      }, 300);
    },
  },
};
</script>

<style lang="scss" scoped>
@use "@/styles/variables" as *;

.toast {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: $border-radius;
  box-shadow: $box-shadow-lg;
  background: $white;
  border: 1px solid $border-color;
  max-width: 400px;
  min-width: 300px;
  position: relative;

  &.success {
    border-left: 4px solid $success-color;

    .toast-icon {
      color: $success-color;
    }
  }

  &.error {
    border-left: 4px solid $danger-color;

    .toast-icon {
      color: $danger-color;
    }
  }

  &.warning {
    border-left: 4px solid $warning-color;

    .toast-icon {
      color: $warning-color;
    }
  }

  &.info {
    border-left: 4px solid $primary-color;

    .toast-icon {
      color: $primary-color;
    }
  }
}

.toast-icon {
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: $text-primary;
}

.toast-message {
  color: $text-secondary;
  font-size: 0.9rem;
  line-height: 1.4;
}

.toast-close {
  flex-shrink: 0;
  background: none;
  border: none;
  font-size: 1.25rem;
  color: $text-muted;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  margin-top: -0.25rem;

  &:hover {
    color: $text-primary;
  }
}

// Анимации
.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.3s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
