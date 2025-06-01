import apiClient from "./api";

export const templatesService = {
  // Получение списка Canvas Templates
  async getTemplates(params = {}) {
    try {
      const response = await apiClient.get("/api/v1/canvas_templates");

      // Нормализуем ответ для нашего store
      // API может возвращать данные в разных форматах
      const data = response.data.data || response.data;
      let templates = Array.isArray(data) ? data : [data].filter(Boolean);

      // Клиентская фильтрация по поисковому запросу
      if (params.search && params.search.trim()) {
        const searchQuery = params.search.toLowerCase().trim();
        templates = templates.filter(
          (template) =>
            template.name?.toLowerCase().includes(searchQuery) ||
            template.description?.toLowerCase().includes(searchQuery) ||
            (template.tags &&
              Array.isArray(template.tags) &&
              template.tags.some((tag) =>
                tag.toLowerCase().includes(searchQuery)
              ))
        );
      }

      // Клиентская фильтрация по тегам
      if (params.tags && params.tags.trim()) {
        const tagsArray = params.tags.split(",").map((tag) => tag.trim());
        templates = templates.filter(
          (template) =>
            template.tags &&
            Array.isArray(template.tags) &&
            tagsArray.some((tag) => template.tags.includes(tag))
        );
      }

      return {
        data: templates,
        total: templates.length,
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
      console.log("=== CREATE TEMPLATE DEBUG ===");
      console.log("Input templateData:", templateData);

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

      // Логируем содержимое FormData
      console.log("=== FORM DATA CONTENTS ===");
      for (let [key, value] of formData.entries()) {
        console.log(key + ":", value);
      }

      console.log("Request URL:", "/api/v1/canvas_templates");
      console.log("Request method: POST");

      const response = await apiClient.post(
        "/api/v1/canvas_templates",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("=== CREATE SUCCESS ===");
      console.log("Response:", response.data);

      return response.data.data || response.data;
    } catch (error) {
      console.error("=== CREATE ERROR ===");
      console.error("Template create error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Error headers:", error.response?.headers);

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
      console.log("=== UPDATE TEMPLATE DEBUG ===");
      console.log("Template ID:", id);
      console.log("Input templateData:", templateData);

      const formData = new FormData();

      // Обязательные поля
      formData.append("name", templateData.name);
      formData.append("width", templateData.width);
      formData.append("height", templateData.height);
      formData.append("objects", JSON.stringify(templateData.objects)); // JSON строка

      // Добавляем _method=PATCH для Laravel method spoofing
      formData.append("_method", "PATCH");

      // Необязательные поля
      if (templateData.description) {
        formData.append("description", templateData.description);
      }

      // Теги - отправляем как массив
      if (templateData.tags && templateData.tags.length > 0) {
        templateData.tags.forEach((tag) => {
          formData.append("tags[]", tag);
        });
      } else {
        // Если тегов нет, отправляем null
        formData.append("tags", "");
      }

      // preview_image как файл
      if (
        templateData.preview_image &&
        templateData.preview_image instanceof File
      ) {
        formData.append("preview_image", templateData.preview_image);
      }

      // Логируем содержимое FormData
      console.log("=== FORM DATA CONTENTS ===");
      for (let [key, value] of formData.entries()) {
        console.log(key + ":", value);
      }

      console.log("Request URL:", `/api/v1/canvas_templates/${id}`);
      console.log("Request method: POST with _method=PATCH");

      // Отправляем POST запрос с _method=PATCH
      const response = await apiClient.post(
        `/api/v1/canvas_templates/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("=== UPDATE SUCCESS ===");
      console.log("Response:", response.data);

      return response.data.data || response.data;
    } catch (error) {
      console.error("=== UPDATE ERROR ===");
      console.error("Template update error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Error headers:", error.response?.headers);

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
      console.log("Deleting template with ID:", id);
      console.log("DELETE URL:", `/api/v1/canvas_templates`);

      const response = await apiClient.delete("/api/v1/canvas_templates", {
        data: {
          id: id,
        },
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Template delete error:", error);
      console.error("Delete request failed for ID:", id);
      console.error("Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        method: error.config?.method,
      });
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
};
