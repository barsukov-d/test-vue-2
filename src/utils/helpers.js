/**
 * Создает debounced версию функции, которая задерживает выполнение
 * на указанное время после последнего вызова
 * @param {Function} func - Функция для debounce
 * @param {number} wait - Время задержки в миллисекундах
 * @param {boolean} immediate - Выполнить функцию немедленно при первом вызове
 * @returns {Function} Debounced функция
 */
export function debounce(func, wait, immediate = false) {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };

    const callNow = immediate && !timeout;

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func.apply(this, args);
  };
}

/**
 * Создает throttled версию функции, которая выполняется не чаще
 * чем раз в указанное время
 * @param {Function} func - Функция для throttle
 * @param {number} limit - Минимальное время между вызовами в миллисекундах
 * @returns {Function} Throttled функция
 */
export function throttle(func, limit) {
  let inThrottle;

  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Генерирует уникальный ID
 * @returns {string} Уникальный идентификатор
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Форматирует дату в читаемый формат
 * @param {string|Date} date - Дата для форматирования
 * @param {Object} options - Опции форматирования
 * @returns {string} Отформатированная дата
 */
export function formatDate(date, options = {}) {
  if (!date) return "";

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return "";

  const defaultOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  };

  return dateObj.toLocaleDateString("ru-RU", defaultOptions);
}

/**
 * Форматирует размер файла в читаемый формат
 * @param {number} bytes - Размер в байтах
 * @param {number} decimals - Количество знаков после запятой
 * @returns {string} Отформатированный размер
 */
export function formatFileSize(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Обрезает текст до указанной длины с добавлением многоточия
 * @param {string} text - Исходный текст
 * @param {number} maxLength - Максимальная длина
 * @param {string} suffix - Суффикс (по умолчанию '...')
 * @returns {string} Обрезанный текст
 */
export function truncateText(text, maxLength, suffix = "...") {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Копирует текст в буфер обмена
 * @param {string} text - Текст для копирования
 * @returns {Promise<boolean>} Результат операции
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback для старых браузеров
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand("copy");
      textArea.remove();
      return result;
    }
  } catch (error) {
    console.error("Failed to copy text: ", error);
    return false;
  }
}

/**
 * Извлекает теги из массива объектов
 * @param {Array} items - Массив объектов с полем tags
 * @returns {Array} Уникальные теги
 */
export function extractUniqueTags(items) {
  if (!Array.isArray(items)) return [];

  const allTags = items.reduce((tags, item) => {
    if (item?.tags && Array.isArray(item.tags)) {
      // Фильтруем null/undefined значения и пустые строки
      const validTags = item.tags.filter((tag) => tag != null && tag !== "");
      tags.push(...validTags);
    }
    return tags;
  }, []);

  return [...new Set(allTags)].sort();
}

/**
 * Валидирует email адрес
 * @param {string} email - Email для валидации
 * @returns {boolean} Результат валидации
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Безопасное парсинг JSON
 * @param {string} jsonString - JSON строка
 * @param {any} defaultValue - Значение по умолчанию
 * @returns {any} Распарсенный объект или значение по умолчанию
 */
export function safeJsonParse(jsonString, defaultValue = null) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    return defaultValue;
  }
}

/**
 * Создает объект с настройками localStorage
 * @param {string} key - Ключ для localStorage
 * @returns {Object} Объект с методами для работы с localStorage
 */
export function createLocalStorageManager(key) {
  return {
    get(defaultValue = null) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (error) {
        console.warn(`Error reading from localStorage key "${key}":`, error);
        return defaultValue;
      }
    },

    set(value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        console.warn(`Error writing to localStorage key "${key}":`, error);
        return false;
      }
    },

    remove() {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        console.warn(`Error removing localStorage key "${key}":`, error);
        return false;
      }
    },

    clear() {
      try {
        localStorage.clear();
        return true;
      } catch (error) {
        console.warn("Error clearing localStorage:", error);
        return false;
      }
    },
  };
}
