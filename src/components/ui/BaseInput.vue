<template>
  <div class="input-group" :class="inputGroupClasses">
    <label v-if="label" :for="inputId" class="input-label">
      {{ label }}
    </label>

    <div class="input-wrapper">
      <input
        :id="inputId"
        ref="input"
        :type="type"
        :value="value"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :class="inputClasses"
        :aria-describedby="ariaDescribedBy"
        :aria-invalid="hasError"
        v-bind="$attrs"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      />

      <span v-if="$slots.suffix" class="input-suffix">
        <slot name="suffix"></slot>
      </span>
    </div>

    <div v-if="hasError" class="input-error" :id="`${inputId}-error`">
      {{ errorMessage }}
    </div>

    <div v-else-if="hint" class="input-hint" :id="`${inputId}-hint`">
      {{ hint }}
    </div>
  </div>
</template>

<script>
let inputIdCounter = 0;

export default {
  name: "BaseInput",

  inheritAttrs: false,

  props: {
    value: {
      type: [String, Number],
      default: "",
    },
    type: {
      type: String,
      default: "text",
      validator: (value) =>
        ["text", "email", "password", "search"].includes(value),
    },
    label: {
      type: String,
      default: "",
    },
    placeholder: {
      type: String,
      default: "",
    },
    error: {
      type: String,
      default: "",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      inputId: `input-${++inputIdCounter}`,
      isFocused: false,
    };
  },

  computed: {
    inputGroupClasses() {
      return [
        {
          "input-group--focused": this.isFocused,
          "input-group--disabled": this.disabled,
          "input-group--error": this.hasError,
          "input-group--readonly": this.readonly,
        },
      ];
    },

    inputClasses() {
      return [
        "input",
        {
          "input--error": this.hasError,
          "input--disabled": this.disabled,
        },
      ];
    },

    hasError() {
      return !!this.error;
    },

    errorMessage() {
      return this.error;
    },

    ariaDescribedBy() {
      if (this.hasError) {
        return `${this.inputId}-error`;
      }
      return null;
    },
  },

  methods: {
    handleInput(event) {
      this.$emit("input", event.target.value);
    },

    handleBlur(event) {
      this.isFocused = false;
      this.$emit("blur", event);
    },

    handleFocus(event) {
      this.isFocused = true;
      this.$emit("focus", event);
    },

    focus() {
      this.$refs.input.focus();
    },

    blur() {
      this.$refs.input.blur();
    },

    select() {
      this.$refs.input.select();
    },
  },
};
</script>

<style lang="scss" scoped>
@use "@/styles/variables" as *;

.input-group {
  margin-bottom: 1rem;

  &--disabled {
    opacity: 0.6;
  }
}

.input-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: $text-primary;

  &--required::after {
    content: " *";
    color: $danger-color;
  }
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input {
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: $text-primary;
  background-color: $white;
  background-clip: padding-box;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;

  &:focus {
    color: $text-primary;
    background-color: $white;
    border-color: rgba($primary-color, 0.5);
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgba($primary-color, 0.25);
  }

  &::placeholder {
    color: $text-muted;
    opacity: 1;
  }

  &:disabled,
  &[readonly] {
    background-color: $bg-secondary;
    opacity: 1;
  }

  &:disabled {
    cursor: not-allowed;
  }

  // Размеры
  &--small {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
  }

  &--large {
    padding: 0.75rem 1rem;
    font-size: 1.125rem;
  }

  // Состояние ошибки
  &--error {
    border-color: $danger-color;

    &:focus {
      border-color: $danger-color;
      box-shadow: 0 0 0 0.2rem rgba($danger-color, 0.25);
    }
  }
}

.input-suffix {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: $text-muted;
}

.input-error {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: $danger-color;
}

.input-hint {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: $text-muted;
}

// Удаляем спиннеры у number input
.input[type="number"] {
  -moz-appearance: textfield;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
}
</style>
