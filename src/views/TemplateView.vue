<template>
  <div class="template-view">
    <div class="container">
      <!-- Заголовок -->
      <div class="page-header">
        <div class="page-title">
          <BaseButton
            variant="ghost"
            size="small"
            @click="$router.push('/')"
            class="back-button"
          >
            ← Назад к шаблонам
          </BaseButton>
          <h1>{{ pageTitle }}</h1>
        </div>
        <div class="page-actions" v-if="!readonly">
          <BaseButton
            v-if="isEdit"
            variant="outline-danger"
            @click="handleDeleteTemplate"
            :disabled="isLoading"
          >
            Удалить
          </BaseButton>
          <BaseButton
            variant="secondary"
            @click="handleCancel"
            :disabled="isLoading"
          >
            Отменить
          </BaseButton>
          <BaseButton
            variant="primary"
            @click="handleSave"
            :loading="isLoading"
            :disabled="!isFormValid"
          >
            {{ isEdit ? "Сохранить" : "Создать" }}
          </BaseButton>
        </div>
      </div>

      <!-- Состояние загрузки -->
      <div v-if="isLoading && !template" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Загрузка шаблона...</p>
      </div>

      <!-- Ошибка загрузки -->
      <div v-else-if="error" class="error-state">
        <p class="error-message">{{ error }}</p>
        <BaseButton @click="loadTemplate" variant="secondary">
          Повторить
        </BaseButton>
      </div>

      <!-- Форма шаблона -->
      <div v-else class="template-form">
        <ValidationObserver ref="observer">
          <div class="form-grid">
            <!-- Левая колонка - основная информация -->
            <div class="form-section">
              <h3>Основная информация</h3>

              <div class="form-group">
                <ValidationProvider
                  v-slot="{ errors }"
                  name="name"
                  rules="required"
                >
                  <BaseInput
                    v-model="form.name"
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
                  v-model="form.description"
                  class="form-textarea"
                  placeholder="Введите описание шаблона (необязательно)"
                  :disabled="readonly"
                  rows="4"
                ></textarea>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <ValidationProvider
                    v-slot="{ errors }"
                    name="width"
                    rules="required|pixel_format"
                  >
                    <BaseInput
                      v-model="form.width"
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
                      v-model="form.height"
                      label="Высота*"
                      placeholder="1080px"
                      :error="errors[0]"
                      :disabled="readonly"
                    />
                  </ValidationProvider>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Теги</label>
                <div class="tags-input">
                  <div class="selected-tags">
                    <span
                      v-for="(tag, index) in form.tags"
                      :key="index"
                      class="tag"
                    >
                      {{ tag }}
                      <button
                        v-if="!readonly"
                        @click="removeTag(index)"
                        class="tag-remove"
                        type="button"
                      >
                        ×
                      </button>
                    </span>
                  </div>
                  <input
                    v-if="!readonly"
                    v-model="newTag"
                    @keydown.enter.prevent="addTag"
                    @keydown="handleTagInput"
                    placeholder="Добавить тег (Enter или запятая)"
                    class="tag-input"
                  />
                </div>
              </div>

              <div class="form-group">
                <ValidationProvider
                  v-slot="{ errors }"
                  name="objectsJson"
                  rules="required|json_format"
                >
                  <label class="form-label">Объекты шаблона (JSON)*</label>
                  <textarea
                    v-model="form.objectsJson"
                    class="form-textarea code-textarea"
                    :class="{ 'form-error': errors[0] }"
                    placeholder='{"version": "5.3.0", "objects": []}'
                    :disabled="readonly"
                    rows="6"
                  ></textarea>
                  <small class="form-hint"
                    >JSON данные canvas объектов (обязательно)</small
                  >
                  <span v-if="errors[0]" class="form-error-text">{{
                    errors[0]
                  }}</span>
                </ValidationProvider>
              </div>
            </div>

            <!-- Правая колонка - превью и дополнительная информация -->
            <div class="form-section">
              <h3>Превью</h3>

              <!-- Превью изображения -->
              <div class="preview-section">
                <div v-if="form.preview_image" class="preview-image">
                  <img :src="form.preview_image" :alt="form.name" />
                  <button
                    v-if="!readonly"
                    @click="removePreviewImage"
                    class="remove-preview"
                    type="button"
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
                  >
                    Загрузить изображение
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

              <!-- Метаинформация для редактирования -->
              <div v-if="isEdit && template" class="meta-info">
                <h3>Информация</h3>
                <div class="meta-item">
                  <strong>ID:</strong> {{ template.id }}
                </div>
                <div class="meta-item">
                  <strong>Создан:</strong> {{ formatDate(template.created_at) }}
                </div>
                <div v-if="template.created_by" class="meta-item">
                  <strong>Автор:</strong> {{ template.created_by }}
                </div>
                <div
                  v-if="
                    template.updated_at &&
                    template.updated_at !== template.created_at
                  "
                  class="meta-item"
                >
                  <strong>Обновлен:</strong>
                  {{ formatDate(template.updated_at) }}
                </div>
                <div v-if="template.updated_by" class="meta-item">
                  <strong>Обновил:</strong> {{ template.updated_by }}
                </div>
              </div>
            </div>
          </div>
        </ValidationObserver>
      </div>
    </div>

    <!-- Модальное окно подтверждения удаления -->
    <ConfirmDialog
      v-if="showDeleteConfirm"
      :title="'Удалить шаблон?'"
      :message="`Вы уверены, что хотите удалить шаблон «${template?.name}»? Это действие нельзя отменить.`"
      :loading="isDeleting"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import BaseButton from "@/components/ui/BaseButton.vue";
