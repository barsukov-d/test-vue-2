<template>
  <BaseCard
    :hoverable="true"
    :clickable="true"
    @click="$emit('edit', template)"
    class="template-card"
  >
    <!-- Превью изображения -->
    <div class="template-preview">
      <img
        v-if="template.preview_image"
        :src="template.preview_image"
        :alt="template.name"
        @error="handleImageError"
      />
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
        <span>Превью недоступно</span>
      </div>
    </div>

    <!-- Контент карточки -->
    <div class="template-content">
      <h3 class="template-name">{{ template.name }}</h3>

      <!-- Размеры шаблона -->
      <div v-if="template.width && template.height" class="template-dimensions">
        {{ template.width }} × {{ template.height }}
      </div>

      <p v-if="template.description" class="template-description">
        {{ truncatedDescription }}
      </p>

      <!-- Теги -->
      <div
        v-if="template.tags && template.tags.length > 0"
        class="template-tags"
      >
        <span v-for="tag in template.tags.slice(0, 3)" :key="tag" class="tag">
          {{ tag }}
        </span>
        <span v-if="template.tags.length > 3" class="tag-more">
          +{{ template.tags.length - 3 }}
        </span>
      </div>

      <!-- Метаинформация -->
      <div class="template-meta">
        <span class="created-date">
          {{ formatDate(template.created_at) }}
        </span>
        <span
          v-if="template.updated_at !== template.created_at"
          class="updated-date"
        >
          · обновлен {{ formatDate(template.updated_at) }}
        </span>
        <span v-if="template.created_by" class="author">
          · {{ template.created_by }}
        </span>
      </div>
    </div>

    <!-- Действия (показываются при наведении) -->
    <div class="template-actions" @click.stop>
      <BaseButton
        size="small"
        variant="secondary"
        @click="$emit('edit', template)"
      >
        Редактировать
      </BaseButton>

      <BaseButton
        size="small"
        variant="outline-secondary"
        @click="$emit('delete', template)"
      >
        Удалить
      </BaseButton>
    </div>

    <!-- Индикатор статуса -->
    <div v-if="template.status" :class="['status-indicator', template.status]">
      {{ getStatusText(template.status) }}
    </div>
  </BaseCard>
</template>

<script>
import { formatRelativeDate } from "@/utils/helpers";
import BaseCard from "@/components/ui/BaseCard.vue";
import BaseButton from "@/components/ui/BaseButton.vue";

export default {
  name: "TemplateCard",

  components: {
    BaseCard,
    BaseButton,
  },

  props: {
    template: {
      type: Object,
      required: true,
      validator: (template) => {
        return template && typeof template.id !== "undefined" && template.name;
      },
    },
  },

  emits: ["edit", "delete"],

  computed: {
    truncatedDescription() {
      if (!this.template.description) return "";
      const maxLength = 120;
      return this.template.description.length > maxLength
        ? this.template.description.substring(0, maxLength) + "..."
        : this.template.description;
    },
  },

  methods: {
    handleImageError(event) {
      // Скрываем битую картинку и показываем placeholder
      event.target.style.display = "none";
    },

    formatDate(dateString) {
      return formatRelativeDate(dateString);
    },

    getStatusText(status) {
      const statusMap = {
        draft: "Черновик",
        published: "Опубликован",
        archived: "Архив",
      };
      return statusMap[status] || status;
    },
  },
};
</script>

<style lang="scss" scoped>
@use "@/styles/variables" as *;

.template-card {
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    .template-actions {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

.template-preview {
  position: relative;
  width: 100%;
  height: 200px;
  background: $bg-secondary;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  &:hover img {
    transform: scale(1.05);
  }
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: $text-muted;
  background: $bg-secondary;

  svg {
    margin-bottom: 0.5rem;
    opacity: 0.6;
  }

  span {
    font-size: 0.875rem;
  }
}

.template-content {
  padding: 1.5rem;
}

.template-name {
  margin: 0 0 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: $text-primary;
  line-height: 1.3;
}

.template-description {
  margin: 0 0 1rem;
  color: $text-secondary;
  font-size: 0.9rem;
  line-height: 1.5;
}

.template-dimensions {
  margin-bottom: 1rem;
  color: $text-muted;
  font-size: 0.8rem;
}

.template-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-bottom: 1rem;
}

.tag {
  padding: 0.25rem 0.5rem;
  background: rgba($primary-color, 0.1);
  color: $primary-color;
  border-radius: $border-radius-sm;
  font-size: 0.75rem;
  font-weight: 500;
}

.tag-more {
  padding: 0.25rem 0.5rem;
  background: $bg-secondary;
  color: $text-muted;
  border-radius: $border-radius-sm;
  font-size: 0.75rem;
}

.template-meta {
  font-size: 0.8rem;
  color: $text-muted;
}

.template-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem 1.5rem;
  background: linear-gradient(transparent, rgba($white, 0.95));
  backdrop-filter: blur(8px);
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transform: translateY(100%);
  transition: all 0.3s ease;
}

.status-indicator {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.25rem 0.5rem;
  border-radius: $border-radius-sm;
  font-size: 0.75rem;
  font-weight: 500;
  background: $white;
  border: 1px solid $border-color;

  &.draft {
    background: rgba($warning-color, 0.1);
    color: $warning-dark;
    border-color: rgba($warning-color, 0.3);
  }

  &.published {
    background: rgba($success-color, 0.1);
    color: $success-dark;
    border-color: rgba($success-color, 0.3);
  }

  &.archived {
    background: rgba($secondary-color, 0.1);
    color: $secondary-dark;
    border-color: rgba($secondary-color, 0.3);
  }
}

// Адаптивность
@media (max-width: 768px) {
  .template-content {
    padding: 1rem;
  }

  .template-actions {
    padding: 1rem;
    opacity: 1;
    transform: translateY(0);
    position: static;
    background: $bg-primary;
    backdrop-filter: none;
  }

  .template-preview {
    height: 150px;
  }
}
</style>
