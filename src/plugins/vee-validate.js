import Vue from "vue";
import {
  ValidationProvider,
  ValidationObserver,
  extend,
  localize,
} from "vee-validate";
import {
  required,
  email,
  min,
  max,
  regex,
  size,
} from "vee-validate/dist/rules";

// Регистрируем компоненты
Vue.component("ValidationProvider", ValidationProvider);
Vue.component("ValidationObserver", ValidationObserver);

// Устанавливаем базовые правила валидации
extend("required", required);
extend("email", email);
extend("min", min);
extend("max", max);
extend("regex", regex);
extend("size", size);

// Кастомные правила валидации
extend("pixel_format", {
  validate: (value) => {
    return /^\d+px$/.test(value);
  },
  message: "Поле должно быть в формате: цифры + px (например: 1920px)",
});

extend("json_format", {
  validate: (value) => {
    if (!value) return true; // Позволяем пустые значения, required отдельно проверит
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  },
  message: "Поле должно содержать корректный JSON",
});

// Локализация сообщений
localize("ru", {
  messages: {
    required: "Поле {_field_} обязательно для заполнения",
    email: "Поле {_field_} должно содержать корректный email адрес",
    min: "Поле {_field_} должно содержать минимум {length} символов",
    max: "Поле {_field_} должно содержать максимум {length} символов",
    regex: "Поле {_field_} имеет неверный формат",
    size: "Размер файла {_field_} должен быть меньше {size}KB",
  },
  names: {
    email: "Email",
    password: "Пароль",
    name: "Название",
    description: "Описание",
    width: "Ширина",
    height: "Высота",
    objectsJson: "JSON объекты",
    preview_image: "Превью изображение",
  },
});

// Устанавливаем русскую локализацию как активную
localize("ru");
