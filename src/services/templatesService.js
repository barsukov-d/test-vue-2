import apiClient from "./api";

export const templatesService = {
  // Получение списка Canvas Templates
  async getTemplates(params = {}) {
    try {
      const requestParams = {};

      // Пагинация
      if (params.page) {
        requestParams["page[number]"] = params.page;
      }

      // Фильтры
      if (params.company_id) {
        requestParams["filter[company_id]"] = params.company_id;
      }

      if (params.collection_id) {
        requestParams["filter[collection_id]"] = params.collection_id;
      }

      // Дополнительные параметры если поддерживаются API
      if (params.search) {
        requestParams.search = params.search;
      }

      if (params.tags) {
        requestParams.tags = params.tags;
      }

      const response = await apiClient.get("/api/v1/canvas_templates", {
        params: requestParams,
      });

      // Нормализуем ответ для нашего store
      // API может возвращать данные в разных форматах
      const data = response.data.data || response.data;
      const templates = Array.isArray(data) ? data : [data].filter(Boolean);

      return {
        data: templates,
        total:
          response.data.meta?.total || response.data.total || templates.length,
        page: response.data.meta?.current_page || params.page || 1,
        limit: response.data.meta?.per_page || params.limit || 20,
        meta: response.data.meta || {},
      };
    } catch (error) {
      console.error("Templates API error:", error);
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Ошибка получения шаблонов"
      );
    }
  },

  // Получение шаблона по ID
  async getTemplate(id) {
    try {
      const response = await apiClient.get(`/api/v1/canvas_templates/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error("Template get error:", error);
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Ошибка получения шаблона"
      );
    }
  },

  // Создание нового шаблона
  async createTemplate(templateData) {
    try {
      const formData = new FormData();

      // Обязательные поля
      formData.append("name", templateData.name);
      formData.append("width", templateData.width);
      formData.append("height", templateData.height);
      formData.append("objects", JSON.stringify(templateData.objects)); // JSON строка

      // Необязательные поля
      if (templateData.description) {
        formData.append("description", templateData.description);
      }

      // Всегда отправляем поле tags
      if (templateData.tags && templateData.tags.length > 0) {
        // Если есть теги, отправляем каждый тег отдельно
        templateData.tags.forEach((tag) => {
          formData.append("tags[]", tag);
        });
      } else {
        // Если тегов нет, отправляем пустое значение чтобы поле существовало
        formData.append("tags", "");
      }

      // preview_image как файл или удаляем если это base64 строка
      if (
        templateData.preview_image &&
        templateData.preview_image instanceof File
      ) {
        formData.append("preview_image", templateData.preview_image);
      }

      const response = await apiClient.post(
        "/api/v1/canvas_templates",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data.data || response.data;
    } catch (error) {
      console.error("Template create error:", error);
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Ошибка создания шаблона"
      );
    }
  },

  // Обновление шаблона
  async updateTemplate(id, templateData) {
    try {
      const formData = new FormData();

      // Обязательные поля
      formData.append("name", templateData.name);
      formData.append("width", templateData.width);
      formData.append("height", templateData.height);
      formData.append("objects", JSON.stringify(templateData.objects)); // JSON строка

      // Необязательные поля
      if (templateData.description) {
        formData.append("description", templateData.description);
      }

      // Всегда отправляем поле tags
      if (templateData.tags && templateData.tags.length > 0) {
        // Если есть теги, отправляем каждый тег отдельно
        templateData.tags.forEach((tag) => {
          formData.append("tags[]", tag);
        });
      } else {
        // Если тегов нет, отправляем пустое значение чтобы поле существовало
        formData.append("tags", "");
      }

      // preview_image как файл или удаляем если это base64 строка
      if (
        templateData.preview_image &&
        templateData.preview_image instanceof File
      ) {
        formData.append("preview_image", templateData.preview_image);
      }

      const response = await apiClient.put(
        `/api/v1/canvas_templates/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data.data || response.data;
    } catch (error) {
      console.error("Template update error:", error);
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Ошибка обновления шаблона"
      );
    }
  },

  // Удаление шаблона
  async deleteTemplate(id) {
    try {
      const response = await apiClient.delete(`/api/v1/canvas_templates/${id}`);
      return response.data;
    } catch (error) {
      console.error("Template delete error:", error);
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Ошибка удаления шаблона"
      );
    }
  },

  // Получение тегов
  async getTags() {
    try {
      const response = await apiClient.get(
        "/api/v1/canvas_templates/tags/list"
      );
      return response.data.data || response.data;
    } catch (error) {
      console.error("Tags get error:", error);
      // Возвращаем пустой массив если endpoint не найден
      return [];
    }
  },

  // Поиск шаблонов
  async searchTemplates(searchQuery, filters = {}) {
    try {
      // Пробуем использовать обычный endpoint с search параметром
      return await this.getTemplates({
        search: searchQuery,
        ...filters,
      });
    } catch (error) {
      console.error("Template search error:", error);
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Ошибка поиска шаблонов"
      );
    }
  },
};
