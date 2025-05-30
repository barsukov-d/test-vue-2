import { templatesService } from "@/services/templatesService";
import { extractUniqueTags } from "@/utils/helpers";

// Начальное состояние
const state = {
  templates: [],
  currentTemplate: null,
  categories: [],
  tags: [],
  isLoading: false,
  error: null,
  filters: {
    search: "",
    tags: [],
    company_id: null,
    collection_id: null,
  },
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
  },
};

// Getters
const getters = {
  templates: (state) => state.templates,
  currentTemplate: (state) => state.currentTemplate,
  categories: (state) => state.categories,
  tags: (state) => state.tags,
  isLoading: (state) => state.isLoading,
  error: (state) => state.error,

  // Доступные теги из всех шаблонов
  availableTags: (state) => {
    // Комбинируем теги из API и локальных шаблонов
    const localTags = extractUniqueTags(state.templates);
    const apiTags = state.tags
      .filter((tag) => tag != null) // Фильтруем null/undefined
      .map((tag) => (typeof tag === "string" ? tag : tag.name || ""))
      .filter((name) => name); // Убираем пустые строки
    return [...new Set([...localTags, ...apiTags])];
  },

  // Фильтрованные шаблоны (только для клиентской фильтрации)
  filteredTemplates: (state) => {
    let filtered = [...state.templates];

    // Локальная фильтрация применяется только если есть данные
    if (state.filters.search) {
      const query = state.filters.search.toLowerCase();
      filtered = filtered.filter(
        (template) =>
          template.name?.toLowerCase().includes(query) ||
          template.description?.toLowerCase().includes(query) ||
          template.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  },

  // Статистика
  templateStats: (state) => {
    const total = state.templates.length;
    const published = state.templates.filter(
      (t) => t.is_public === true
    ).length;
    const privateTemplates = state.templates.filter(
      (t) => t.is_public === false
    ).length;

    return { total, published, private: privateTemplates };
  },

  // Пагинация
  totalPages: (state) => {
    return Math.ceil(state.pagination.total / state.pagination.limit);
  },

  hasNextPage: (state, getters) => {
    return state.pagination.page < getters.totalPages;
  },

  hasPrevPage: (state) => {
    return state.pagination.page > 1;
  },
};

// Mutations
const mutations = {
  SET_LOADING(state, loading) {
    state.isLoading = loading;
  },

  SET_ERROR(state, error) {
    state.error = error;
  },

  SET_TEMPLATES(state, templates) {
    state.templates = Array.isArray(templates) ? templates : [];
  },

  SET_CURRENT_TEMPLATE(state, template) {
    state.currentTemplate = template;
  },

  SET_CATEGORIES(state, categories) {
    state.categories = Array.isArray(categories) ? categories : [];
  },

  SET_TAGS(state, tags) {
    state.tags = Array.isArray(tags) ? tags : [];
  },

  ADD_TEMPLATE(state, template) {
    if (template && template.id) {
      state.templates.unshift(template);
    }
  },

  UPDATE_TEMPLATE(state, updatedTemplate) {
    if (!updatedTemplate || !updatedTemplate.id) return;

    const index = state.templates.findIndex((t) => t.id === updatedTemplate.id);
    if (index !== -1) {
      state.templates.splice(index, 1, updatedTemplate);
    }

    // Обновляем currentTemplate если это он
    if (
      state.currentTemplate &&
      state.currentTemplate.id === updatedTemplate.id
    ) {
      state.currentTemplate = updatedTemplate;
    }
  },

  REMOVE_TEMPLATE(state, templateId) {
    state.templates = state.templates.filter((t) => t.id !== templateId);

    // Очищаем currentTemplate если это он
    if (state.currentTemplate && state.currentTemplate.id === templateId) {
      state.currentTemplate = null;
    }
  },

  SET_FILTERS(state, filters) {
    state.filters = { ...state.filters, ...filters };
  },

  SET_PAGINATION(state, pagination) {
    state.pagination = { ...state.pagination, ...pagination };
  },

  RESET_FILTERS(state) {
    state.filters = {
      search: "",
      tags: [],
      company_id: null,
      collection_id: null,
    };
  },
};

// Actions
const actions = {
  // Загрузка всех шаблонов
  async fetchTemplates({ commit, state }) {
    commit("SET_LOADING", true);
    commit("SET_ERROR", null);

    try {
      const params = {
        page: state.pagination.page,
        limit: state.pagination.limit,
        search: state.filters.search || undefined,
        tags:
          state.filters.tags.length > 0
            ? state.filters.tags.join(",")
            : undefined,
        company_id: state.filters.company_id || undefined,
        collection_id: state.filters.collection_id || undefined,
      };

      // Удаляем undefined значения
      Object.keys(params).forEach((key) => {
        if (params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await templatesService.getTemplates(params);

      commit("SET_TEMPLATES", response.data);
      commit("SET_PAGINATION", {
        total: response.total,
        page: response.page,
        limit: response.limit,
      });

      return response;
    } catch (error) {
      console.error("Fetch templates error:", error);
      commit("SET_ERROR", error.message || "Ошибка загрузки шаблонов");
      throw error;
    } finally {
      commit("SET_LOADING", false);
    }
  },

  // Загрузка категорий
  async fetchCategories({ commit }) {
    try {
      const categories = await templatesService.getCategories();
      commit("SET_CATEGORIES", categories);
      return categories;
    } catch (error) {
      console.error("Fetch categories error:", error);
      // Не показываем ошибку пользователю для категорий
      return [];
    }
  },

  // Загрузка тегов
  async fetchTags({ commit }) {
    try {
      const tags = await templatesService.getTags();
      commit("SET_TAGS", tags);
      return tags;
    } catch (error) {
      console.error("Fetch tags error:", error);
      // Не показываем ошибку пользователю для тегов
      return [];
    }
  },

  // Загрузка конкретного шаблона
  async fetchTemplate({ commit }, templateId) {
    commit("SET_LOADING", true);
    commit("SET_ERROR", null);

    try {
      const template = await templatesService.getTemplate(templateId);
      commit("SET_CURRENT_TEMPLATE", template);
      return template;
    } catch (error) {
      console.error("Fetch template error:", error);
      commit("SET_ERROR", error.message || "Ошибка загрузки шаблона");
      throw error;
    } finally {
      commit("SET_LOADING", false);
    }
  },

  // Создание нового шаблона
  async createTemplate({ commit }, templateData) {
    commit("SET_LOADING", true);
    commit("SET_ERROR", null);

    try {
      const newTemplate = await templatesService.createTemplate(templateData);
      commit("ADD_TEMPLATE", newTemplate);
      commit("SET_CURRENT_TEMPLATE", newTemplate);
      return newTemplate;
    } catch (error) {
      console.error("Create template error:", error);
      commit("SET_ERROR", error.message || "Ошибка создания шаблона");
      throw error;
    } finally {
      commit("SET_LOADING", false);
    }
  },

  // Обновление шаблона
  async updateTemplate({ commit }, { id, data }) {
    commit("SET_LOADING", true);
    commit("SET_ERROR", null);

    try {
      const updatedTemplate = await templatesService.updateTemplate(id, data);
      commit("UPDATE_TEMPLATE", updatedTemplate);
      return updatedTemplate;
    } catch (error) {
      console.error("Update template error:", error);
      commit("SET_ERROR", error.message || "Ошибка обновления шаблона");
      throw error;
    } finally {
      commit("SET_LOADING", false);
    }
  },

  // Удаление шаблона
  async deleteTemplate({ commit }, templateId) {
    commit("SET_LOADING", true);
    commit("SET_ERROR", null);

    try {
      await templatesService.deleteTemplate(templateId);
      commit("REMOVE_TEMPLATE", templateId);
      return true;
    } catch (error) {
      console.error("Delete template error:", error);
      commit("SET_ERROR", error.message || "Ошибка удаления шаблона");
      throw error;
    } finally {
      commit("SET_LOADING", false);
    }
  },

  // Дублирование шаблона
  async duplicateTemplate({ commit }, templateId) {
    commit("SET_LOADING", true);
    commit("SET_ERROR", null);

    try {
      const duplicatedTemplate = await templatesService.duplicateTemplate(
        templateId
      );
      commit("ADD_TEMPLATE", duplicatedTemplate);
      return duplicatedTemplate;
    } catch (error) {
      console.error("Duplicate template error:", error);
      commit("SET_ERROR", error.message || "Ошибка дублирования шаблона");
      throw error;
    } finally {
      commit("SET_LOADING", false);
    }
  },

  // Переключение публичности шаблона
  async toggleTemplateVisibility({ commit }, { id, isPublic }) {
    commit("SET_LOADING", true);
    commit("SET_ERROR", null);

    try {
      const updatedTemplate = await templatesService.togglePublic(id, isPublic);
      commit("UPDATE_TEMPLATE", updatedTemplate);
      return updatedTemplate;
    } catch (error) {
      console.error("Toggle visibility error:", error);
      commit("SET_ERROR", error.message || "Ошибка изменения видимости");
      throw error;
    } finally {
      commit("SET_LOADING", false);
    }
  },

  // Поиск шаблонов
  async searchTemplates({ commit }, { query, filters = {} }) {
    commit("SET_LOADING", true);
    commit("SET_ERROR", null);

    try {
      const response = await templatesService.searchTemplates(query, filters);
      commit("SET_TEMPLATES", response.data);
      commit("SET_PAGINATION", {
        total: response.total,
        page: 1,
        limit: 12,
      });
      return response;
    } catch (error) {
      console.error("Search templates error:", error);
      commit("SET_ERROR", error.message || "Ошибка поиска шаблонов");
      throw error;
    } finally {
      commit("SET_LOADING", false);
    }
  },

  // Загрузка файла
  async uploadFile({ commit }, { file, type = "image" }) {
    commit("SET_LOADING", true);
    commit("SET_ERROR", null);

    try {
      const response = await templatesService.uploadFile(file, type);
      return response;
    } catch (error) {
      console.error("Upload file error:", error);
      commit("SET_ERROR", error.message || "Ошибка загрузки файла");
      throw error;
    } finally {
      commit("SET_LOADING", false);
    }
  },

  // Установка фильтров
  setFilters({ commit, dispatch }, filters) {
    commit("SET_FILTERS", filters);
    commit("SET_PAGINATION", { page: 1 }); // Сбрасываем на первую страницу
    return dispatch("fetchTemplates");
  },

  // Установка пагинации
  setPagination({ commit, dispatch }, pagination) {
    commit("SET_PAGINATION", pagination);
    return dispatch("fetchTemplates");
  },

  // Сброс фильтров
  resetFilters({ commit, dispatch }) {
    commit("RESET_FILTERS");
    commit("SET_PAGINATION", { page: 1 });
    return dispatch("fetchTemplates");
  },

  // Очистка текущего шаблона
  clearCurrentTemplate({ commit }) {
    commit("SET_CURRENT_TEMPLATE", null);
  },

  // Очистка ошибок
  clearError({ commit }) {
    commit("SET_ERROR", null);
  },

  // Инициализация - загружает базовые данные
  async initialize({ dispatch }) {
    try {
      await Promise.all([
        dispatch("fetchTemplates"),
        dispatch("fetchCategories"),
        dispatch("fetchTags"),
      ]);
    } catch (error) {
      console.error("Templates initialization error:", error);
      // Не прерываем инициализацию из-за ошибок
    }
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
