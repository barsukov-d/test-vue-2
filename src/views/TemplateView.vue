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

        <!-- Действия -->
        <TemplateActions
          :readonly="readonly"
          :is-edit="isEdit"
          :is-loading="isLoading"
          :is-form-valid="isFormValid"
          @delete="handleDeleteTemplate"
          @cancel="handleCancel"
          @save="handleSave"
        />
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
              <!-- Основная форма -->
              <TemplateEditor
                :form="form"
                :readonly="readonly"
                @update:form="updateForm"
              />

              <!-- Размеры -->
              <TemplateDimensions
                :form="form"
                :readonly="readonly"
                @update:form="updateForm"
              />

              <!-- Теги и метаданные -->
              <TemplateMetadata
                :form="form"
                :template="template"
                :readonly="readonly"
                :is-edit="isEdit"
                @update:form="updateForm"
              />
            </div>

            <!-- Правая колонка - превью -->
            <div class="form-section">
              <TemplatePreview
                :form="form"
                :readonly="readonly"
                :uploading-file="uploadingFile"
                :selected-file="selectedFile"
                @update:form="updateForm"
                @file-selected="handleFileSelected"
                @file-upload="handleFileUpload"
              />
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
import { formatDate as formatDateHelper } from "@/utils/helpers";
import BaseButton from "@/components/ui/BaseButton.vue";
import ConfirmDialog from "@/components/ui/ConfirmDialog.vue";
import TemplateActions from "@/components/templates/TemplateActions.vue";
import TemplateEditor from "@/components/templates/TemplateEditor.vue";
import TemplateDimensions from "@/components/templates/TemplateDimensions.vue";
import TemplateMetadata from "@/components/templates/TemplateMetadata.vue";
import TemplatePreview from "@/components/templates/TemplatePreview.vue";

export default {
  name: "TemplateView",

  components: {
    BaseButton,
    ConfirmDialog,
    TemplateActions,
    TemplateEditor,
    TemplateDimensions,
    TemplateMetadata,
    TemplatePreview,
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
      uploadingFile: false,
      selectedFile: null,
      showDeleteConfirm: false,
      isDeleting: false,
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

    updateForm(newForm) {
      this.form = { ...newForm };
    },

    handleFileSelected(file) {
      this.selectedFile = file;
    },

    async handleFileUpload(file) {
      if (!file) return;

      this.uploadingFile = true;
      try {
        // Создаем URL для превью
        const previewUrl = URL.createObjectURL(file);
        this.updateForm({
          ...this.form,
          preview_image: previewUrl,
        });

        this.$notify.files.uploadSuccess(file.name);
      } catch (error) {
        console.error("Error handling file:", error);
        this.$notify.files.uploadError("Не удалось обработать файл");
      } finally {
        this.uploadingFile = false;
      }
    },

    async handleSave() {
      // Проверяем валидность формы через VeeValidate
      const isValid = await this.$refs.observer.validate();
      if (!isValid) {
        this.$notify.system.validationError();
        return;
      }

      // Парсим JSON объектов
      let objects = null;
      if (this.form.objectsJson) {
        try {
          objects = JSON.parse(this.form.objectsJson);
        } catch (error) {
          this.$notify.error("Ошибка", "Некорректный JSON формат объектов");
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

      try {
        if (this.isEdit) {
          await this.updateTemplate({ id: this.id, data: templateData });
          this.$notify.templates.updateSuccess(this.form.name);
        } else {
          await this.createTemplate(templateData);
          this.$notify.templates.createSuccess(this.form.name);
        }

        this.$router.push("/");
      } catch (error) {
        console.error("Error saving template:", error);
        if (this.isEdit) {
          this.$notify.templates.updateError(
            error.message || "Не удалось обновить шаблон"
          );
        } else {
          this.$notify.templates.createError(
            error.message || "Не удалось создать шаблон"
          );
        }
      }
    },

    handleCancel() {
      this.$router.push("/");
    },

    formatDate(dateString) {
      return formatDateHelper(dateString);
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
        this.$notify.templates.deleteSuccess(this.form.name);
        this.$router.push("/");
      } catch (error) {
        console.error("Error deleting template:", error);
        this.$notify.templates.deleteError(
          error.message || "Не удалось удалить шаблон"
        );
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
  grid-template-columns: 1fr 350px;
  gap: 0;
}

.form-section {
  padding: 2rem;

  &:first-child {
    border-right: 1px solid $border-color;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

// Адаптивность
@media (max-width: 1024px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-section {
    &:first-child {
      border-right: none;
      border-bottom: 1px solid $border-color;
    }
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .form-section {
    padding: 1.5rem;
  }
}
</style>
