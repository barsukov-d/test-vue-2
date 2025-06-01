<template>
  <div class="template-dimensions">
    <h3>Размеры</h3>

    <div class="form-row">
      <div class="form-group">
        <ValidationProvider
          v-slot="{ errors }"
          name="width"
          rules="required|pixel_format"
        >
          <BaseInput
            :value="form.width"
            @input="updateField('width', $event)"
            label="Ширина*"
            placeholder="1920px"
            :error="errors[0]"
            :disabled="readonly"
          />
        </ValidationProvider>
      </div>
      <div class="form-group">
        <ValidationProvider
          v-slot="{ errors }"
          name="height"
          rules="required|pixel_format"
        >
          <BaseInput
            :value="form.height"
            @input="updateField('height', $event)"
            label="Высота*"
            placeholder="1080px"
            :error="errors[0]"
            :disabled="readonly"
          />
        </ValidationProvider>
      </div>
    </div>

    <!-- Предустановленные размеры -->
    <div class="preset-sizes" v-if="!readonly">
      <label class="form-label">Быстрый выбор:</label>
      <div class="preset-buttons">
        <button
          v-for="preset in presetSizes"
          :key="preset.name"
          @click="applyPreset(preset)"
          class="preset-button"
          type="button"
        >
          {{ preset.name }}
          <span class="preset-size"
            >{{ preset.width }}×{{ preset.height }}</span
          >
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import BaseInput from "@/components/ui/BaseInput.vue";

export default {
  name: "TemplateDimensions",

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

  data() {
    return {
      presetSizes: [
        { name: "HD", width: "1920px", height: "1080px" },
        { name: "4K", width: "3840px", height: "2160px" },
        { name: "Instagram Post", width: "1080px", height: "1080px" },
        { name: "Instagram Story", width: "1080px", height: "1920px" },
        { name: "Facebook Cover", width: "1200px", height: "630px" },
        { name: "YouTube Thumbnail", width: "1280px", height: "720px" },
      ],
    };
  },

  methods: {
    updateField(field, value) {
      this.$emit("update:form", {
        ...this.form,
        [field]: value,
      });
    },

    applyPreset(preset) {
      this.$emit("update:form", {
        ...this.form,
        width: preset.width,
        height: preset.height,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@use "@/styles/variables" as *;

.template-dimensions {
  h3 {
    margin: 0 0 1.5rem;
    font-size: 1.25rem;
    font-weight: 600;
    color: $text-primary;
    border-bottom: 1px solid $border-color;
    padding-bottom: 0.75rem;
  }
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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

.preset-sizes {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid $border-color;
}

.preset-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.preset-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: $white;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  font-size: 0.75rem;
  font-weight: 500;
  color: $text-primary;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: $gray-50;
    border-color: $primary-color;
  }

  &:active {
    transform: translateY(1px);
  }
}

.preset-size {
  font-size: 0.625rem;
  color: $text-muted;
  margin-top: 0.125rem;
}
</style>