import BaseInput from "@/components/ui/BaseInput.vue";
import ConfirmDialog from "@/components/ui/ConfirmDialog.vue";

export default {
  name: "TemplateView",

  components: {
    BaseButton,
    BaseInput,
    ConfirmDialog,
  },

  props: {
    id: {
      type: String,
      default: null,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      form: {
        name: "",
        description: "",
        width: "",
        height: "",
        tags: [],
        preview_image: "",
        objectsJson: "{}",
      },
      newTag: "",
      uploadingFile: false,
      selectedFile: null,
      showDeleteConfirm: false,
      isDeleting: false,
      lastFileSelectClick: 0,
    };
  },

  computed: {
    ...mapGetters("templates", ["currentTemplate", "isLoading", "error"]),

    template() {
      return this.currentTemplate || null;
    },

    isEdit() {
      return !!this.id;
    },

    pageTitle() {
      if (this.readonly) {
        return this.template?.name || "Просмотр шаблона";
      }
      return this.isEdit ? "Редактирование шаблона" : "Создание шаблона";
    },

    isFormValid() {
      // Проверяем заполненность обязательных полей согласно API
      const hasRequiredFields =
        this.form.name.trim() &&
        this.form.width.trim() &&
        this.form.height.trim() &&
        this.form.objectsJson.trim();

      // Если обязательные поля не заполнены, форма невалидна
      if (!hasRequiredFields) {
        return false;
      }

      // Если ValidationObserver доступен, проверяем дополнительно валидацию
      if (this.$refs.observer && this.$refs.observer.flags) {
        return !this.$refs.observer.flags.invalid;
      }

      // Если ValidationObserver еще не инициализирован, но поля заполнены - разрешаем
      return true;
    },
  },

  async mounted() {
    if (this.isEdit && this.id) {
      await this.loadTemplate();
    }
  },

  methods: {
    ...mapActions("templates", {
      fetchTemplate: "fetchTemplate",
      createTemplate: "createTemplate",
      updateTemplate: "updateTemplate",
      deleteTemplateFromStore: "deleteTemplate",
      uploadFile: "uploadFile",
      clearCurrentTemplate: "clearCurrentTemplate",
    }),

    async loadTemplate() {
      if (!this.id) return;

      try {
        await this.fetchTemplate(this.id);
        this.fillForm();
      } catch (error) {
        console.error("Error loading template:", error);
      }
    },

    fillForm() {
      if (!this.template) return;

      this.form = {
        name: this.template.name || "",
        description: this.template.description || "",
        width: this.template.width || "",
        height: this.template.height || "",
        tags: Array.isArray(this.template.tags) ? [...this.template.tags] : [],
        preview_image: this.template.preview_image || "",
        objectsJson: this.template.objects
          ? JSON.stringify(this.template.objects, null, 2)
          : "{}",
      };

      // Сбрасываем валидацию после заполнения формы
      this.$nextTick(() => {
        if (this.$refs.observer) {
          this.$refs.observer.reset();
        }
      });
    },

    addTag() {
      const tag = this.newTag.trim();
      if (tag && !this.form.tags.includes(tag)) {
        this.form.tags.push(tag);
        this.newTag = "";
      }
    },

    handleTagInput(event) {
      // Обработка запятой для добавления тега
      if (event.key === "," || event.key === "188") {
        event.preventDefault();
        this.addTag();
      }
    },

    removeTag(index) {
      this.form.tags.splice(index, 1);
    },

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

      if (this.$refs.fileInput) {
        this.$refs.fileInput.click();
      }
    },

    async handleFileUpload(event) {
      // Prevent multiple uploads at the same time
      if (this.uploadingFile) {
        return;
      }

      const file = event.target.files[0];
      if (!file) {
        this.uploadingFile = false;
        return;
      }

      this.uploadingFile = true;

      try {
        // Проверяем размер файла (макс 5MB)
        if (file.size > 5 * 1024 * 1024) {
          this.$root.$emit("show-toast", {
            title: "Ошибка",
            message: "Размер файла не должен превышать 5MB",
            variant: "error",
          });
          return;
        }

        // Сохраняем файл для отправки
        this.selectedFile = file;

        // Создаем URL для предпросмотра и ждем завершения
        await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            this.form.preview_image = e.target.result;
            resolve();
          };
          reader.onerror = () => {
            reject(new Error("Ошибка чтения файла"));
          };
          reader.readAsDataURL(file);
        });
      } catch (error) {
        console.error("File upload error:", error);
        this.$root.$emit("show-toast", {
          title: "Ошибка",
          message: "Не удалось загрузить файл",
          variant: "error",
        });
      } finally {
        // Очищаем input для возможности выбора того же файла снова
        if (this.$refs.fileInput) {
          this.$refs.fileInput.value = "";
        }
        this.uploadingFile = false;
      }
    },

    removePreviewImage() {
      this.form.preview_image = "";
      this.selectedFile = null;
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = "";
      }
    },

    async handleSave() {
      // Проверяем валидность формы через VeeValidate
      const isValid = await this.$refs.observer.validate();
      if (!isValid) {
        this.$root.$emit("show-toast", {
          title: "Ошибка",
          message: "Пожалуйста, исправьте ошибки в форме",
          variant: "error",
        });
        return;
      }

      console.log("=== HANDLE SAVE DEBUG ===");
      console.log("Form data:", this.form);
      console.log("Selected file:", this.selectedFile);
      console.log("Is edit mode:", this.isEdit);

      // Парсим JSON объектов
      let objects = null;
      if (this.form.objectsJson) {
        try {
          objects = JSON.parse(this.form.objectsJson);
          console.log("Parsed objects:", objects);
        } catch (error) {
          this.$root.$emit("show-toast", {
            title: "Ошибка",
            message: "Некорректный JSON формат объектов",
            variant: "error",
          });
          return;
        }
      }

      const templateData = {
        name: this.form.name.trim(),
        description: this.form.description.trim(),
        width: this.form.width.trim(),
        height: this.form.height.trim(),
        tags: this.form.tags.length > 0 ? this.form.tags : null,
        objects: objects,
      };

      // Добавляем preview_image как файл объект если есть
      if (this.selectedFile) {
        templateData.preview_image = this.selectedFile;
      }

      console.log("Final templateData:", templateData);

      try {
        if (this.isEdit) {
          console.log("Calling updateTemplate with ID:", this.id);
          await this.updateTemplate({ id: this.id, data: templateData });
          this.$root.$emit("show-toast", {
            title: "Успешно!",
            message: "Шаблон обновлен",
            variant: "success",
          });
        } else {
          console.log("Calling createTemplate");
          await this.createTemplate(templateData);
          this.$root.$emit("show-toast", {
            title: "Успешно!",
            message: "Шаблон создан",
            variant: "success",
          });
        }

        this.$router.push("/");
      } catch (error) {
        console.error("Error saving template:", error);
        this.$root.$emit("show-toast", {
          title: "Ошибка",
          message: error.message || "Не удалось сохранить шаблон",
          variant: "error",
        });
      }
    },

    handleCancel() {
      this.$router.push("/");
    },

    formatDate(dateString) {
      if (!dateString) return "";
      try {
        return new Date(dateString).toLocaleString("ru-RU");
      } catch (error) {
        return dateString;
      }
    },

    async handleDeleteTemplate() {
      this.showDeleteConfirm = true;
    },

    confirmDelete() {
      this.performDeleteTemplate();
    },

    cancelDelete() {
      // Не позволяем закрыть модальное окно во время удаления
      if (this.isDeleting) {
        return;
      }
      this.showDeleteConfirm = false;
    },

    async performDeleteTemplate() {
      if (!this.id || this.isDeleting) return;

      this.isDeleting = true;
      try {
        await this.deleteTemplateFromStore(this.id);
        this.showDeleteConfirm = false;
        this.$root.$emit("show-toast", {
          title: "Успешно!",
          message: "Шаблон удален",
          variant: "success",
        });
        this.$router.push("/");
      } catch (error) {
        console.error("Error deleting template:", error);
        this.$root.$emit("show-toast", {
          title: "Ошибка",
          message: error.message || "Не удалось удалить шаблон",
          variant: "error",
        });
      } finally {
        this.isDeleting = false;
      }
    },
  },

  beforeDestroy() {
    this.clearCurrentTemplate();
  },
};
</script>

