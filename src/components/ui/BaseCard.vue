<template>
  <div
    :class="cardClasses"
    @click="handleClick"
    :role="clickable ? 'button' : null"
    :tabindex="clickable ? '0' : null"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <div v-if="$slots.header || title" class="card-header">
      <slot name="header">
        <h3 v-if="title" class="card-title">{{ title }}</h3>
      </slot>
    </div>

    <div v-if="$slots.default" class="card-body" :class="bodyClasses">
      <slot></slot>
    </div>

    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "BaseCard",

  props: {
    title: {
      type: String,
      default: "",
    },
    variant: {
      type: String,
      default: "default",
      validator: (value) =>
        [
          "default",
          "primary",
          "secondary",
          "success",
          "danger",
          "warning",
          "info",
        ].includes(value),
    },
    size: {
      type: String,
      default: "medium",
      validator: (value) => ["small", "medium", "large"].includes(value),
    },
    hoverable: {
      type: Boolean,
      default: false,
    },
    clickable: {
      type: Boolean,
      default: false,
    },
    bordered: {
      type: Boolean,
      default: true,
    },
    shadow: {
      type: String,
      default: "sm",
      validator: (value) => ["none", "sm", "md", "lg"].includes(value),
    },
    bodyPadding: {
      type: String,
      default: "medium",
      validator: (value) =>
        ["none", "small", "medium", "large"].includes(value),
    },
  },

  computed: {
    cardClasses() {
      return [
        "card",
        `card--${this.variant}`,
        `card--${this.size}`,
        `card--shadow-${this.shadow}`,
        {
          "card--hoverable": this.hoverable,
          "card--clickable": this.clickable,
          "card--bordered": this.bordered,
        },
      ];
    },

    bodyClasses() {
      return [`card-body--padding-${this.bodyPadding}`];
    },
  },

  methods: {
    handleClick(event) {
      if (this.clickable) {
        this.$emit("click", event);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@use "@/styles/variables" as *;

.card {
  display: flex;
  flex-direction: column;
  background-color: $white;
  border-radius: $border-radius;
  overflow: hidden;
  transition: all 0.2s ease-in-out;

  &--bordered {
    border: 1px solid $border-color;
  }

  &--hoverable:hover {
    transform: translateY(-2px);
  }

  &--clickable {
    cursor: pointer;

    &:hover {
      transform: translateY(-2px);
    }

    &:focus {
      outline: 2px solid rgba($primary-color, 0.25);
      outline-offset: 2px;
    }
  }

  // Размеры
  &--small {
    .card-header,
    .card-footer {
      padding: 0.75rem;
    }
  }

  &--medium {
    .card-header,
    .card-footer {
      padding: 1rem;
    }
  }

  &--large {
    .card-header,
    .card-footer {
      padding: 1.5rem;
    }
  }

  // Тени
  &--shadow-none {
    box-shadow: none;
  }

  &--shadow-sm {
    box-shadow: $box-shadow-sm;
  }

  &--shadow-md {
    box-shadow: $box-shadow;
  }

  &--shadow-lg {
    box-shadow: $box-shadow-lg;
  }

  // Варианты
  &--primary {
    border-color: $primary-color;

    .card-header {
      background-color: $primary-color;
      color: $white;
    }
  }

  &--secondary {
    border-color: $secondary-color;

    .card-header {
      background-color: $secondary-color;
      color: $white;
    }
  }

  &--success {
    border-color: $success-color;

    .card-header {
      background-color: $success-color;
      color: $white;
    }
  }

  &--danger {
    border-color: $danger-color;

    .card-header {
      background-color: $danger-color;
      color: $white;
    }
  }

  &--warning {
    border-color: $warning-color;

    .card-header {
      background-color: $warning-color;
      color: $dark-color;
    }
  }

  &--info {
    border-color: $info-color;

    .card-header {
      background-color: $info-color;
      color: $white;
    }
  }
}

.card-header {
  background-color: $bg-secondary;
  border-bottom: 1px solid $border-color;
  padding: 1rem;
}

.card-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.card-body {
  flex: 1;

  // Отступы для body
  &--padding-none {
    padding: 0;
  }

  &--padding-small {
    padding: 0.75rem;
  }

  &--padding-medium {
    padding: 1rem;
  }

  &--padding-large {
    padding: 1.5rem;
  }
}

.card-footer {
  background-color: $bg-secondary;
  border-top: 1px solid $border-color;
  padding: 1rem;
}
</style>
