<template>
  <div class="home-view">
    <div class="container">
      <!-- Заголовок и действия -->
      <div class="page-header">
        <div class="page-title">
          <h1 @click="refreshTemplates" class="clickable-title">Шаблоны</h1>
          <p class="page-subtitle">Управление коллекцией шаблонов</p>
        </div>
        <div class="page-actions">
          <BaseButton
            variant="outline-secondary"
            @click="refreshTemplates"
            size="small"
          >
            🔄 Обновить
          </BaseButton>
          <BaseButton variant="primary" @click="createNewTemplate">
            Создать шаблон
          </BaseButton>
        </div>
      </div>

      <!-- Поиск и фильтры -->
      <div class="filters-section">
        <div class="search-filter">
          <BaseInput
            v-model="searchQuery"
            type="search"
            placeholder="Поиск шаблонов..."
            @input="debouncedSearch"
          />
        </div>

        <div class="tags-filter" v-if="availableTags.length > 0">
          <label class="filter-label">Фильтр по тегам:</label>
          <div class="tags-list">
            <button
              v-for="tag in availableTags"
              :key="tag"
              :class="['tag-filter', { active: selectedTags.includes(tag) }]"
              @click="toggleTag(tag)"
            >
              {{ tag }}
            </button>
            <button
              v-if="selectedTags.length > 0"
              class="clear-filters"
              @click="clearFilters"
            >
              Очистить
            </button>
          </div>
        </div>
      </div>

      <!-- Состояние загрузки -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Загрузка шаблонов...</p>
      </div>

      <!-- Ошибка загрузки -->
      <div v-else-if="error" class="error-state">
        <p class="error-message">{{ error }}</p>
        <BaseButton @click="refreshTemplates" variant="secondary">
          Повторить
        </BaseButton>
      </div>

      <!-- Пустое состояние -->
      <div
        v-else-if="filteredTemplates.length === 0 && !searchQuery"
        class="empty-state"
      >
        <div class="empty-content">
          <h3>Пока нет шаблонов</h3>
          <p>Создайте свой первый шаблон, чтобы начать работу</p>
          <BaseButton variant="primary" @click="createNewTemplate">
            Создать шаблон
          </BaseButton>
        </div>
      </div>

      <!-- Результаты поиска пусты -->
      <div
        v-else-if="filteredTemplates.length === 0 && searchQuery"
        class="no-results"
      >
        <h3>Ничего не найдено</h3>
        <p>Попробуйте изменить запрос или очистить фильтры</p>
      </div>

      <!-- Сетка шаблонов -->
      <div v-else class="templates-grid">
        <TemplateCard
          v-for="template in filteredTemplates"
          :key="template.id"
          :template="template"
          @edit="editTemplate"
          @delete="handleDeleteTemplate"
        />
      </div>
    </div>

    <!-- Модальное окно подтверждения удаления -->
    <ConfirmDialog
      v-if="templateToDelete"
      :title="'Удалить шаблон?'"
      :message="`Вы уверены, что хотите удалить шаблон «${templateToDelete.name}»? Это действие нельзя отменить.`"
      :loading="isDeleting"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { debounce } from "@/utils/helpers";
import BaseButton from "@/components/ui/BaseButton.vue";
import BaseInput from "@/components/ui/BaseInput.vue";
import TemplateCard from "@/components/templates/TemplateCard.vue";
import ConfirmDialog from "@/components/ui/ConfirmDialog.vue";