<style lang="scss" scoped>
@use "@/styles/variables" as *;

.template-view {
  padding: 2rem 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 2rem;
}

.page-title {
  h1 {
    margin: 0.5rem 0 0;
    font-size: 2rem;
    font-weight: 700;
    color: $text-primary;
  }
}

.back-button {
  margin-bottom: 0.5rem;
}

.page-actions {
  display: flex;
  gap: 1rem;
  flex-shrink: 0;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 3rem 1rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid $border-color;
  border-left-color: $primary-color;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.error-message {
  color: $danger-color;
  margin-bottom: 1rem;
}

.template-form {
  background: $white;
  border-radius: $border-radius-lg;
  box-shadow: $box-shadow-sm;
  overflow: hidden;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
}

.form-section {
  padding: 2rem;

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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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
  font-size: 0.9rem;
  resize: vertical;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: $primary-color;
  }

  &:disabled {
    background: $bg-secondary;
    color: $text-muted;
  }

  &.code-textarea {
    font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
    font-size: 0.8rem;
    line-height: 1.4;
  }
}

.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  background: $white;
  font-family: inherit;
  font-size: 0.9rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: $primary-color;
  }

  &:disabled {
    background: $bg-secondary;
    color: $text-muted;
  }
}

.form-hint {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.8rem;
  color: $text-muted;
}

