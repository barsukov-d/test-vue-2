import { templatesService } from "@/services/templatesService";
import { extractUniqueTags } from "@/utils/helpers";

// Начальное состояние
const state = {
  templates: [],
  currentTemplate: null,
  tags: [],
  isLoading: false,
  error: null,
};

// Getters
const getters = {
  templates: (state) => state.templates,
  currentTemplate: (state) => state.currentTemplate,
  tags: (state) => state.tags,
  isLoading: (state) => state.isLoading,
  error: (state) => state.error,

  // Доступные теги из всех шаблонов
  availableTags: (state) => {
    // Комбинируем теги из API и локальных шаблонов
    const localTags = extractUniqueTags(state.templates);
    const apiTags = state.tags
      .filter((tag) => tag != null) // Фильтруем null и undefined
      .map((tag) => (typeof tag === "string" ? tag : tag.name))
      .filter((tag) => tag != null); // Фильтруем null и undefined после map
    return [...new Set([...localTags, ...apiTags])];
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
};

// Actions
const actions = {
  // Загрузка всех шаблонов
  async fetchTemplates({ commit }) {
    commit("SET_LOADING", true);
    commit("SET_ERROR", null);

    try {
      const response = await templatesService.getTemplates();
      commit("SET_TEMPLATES", response.data);
      return response;
    } catch (error) {
      console.error("Fetch templates error:", error);
      commit("SET_ERROR", error.message || "Ошибка загрузки шаблонов");
      throw error;
    } finally {
      commit("SET_LOADING", false);
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

  // Загрузка файла
  async uploadFile({ commit }, { file }) {
    commit("SET_LOADING", true);
    commit("SET_ERROR", null);

    try {
      // Возвращаем локальный URL для предпросмотра
      const url = URL.createObjectURL(file);
      return url;
    } catch (error) {
      console.error("Upload file error:", error);
      commit("SET_ERROR", error.message || "Ошибка загрузки файла");
      throw error;
    } finally {
      commit("SET_LOADING", false);
    }
  },

  // Очистка текущего шаблона
  clearCurrentTemplate({ commit }) {
    commit("SET_CURRENT_TEMPLATE", null);
  },

  // Инициализация - загружает базовые данные
  async initialize({ dispatch }) {
    try {
      await Promise.all([dispatch("fetchTemplates"), dispatch("fetchTags")]);
    } catch (error) {
      console.error("Templates initialization error:", error);
      // Не блокируем инициализацию из-за ошибок
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
