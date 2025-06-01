<template>
  <div class="template-editor">
    <h3>Основная информация</h3>

    <div class="form-group">
      <ValidationProvider v-slot="{ errors }" name="name" rules="required">
        <BaseInput
          :value="form.name"
          @input="updateField('name', $event)"
          label="Название шаблона*"
          placeholder="Введите название шаблона"
          :error="errors[0]"
          :disabled="readonly"
        />
      </ValidationProvider>
    </div>

    <div class="form-group">
      <label class="form-label">Описание</label>
      <textarea
        :value="form.description"
        @input="updateField('description', $event.target.value)"
        class="form-textarea"
        placeholder="Введите описание шаблона (необязательно)"
        :disabled="readonly"
        rows="4"
      ></textarea>
    </div>

    <div class="form-group">
      <ValidationProvider
        v-slot="{ errors }"
        name="objectsJson"
        rules="required|json_format"
      >
        <label class="form-label">Объекты шаблона (JSON)*</label>
        <textarea
          :value="form.objectsJson"
          @input="updateField('objectsJson', $event.target.value)"
          class="form-textarea code-textarea"
          :class="{ 'form-error': errors[0] }"
          placeholder='{"version": "5.3.0", "objects": []}'
          :disabled="readonly"
          rows="6"
        ></textarea>
        <small class="form-hint">
          JSON данные canvas объектов (обязательно)
        </small>
        <span v-if="errors[0]" class="form-error-text">
          {{ errors[0] }}
        </span>
      </ValidationProvider>
    </div>
  </div>
</template>

<script>
import BaseInput from "@/components/ui/BaseInput.vue";

export default {
  name: "TemplateEditor",

  components: {
    BaseInput,
  },

  props: {
    form: {
      type: Object,
      required: true,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["update:form"],

  methods: {
    updateField(field, value) {
      this.$emit("update:form", {
        ...this.form,
        [field]: value,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@use "@/styles/variables" as *;

.template-editor {
  h3 {
    margin: 0 0 1.5rem;
    font-size: 1.25rem;
    font-weight: 600;
    color: $text-primary;
    border-bottom: 1px solid $border-color;
    padding-bottom: 0.75rem;
  }
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: $text-primary;
}

.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  font-family: inherit;
  font-size: 0.875rem;
  line-height: 1.5;
  resize: vertical;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: $primary-color;
    box-shadow: 0 0 0 3px rgba($primary-color, 0.1);
  }

  &:disabled {
    background-color: $gray-50;
    color: $text-muted;
    cursor: not-allowed;
  }

  &.form-error {
    border-color: $danger-color;
  }
}

.code-textarea {
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 0.8rem;
}

.form-hint {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: $text-muted;
}

.form-error-text {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: $danger-color;
}
</style>