export default {
  name: "HomeView",

  components: {
    BaseButton,
    BaseInput,
    TemplateCard,
    ConfirmDialog,
  },

  data() {
    return {
      searchQuery: "",
      selectedTags: [],
      currentPage: 1,
      templateToDelete: null,
      isDeleting: false,
    };
  },

  computed: {
    ...mapGetters("templates", [
      "templates",
      "isLoading",
      "error",
      "availableTags",
    ]),

    filteredTemplates() {
      let filtered = [...this.templates];

      // Фильтрация по поиску
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (template) =>
            template.name?.toLowerCase().includes(query) ||
            template.description?.toLowerCase().includes(query) ||
            (template.tags &&
              template.tags.some((tag) => tag.toLowerCase().includes(query)))
        );
      }

      // Фильтрация по тегам
      if (this.selectedTags.length > 0) {
        filtered = filtered.filter(
          (template) =>
            template.tags &&
            this.selectedTags.some((tag) => template.tags.includes(tag))
        );
      }

      return filtered;
    },
  },

  async mounted() {
    // Инициализируем данные шаблонов (загружаем шаблоны, категории, теги)
    try {
      await this.initialize();
    } catch (error) {
      console.error("Error initializing templates:", error);
    }
  },

  async activated() {
    // Обновляем список шаблонов каждый раз при возврате на страницу
    try {
      await this.fetchTemplates();
    } catch (error) {
      console.error("Error refreshing templates:", error);
    }
  },

  methods: {
    ...mapActions("templates", {
      initialize: "initialize",
      fetchTemplates: "fetchTemplates",
      deleteTemplateFromStore: "deleteTemplate", // Псевдоним для избежания конфликта
    }),

    debouncedSearch: debounce(function () {
      // Поиск с задержкой для оптимизации
      this.currentPage = 1;
    }, 300),

    toggleTag(tag) {
      if (this.selectedTags.includes(tag)) {
        this.selectedTags = this.selectedTags.filter((t) => t !== tag);
      } else {
        this.selectedTags.push(tag);
      }
      this.currentPage = 1;
    },

    clearFilters() {
      this.selectedTags = [];
      this.searchQuery = "";
      this.currentPage = 1;
    },

    editTemplate(template) {
      this.$router.push(`/template/${template.id}`);
    },

    handleDeleteTemplate(template) {
      this.templateToDelete = template;
    },

    async confirmDelete() {
      if (this.templateToDelete && !this.isDeleting) {
        this.isDeleting = true;
        try {
          await this.deleteTemplateFromStore(this.templateToDelete.id);
          this.$root.$emit("show-toast", {
            title: "Успешно!",
            message: `Шаблон "${this.templateToDelete.name}" удален`,
            variant: "success",
          });
          this.templateToDelete = null;

          // Обновляем список шаблонов после удаления
          await this.fetchTemplates();
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
      }
    },

    cancelDelete() {
      // Не позволяем закрыть модальное окно во время удаления
      if (this.isDeleting) {
        return;
      }
      this.templateToDelete = null;
    },

    changePage(page) {
      this.currentPage = page;
    },

    createNewTemplate() {
      // Check if we're already on the target route to prevent unnecessary navigation
      if (this.$route.path === "/template/new") {
        return;
      }

      // Navigate to create template page with error handling
      this.$router.push("/template/new").catch((err) => {
        // Ignore navigation cancelled errors (these are harmless)
        if (
          err.name !== "NavigationCancelled" &&
          err.name !== "NavigationDuplicated"
        ) {
          console.error("Navigation error:", err);
        }
      });
    },

    refreshTemplates() {
      // Принудительно обновляем список шаблонов
      this.fetchTemplates().catch((error) => {
        console.error("Error refreshing templates:", error);
        this.$root.$emit("show-toast", {
          title: "Ошибка",
          message: "Не удалось обновить список шаблонов",
          variant: "error",
        });
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@use "@/styles/variables" as *;

.home-view {
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
    margin: 0 0 0.5rem;
    font-size: 2rem;
    font-weight: 700;
    color: $text-primary;
  }

  .clickable-title {
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
      color: $primary-color;
    }
  }
}

.page-subtitle {
  margin: 0;
  color: $text-secondary;
  font-size: 1.1rem;
}

.page-actions {
  flex-shrink: 0;
  display: flex;
  gap: 1rem;
}

.filters-section {
  background: $white;
  border: 1px solid $border-color;
  border-radius: $border-radius-lg;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: $box-shadow-sm;
}

.search-filter {
  margin-bottom: 1rem;
}

.tags-filter {
  .filter-label {
    display: block;
    margin-bottom: 0.75rem;
    font-weight: 500;
    color: $text-primary;
  }
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-filter {
  padding: 0.375rem 0.75rem;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  background: $white;
  color: $text-secondary;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: $primary-color;
    color: $primary-color;
  }

  &.active {
    background: $primary-color;
    border-color: $primary-color;
    color: $white;
  }
}

.clear-filters {
  padding: 0.375rem 0.75rem;
  border: 1px solid $danger-color;
  border-radius: $border-radius;
  background: $white;
  color: $danger-color;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: $danger-color;
    color: $white;
  }
}

.loading-state,
.error-state,
.empty-state,
.no-results {
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

.empty-content h3,
.no-results h3 {
  margin-bottom: 0.5rem;
  color: $text-primary;
}

.empty-content p,
.no-results p {
  margin-bottom: 1.5rem;
  color: $text-secondary;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
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

  .templates-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .tags-list {
    justify-content: center;
  }
}
</style>
