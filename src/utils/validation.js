// Валидация для форм шаблонов

export const validateTemplateForm = (formData) => {
  const errors = {};

  // Валидация title (обязательное поле)
  if (!formData.title || formData.title.trim() === "") {
    errors.title = "Название шаблона обязательно для заполнения";
  } else if (formData.title.length < 3) {
    errors.title = "Название должно содержать минимум 3 символа";
  } else if (formData.title.length > 100) {
    errors.title = "Название не должно превышать 100 символов";
  }

  // Валидация description (необязательное, но если есть - проверяем длину)
  if (formData.description && formData.description.length > 500) {
    errors.description = "Описание не должно превышать 500 символов";
  }

  // Валидация width
  if (formData.width) {
    const width = Number(formData.width);
    if (isNaN(width) || width <= 0) {
      errors.width = "Ширина должна быть положительным числом";
    } else if (width > 10000) {
      errors.width = "Ширина не должна превышать 10000 пикселей";
    }
  }

  // Валидация height
  if (formData.height) {
    const height = Number(formData.height);
    if (isNaN(height) || height <= 0) {
      errors.height = "Высота должна быть положительным числом";
    } else if (height > 10000) {
      errors.height = "Высота не должна превышать 10000 пикселей";
    }
  }

  // Валидация tags
  if (formData.tags && Array.isArray(formData.tags)) {
    if (formData.tags.length > 10) {
      errors.tags = "Нельзя указать больше 10 тегов";
    }

    // Проверяем каждый тег
    const invalidTags = formData.tags.filter(
      (tag) =>
        typeof tag !== "string" || tag.trim().length === 0 || tag.length > 50
    );

    if (invalidTags.length > 0) {
      errors.tags =
        "Каждый тег должен быть непустой строкой длиной до 50 символов";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Валидация для формы логина
export const validateLoginForm = (formData) => {
  const errors = {};

  // Валидация email
  if (!formData.email || formData.email.trim() === "") {
    errors.email = "Email обязателен для заполнения";
  } else if (!isValidEmail(formData.email)) {
    errors.email = "Введите корректный email адрес";
  }

  // Валидация password
  if (!formData.password || formData.password.trim() === "") {
    errors.password = "Пароль обязателен для заполнения";
  } else if (formData.password.length < 6) {
    errors.password = "Пароль должен содержать минимум 6 символов";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Проверка валидности email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Проверка файла изображения
export const validateImageFile = (file) => {
  const errors = [];

  if (!file) {
    return { isValid: true, errors: [] };
  }

  // Проверка типа файла
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    errors.push(
      "Поддерживаются только изображения формата JPEG, PNG, GIF, WebP"
    );
  }

  // Проверка размера файла (максимум 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB в байтах
  if (file.size > maxSize) {
    errors.push("Размер файла не должен превышать 5MB");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Общая функция для очистки строк
export const sanitizeString = (str) => {
  if (typeof str !== "string") return "";
  return str.trim().replace(/\s+/g, " ");
};

// Функция для debounce (для поиска)
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
