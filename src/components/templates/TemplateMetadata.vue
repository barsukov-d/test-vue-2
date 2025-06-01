<template>
  <div class="template-metadata">
    <h3>Теги и метаданные</h3>

    <div class="form-group">
      <label class="form-label">Теги</label>
      <div class="tags-input">
        <div class="selected-tags">
          <span v-for="(tag, index) in form.tags" :key="index" class="tag">
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
      <small class="form-hint">
        Добавьте теги для лучшего поиска и категоризации шаблона
      </small>
    </div>

    <!-- Популярные теги -->
    <div class="popular-tags" v-if="!readonly && popularTags.length">
      <label class="form-label">Популярные теги:</label>
      <div class="tag-suggestions">
        <button
          v-for="tag in availablePopularTags"
          :key="tag"
          @click="addPopularTag(tag)"
          class="tag-suggestion"
          type="button"
        >
          {{ tag }}
        </button>
      </div>
    </div>

    <!-- Метаинформация для редактирования -->
    <div v-if="isEdit && template" class="meta-info">
      <h4>Информация о шаблоне</h4>
      <div class="meta-item"><strong>ID:</strong> {{ template.id }}</div>
      <div class="meta-item">
        <strong>Создан:</strong> {{ formatDate(template.created_at) }}
      </div>
      <div v-if="template.created_by" class="meta-item">
        <strong>Автор:</strong> {{ template.created_by }}
      </div>
      <div
        v-if="
          template.updated_at && template.updated_at !== template.created_at
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
</template>

<script>
import { formatDate } from "@/utils/helpers";

export default {
  name: "TemplateMetadata",

  props: {
    form: {
      type: Object,
      required: true,
    },
    template: {
      type: Object,
      default: null,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["update:form"],

  data() {
    return {
      newTag: "",
      popularTags: [
        "баннер",
        "реклама",
        "социальные сети",
        "презентация",
        "логотип",
        "флаер",
        "постер",
        "визитка",
        "обложка",
        "инфографика",
      ],
    };
  },

  computed: {
    availablePopularTags() {
      return this.popularTags.filter((tag) => !this.form.tags.includes(tag));
    },
  },

  methods: {
    updateField(field, value) {
      this.$emit("update:form", {
        ...this.form,
        [field]: value,
      });
    },

    addTag() {
      const tag = this.newTag.trim();
      if (tag && !this.form.tags.includes(tag)) {
        this.updateField("tags", [...this.form.tags, tag]);
        this.newTag = "";
      }
    },

    addPopularTag(tag) {
      if (!this.form.tags.includes(tag)) {
        this.updateField("tags", [...this.form.tags, tag]);
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
      const newTags = [...this.form.tags];
      newTags.splice(index, 1);
      this.updateField("tags", newTags);
    },

    formatDate(dateString) {
      return formatDate(dateString);
    },
  },
};
</script>

<style lang="scss" scoped>
@use "@/styles/variables" as *;

.template-metadata {
  h3 {
    margin: 0 0 1.5rem;
    font-size: 1.25rem;
    font-weight: 600;
    color: $text-primary;
    border-bottom: 1px solid $border-color;
    padding-bottom: 0.75rem;
  }

  h4 {
    margin: 1.5rem 0 1rem;
    font-size: 1rem;
    font-weight: 600;
    color: $text-primary;
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

.form-hint {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: $text-muted;
}

.tags-input {
  border: 1px solid $border-color;
  border-radius: $border-radius;
  padding: 0.5rem;
  background: $white;
  min-height: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &:focus-within {
    border-color: $primary-color;
    box-shadow: 0 0 0 3px rgba($primary-color, 0.1);
  }
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: $primary-color;
  color: $white;
  border-radius: $border-radius-sm;
  font-size: 0.75rem;
  font-weight: 500;
}

.tag-remove {
  background: none;
  border: none;
  color: $white;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  padding: 0;
  margin-left: 0.125rem;

  &:hover {
    opacity: 0.8;
  }
}

.tag-input {
  border: none;
  outline: none;
  padding: 0.25rem 0;
  font-size: 0.875rem;
  background: transparent;
  flex: 1;

  &::placeholder {
    color: $text-muted;
  }
}

.popular-tags {
  margin-bottom: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid $border-color;
}

.tag-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.5rem;
}

.tag-suggestion {
  padding: 0.25rem 0.5rem;
  background: $gray-100;
  border: 1px solid $border-color;
  border-radius: $border-radius-sm;
  font-size: 0.75rem;
  color: $text-primary;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: $primary-color;
    color: $white;
    border-color: $primary-color;
  }
}

.meta-info {
  padding-top: 1.5rem;
  border-top: 1px solid $border-color;
}

.meta-item {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: $text-secondary;

  strong {
    color: $text-primary;
  }
}
</style>
