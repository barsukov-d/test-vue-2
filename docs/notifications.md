# Система уведомлений

Централизованная система уведомлений для показа toast сообщений во всем приложении.

## Использование

### В компонентах Vue

```javascript
// Простые уведомления
this.$notify.success("Заголовок", "Сообщение");
this.$notify.error("Заголовок", "Сообщение");
this.$notify.info("Заголовок", "Сообщение");
this.$notify.warning("Заголовок", "Сообщение");

// Специализированные уведомления для авторизации
this.$notify.auth.loginSuccess("Имя пользователя");
this.$notify.auth.loginError("Неверный пароль");
this.$notify.auth.logoutSuccess();
this.$notify.auth.sessionExpired();

// Уведомления для шаблонов
this.$notify.templates.createSuccess("Название шаблона");
this.$notify.templates.updateSuccess("Название шаблона");
this.$notify.templates.deleteSuccess("Название шаблона");
this.$notify.templates.createError("Ошибка создания");

// Уведомления для файлов
this.$notify.files.uploadSuccess("файл.jpg");
this.$notify.files.invalidFormat(["JPG", "PNG"]);
this.$notify.files.fileTooLarge("5MB");

// Системные уведомления
this.$notify.system.validationError();
this.$notify.system.connectionError();
this.$notify.system.unexpectedError();
```

### В сервисах

```javascript
import notificationService from "@/services/notificationService";

// В любом сервисе
notificationService.success("Заголовок", "Сообщение");
notificationService.auth.loginSuccess("Пользователь");
notificationService.templates.createError("Ошибка");
```

## Типы уведомлений

### Базовые типы

- `success` - зеленый, для успешных операций
- `error` - красный, для ошибок
- `warning` - желтый, для предупреждений
- `info` - синий, для информации

### Специализированные категории

#### Auth (Авторизация)

- `loginSuccess(username)` - успешный вход
- `loginError(message)` - ошибка входа
- `logoutSuccess()` - успешный выход
- `logoutError(message)` - ошибка выхода
- `sessionExpired()` - сессия истекла
- `unauthorized()` - доступ запрещен

#### Templates (Шаблоны)

- `createSuccess(name)` - шаблон создан
- `updateSuccess(name)` - шаблон обновлен
- `deleteSuccess(name)` - шаблон удален
- `createError(message)` - ошибка создания
- `updateError(message)` - ошибка обновления
- `deleteError(message)` - ошибка удаления
- `loadError(message)` - ошибка загрузки

#### Files (Файлы)

- `uploadSuccess(filename)` - файл загружен
- `uploadError(message)` - ошибка загрузки
- `deleteSuccess(filename)` - файл удален
- `deleteError(message)` - ошибка удаления
- `invalidFormat(allowedFormats)` - неверный формат
- `fileTooLarge(maxSize)` - файл слишком большой

#### System (Система)

- `validationError()` - ошибки валидации формы
- `connectionError()` - ошибки подключения
- `unexpectedError()` - неожиданные ошибки
- `saveDraft()` - автосохранение
- `maintenance()` - техническое обслуживание

## Преимущества

1. **Единообразие** - все уведомления выглядят одинаково
2. **Централизация** - легко изменить логику уведомлений
3. **Типизация** - предотвращает ошибки в тексте уведомлений
4. **Переиспользование** - готовые шаблоны для частых случаев
5. **Консистентность** - одинаковые сообщения по всему приложению

## Настройка

Сервис автоматически инициализируется в `main.js` и доступен через:

- `this.$notify` в компонентах Vue
- `notificationService` при прямом импорте

Уведомления автоматически исчезают через 5 секунд (настраивается).
