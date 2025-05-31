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
 * Форматирует дату в относительный формат (для карточек)
 * @param {string|Date} date - Дата для форматирования
 * @returns {string} Относительная дата
 */
export function formatRelativeDate(date) {
  if (!date) return "";

  try {
    const dateObj = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - dateObj);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return "вчера";
    } else if (diffDays < 7) {
      return `${diffDays} дн. назад`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} нед. назад`;
    } else {
      return dateObj.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  } catch (error) {
    return date;
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
