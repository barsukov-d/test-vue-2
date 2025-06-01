<template>
  <div
    :class="cardClasses"
    @click="handleClick"
    :role="clickable ? 'button' : null"
    :tabindex="clickable ? '0' : null"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <div v-if="$slots.header" class="card-header">
      <slot name="header"></slot>
    </div>

    <div v-if="$slots.default" class="card-body">
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
    hoverable: {
      type: Boolean,
      default: false,
    },
    clickable: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    cardClasses() {
      return [
        "card",
        {
          "card--hoverable": this.hoverable,
          "card--clickable": this.clickable,
        },
      ];
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
  border: 1px solid $border-color;
  border-radius: $border-radius;
  box-shadow: $box-shadow-sm;
  overflow: hidden;
  transition: all 0.2s ease-in-out;

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
}

.card-header {
  background-color: $bg-secondary;
  border-bottom: 1px solid $border-color;
  padding: 1rem;
}

.card-body {
  flex: 1;
  padding: 1rem;
}

.card-footer {
  background-color: $bg-secondary;
  border-top: 1px solid $border-color;
  padding: 1rem;
}
</style>
