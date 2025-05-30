<template>
  <div v-if="toasts.length > 0" class="toast-container">
    <ToastNotification
      v-for="toast in toasts"
      :key="toast.id"
      :title="toast.title"
      :message="toast.message"
      :variant="toast.variant"
      :duration="toast.duration"
      :closable="toast.closable"
      @close="removeToast(toast.id)"
    />
  </div>
</template>

<script>
import ToastNotification from "./Toast.vue";

export default {
  name: "ToastContainer",

  components: {
    ToastNotification,
  },

  data() {
    return {
      toasts: [],
      nextId: 1,
    };
  },

  mounted() {
    // Подписываемся на глобальные события уведомлений
    this.$root.$on("show-toast", this.addToast);
  },

  beforeDestroy() {
    // Отписываемся от событий
    this.$root.$off("show-toast", this.addToast);
  },

  methods: {
    addToast(options) {
      const toast = {
        id: this.nextId++,
        title: options.title || "",
        message: options.message || "",
        variant: options.variant || "info",
        duration: options.duration ?? 4000,
        closable: options.closable ?? true,
      };

      this.toasts.push(toast);
    },

    removeToast(id) {
      const index = this.toasts.findIndex((toast) => toast.id === id);
      if (index > -1) {
        this.toasts.splice(index, 1);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  pointer-events: none;

  > * {
    pointer-events: auto;
  }
}

// Адаптивность
@media (max-width: 768px) {
  .toast-container {
    top: 1rem;
    left: 1rem;
    right: 1rem;
  }
}
</style>