.form-error {
  border-color: $danger-color !important;
}

.form-error-text {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.8rem;
  color: $danger-color;
}

.tags-input {
  border: 1px solid $border-color;
  border-radius: $border-radius;
  padding: 0.5rem;
  background: $white;

  &:focus-within {
    border-color: $primary-color;
  }
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-bottom: 0.5rem;
}

.tag {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: rgba($primary-color, 0.1);
  color: $primary-color;
  border-radius: $border-radius-sm;
  font-size: 0.8rem;
  font-weight: 500;
}

.tag-remove {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  padding: 0;
  line-height: 1;

  &:hover {
    opacity: 0.7;
  }
}

.tag-input {
  width: 100%;
  border: none;
  outline: none;
  padding: 0.25rem;
  font-family: inherit;
  font-size: 0.9rem;
}

.preview-section {
  margin-bottom: 2rem;
}

.preview-image {
  position: relative;
  display: inline-block;
  max-width: 100%;

  img {
    max-width: 100%;
    height: auto;
    border-radius: $border-radius;
    border: 1px solid $border-color;
  }
}

.remove-preview {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  background: $danger-color;
  color: $white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: darken($danger-color, 10%);
  }
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: $bg-secondary;
  border: 1px dashed $border-color;
  border-radius: $border-radius;
  color: $text-muted;
  text-align: center;

  svg {
    margin-bottom: 1rem;
    opacity: 0.6;
  }

  span {
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }
}

.meta-info {
  margin-top: 2rem;
}

.meta-item {
  margin-bottom: 0.75rem;
  font-size: 0.9rem;

  strong {
    color: $text-primary;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

// Адаптивность
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-section {
    padding: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
