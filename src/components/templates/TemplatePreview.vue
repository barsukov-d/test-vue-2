<template>
  <div class="template-preview">
    <h3>Превью</h3>

    <!-- Превью изображения -->
    <div class="preview-section">
      <div v-if="form.preview_image" class="preview-image">
        <img :src="form.preview_image" :alt="form.name || 'Превью шаблона'" />
        <button
          v-if="!readonly"
          @click="removePreviewImage"
          class="remove-preview"
          type="button"
          title="Удалить изображение"
        >
          ×
        </button>
      </div>
      <div v-else class="preview-placeholder">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <path
            d="M19 3H5C3.89 3 3 3.89 3 5V19C3 20.11 3.89 21 5 21H19C20.11 21 21 20.11 21 19V5C21 3.89 20.11 3 19 3ZM19 19H5V5H19V19Z"
            fill="currentColor"
          />
          <path
            d="M13.5 9C14.33 9 15 8.33 15 7.5S14.33 6 13.5 6S12 6.67 12 7.5S12.67 9 13.5 9Z"
            fill="currentColor"
          />
          <path
            d="M5 15L8.5 11.5L11 14L14.5 10.5L19 15H5Z"
            fill="currentColor"
          />
        </svg>
        <span>Превью не загружено</span>
        <BaseButton
          v-if="!readonly"
          variant="outline-primary"
          size="small"
          @click="triggerFileSelect"
          class="upload-button"
          :disabled="uploadingFile"
        >
          {{ uploadingFile ? "Загрузка..." : "Загрузить изображение" }}
        </BaseButton>
      </div>

      <input
        v-if="!readonly"
        ref="fileInput"
        type="file"
        accept="image/*"
        @change="handleFileUpload"
        style="display: none"
      />
    </div>

    <!-- Информация о файле -->
    <div v-if="selectedFile" class="file-info">
      <h4>Выбранный файл:</h4>
      <div class="file-details">
        <div class="file-detail">
          <strong>Имя:</strong> {{ selectedFile.name }}
        </div>
        <div class="file-detail">
          <strong>Размер:</strong> {{ formatFileSize(selectedFile.size) }}
        </div>
        <div class="file-detail">
          <strong>Тип:</strong> {{ selectedFile.type }}
        </div>
      </div>
    </div>

    <!-- Рекомендации -->
    <div class="upload-hints">
      <h4>Рекомендации:</h4>
      <ul>
        <li>Используйте изображения в формате JPG, PNG или WebP</li>
        <li>Рекомендуемый размер: не более 2MB</li>
        <li>Оптимальное разрешение: 800×600 пикселей</li>
        <li>Изображение должно отражать содержимое шаблона</li>
      </ul>
    </div>
  </div>
</template>

<script>
import BaseButton from "@/components/ui/BaseButton.vue";

export default {
  name: "TemplatePreview",

  components: {
    BaseButton,
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
    uploadingFile: {
      type: Boolean,
      default: false,
    },
    selectedFile: {
      type: File,
      default: null,
    },
  },

  emits: ["update:form", "file-selected", "file-upload"],

  data() {
    return {
      lastFileSelectClick: 0,
    };
  },

  methods: {
    triggerFileSelect() {
      const now = Date.now();

      // Prevent multiple file dialogs from opening
      if (this.uploadingFile) {
        return;
      }

      // Защита от двойных кликов (500ms cooldown)
      if (now - this.lastFileSelectClick < 500) {
        return;
      }

      this.lastFileSelectClick = now;
      this.$refs.fileInput.click();
    },

    async handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      // Валидация файла
      if (!file.type.startsWith("image/")) {
        this.$notify.files.invalidFormat(["JPG", "PNG", "WebP"]);
        return;
      }

      // Проверка размера файла (максимум 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        this.$notify.files.fileTooLarge("5MB");
        return;
      }

      this.$emit("file-selected", file);
      this.$emit("file-upload", file);
    },

    removePreviewImage() {
      this.$emit("update:form", {
        ...this.form,
        preview_image: "",
      });
      this.$emit("file-selected", null);

      // Очищаем input
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = "";
      }
    },

    formatFileSize(bytes) {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    },
  },
};
</script>

<style lang="scss" scoped>
@use "@/styles/variables" as *;

.template-preview {
  h3 {
    margin: 0 0 1.5rem;
    font-size: 1.25rem;
    font-weight: 600;
    color: $text-primary;
    border-bottom: 1px solid $border-color;
    padding-bottom: 0.75rem;
  }

  h4 {
    margin: 1rem 0 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: $text-primary;
  }
}

.preview-section {
  margin-bottom: 1.5rem;
}

.preview-image {
  position: relative;
  border-radius: $border-radius;
  overflow: hidden;
  background: $gray-50;
  border: 1px solid $border-color;

  img {
    width: 100%;
    height: auto;
    max-height: 200px;
    object-fit: cover;
    display: block;
  }
}

.remove-preview {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 24px;
  height: 24px;
  background: rgba($danger-color, 0.9);
  color: $white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;

  &:hover {
    background: $danger-color;
  }
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  border: 2px dashed $border-color;
  border-radius: $border-radius;
  background: $gray-50;
  color: $text-muted;
  text-align: center;
  min-height: 150px;

  svg {
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  span {
    margin-bottom: 1rem;
    font-size: 0.875rem;
  }
}

.upload-button {
  margin-top: 0.5rem;
}

.file-info {
  padding: 1rem;
  background: $gray-50;
  border-radius: $border-radius;
  margin-bottom: 1rem;
}

.file-details {
  margin-top: 0.5rem;
}

.file-detail {
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
  color: $text-secondary;

  strong {
    color: $text-primary;
  }
}

.upload-hints {
  padding: 1rem;
  background: rgba($info-color, 0.1);
  border-radius: $border-radius;
  border-left: 4px solid $info-color;

  ul {
    margin: 0.5rem 0 0;
    padding-left: 1.25rem;
  }

  li {
    margin-bottom: 0.25rem;
    font-size: 0.875rem;
    color: $text-secondary;
  }
}
</style>
