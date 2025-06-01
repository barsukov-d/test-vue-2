/**
 * Централизованный сервис для управления уведомлениями
 * Используется для показа toast уведомлений во всем приложении
 */

class NotificationService {
  constructor() {
    this.eventBus = null;
  }

  /**
   * Инициализация сервиса с экземпляром Vue для доступа к event bus
   * @param {Object} vueInstance - экземпляр Vue
   */
  init(vueInstance) {
    this.eventBus = vueInstance;
  }

  /**
   * Показать уведомление об успехе
   * @param {string} title - заголовок уведомления
   * @param {string} message - текст уведомления
   */
  success(title, message = "") {
    this.show({
      title,
      message,
      variant: "success",
    });
  }

  /**
   * Показать уведомление об ошибке
   * @param {string} title - заголовок уведомления
   * @param {string} message - текст уведомления
   */
  error(title, message = "") {
    this.show({
      title,
      message,
      variant: "error",
    });
  }

  /**
   * Показать информационное уведомление
   * @param {string} title - заголовок уведомления
   * @param {string} message - текст уведомления
   */
  info(title, message = "") {
    this.show({
      title,
      message,
      variant: "info",
    });
  }

  /**
   * Показать предупреждение
   * @param {string} title - заголовок уведомления
   * @param {string} message - текст уведомления
   */
  warning(title, message = "") {
    this.show({
      title,
      message,
      variant: "warning",
    });
  }

  /**
   * Показать уведомление с кастомными параметрами
   * @param {Object} options - опции уведомления
   * @param {string} options.title - заголовок
   * @param {string} options.message - сообщение
   * @param {string} options.variant - тип (success, error, info, warning)
   * @param {number} options.duration - длительность показа в мс
   */
  show({ title, message = "", variant = "info", duration = 5000 }) {
    if (!this.eventBus) {
      console.warn("NotificationService not initialized. Call init() first.");
      console.log(`[${variant.toUpperCase()}] ${title}: ${message}`);
      return;
    }

    this.eventBus.$emit("show-toast", {
      title,
      message,
      variant,
      duration,
    });
  }

  /**
   * Уведомления для системы авторизации
   */
  auth = {
    loginSuccess: (username = "") => {
      this.success(
        "Добро пожаловать!",
        username ? `Привет, ${username}!` : "Вы успешно вошли в систему"
      );
    },

    loginError: (message = "Ошибка авторизации") => {
      this.error("Ошибка входа", message);
    },

    logoutSuccess: () => {
      this.success("До свидания!", "Вы успешно вышли из системы");
    },

    logoutError: (message = "Ошибка при выходе") => {
      this.error("Ошибка", message);
    },

    sessionExpired: () => {
      this.warning("Сессия истекла", "Пожалуйста, войдите в систему снова");
    },

    unauthorized: () => {
      this.error(
        "Доступ запрещен",
        "У вас нет прав для выполнения этого действия"
      );
    },
  };

  /**
   * Уведомления для работы с шаблонами
   */
  templates = {
    createSuccess: (name = "") => {
      this.success(
        "Шаблон создан",
        name ? `Шаблон "${name}" успешно создан` : "Шаблон успешно создан"
      );
    },

    updateSuccess: (name = "") => {
      this.success(
        "Шаблон обновлен",
        name ? `Шаблон "${name}" успешно обновлен` : "Шаблон успешно обновлен"
      );
    },

    deleteSuccess: (name = "") => {
      this.success(
        "Шаблон удален",
        name ? `Шаблон "${name}" успешно удален` : "Шаблон успешно удален"
      );
    },

    createError: (message = "Не удалось создать шаблон") => {
      this.error("Ошибка создания", message);
    },

    updateError: (message = "Не удалось обновить шаблон") => {
      this.error("Ошибка обновления", message);
    },

    deleteError: (message = "Не удалось удалить шаблон") => {
      this.error("Ошибка удаления", message);
    },

    loadError: (message = "Не удалось загрузить шаблон") => {
      this.error("Ошибка загрузки", message);
    },
  };

  /**
   * Уведомления для работы с файлами
   */
  files = {
    uploadSuccess: (filename = "") => {
      this.success(
        "Файл загружен",
        filename
          ? `Файл "${filename}" успешно загружен`
          : "Файл успешно загружен"
      );
    },

    uploadError: (message = "Не удалось загрузить файл") => {
      this.error("Ошибка загрузки", message);
    },

    deleteSuccess: (filename = "") => {
      this.success(
        "Файл удален",
        filename ? `Файл "${filename}" успешно удален` : "Файл успешно удален"
      );
    },

    deleteError: (message = "Не удалось удалить файл") => {
      this.error("Ошибка удаления", message);
    },

    invalidFormat: (allowedFormats = []) => {
      const formats = allowedFormats.length
        ? allowedFormats.join(", ")
        : "поддерживаемый формат";
      this.error(
        "Неверный формат файла",
        `Пожалуйста, выберите файл в формате: ${formats}`
      );
    },

    fileTooLarge: (maxSize = "5MB") => {
      this.error(
        "Файл слишком большой",
        `Максимальный размер файла: ${maxSize}`
      );
    },
  };

  /**
   * Общие системные уведомления
   */
  system = {
    saveDraft: () => {
      this.info("Черновик сохранен", "Ваши изменения автоматически сохранены");
    },

    connectionError: () => {
      this.error(
        "Ошибка подключения",
        "Проверьте интернет-соединение и повторите попытку"
      );
    },

    validationError: () => {
      this.error("Ошибка валидации", "Пожалуйста, исправьте ошибки в форме");
    },

    unexpectedError: () => {
      this.error(
        "Неожиданная ошибка",
        "Что-то пошло не так. Попробуйте еще раз"
      );
    },

    maintenance: () => {
      this.warning("Техническое обслуживание", "Система временно недоступна");
    },
  };
}

// Создаем единственный экземпляр сервиса
export const notificationService = new NotificationService();

// Экспорт по умолчанию для удобства импорта
export default notificationService;
