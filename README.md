# MAX Chat — GREEN-API

Тестовое задание «Фронтенд разработчик React»: веб-интерфейс для отправки и получения текстовых сообщений в мессенджере **MAX** через [GREEN-API](https://green-api.com/max). Внешний вид основан на [web.max.ru](https://web.max.ru/).

**Стек:** React 19, Redux Toolkit, React Router 7, Tailwind CSS 4, Vite.

## Возможности

- Вход по `idInstance` и `apiTokenInstance` (проверка через `getStateInstance`)
- Создание чата по номеру телефона (`chatId` определяется через `checkAccount`)
- Отправка сообщений — [SendMessage](https://green-api.com/v3/docs/api/sending/SendMessage/)
- Получение сообщений через HTTP API — [ReceiveNotification](https://green-api.com/v3/docs/api/receiving/technology-http-api/ReceiveNotification/) + `DeleteNotification` (long polling)
- Статусы исходящих сообщений (отправлено / доставлено / прочитано)
- История чатов и сессия сохраняются в `localStorage`
- Адаптивная вёрстка (на мобильном — список чатов и диалог на отдельных экранах)

## Запуск локально

Нужен Node.js 20.19+ (или 22.12+).

```bash
git clone <repo-url>
cd max-mg
npm install
npm run dev
```

Откройте http://localhost:5173.

Сборка для продакшена: `npm run build` (результат — в `dist/`), предпросмотр: `npm run preview`.

## Подготовка инстанса GREEN-API

1. Зарегистрируйтесь в [личном кабинете](https://console.green-api.com) и создайте инстанс для **MAX**.
2. Авторизуйте инстанс (привяжите аккаунт MAX).
3. В настройках инстанса **очистите `webhookUrl`** и включите получение входящих уведомлений (`incomingWebhook`) — иначе HTTP API не будет получать сообщения. По желанию включите `outgoingWebhook`, чтобы видеть статусы доставки. Если инстанс настроен иначе, приложение покажет предупреждение с кнопкой «Настроить автоматически» (вызывает `SetSettings`).
4. Скопируйте `idInstance`, `apiTokenInstance` и `apiUrl`. Если `apiUrl` вашего инстанса отличается от `https://api.green-api.com`, укажите его в поле `apiUrl` на странице входа.

## Как пользоваться

1. Введите `idInstance` и `apiTokenInstance` → «Войти».
2. Нажмите «+», введите номер получателя (например `79001234567`) → «Создать чат».
3. Напишите сообщение и отправьте (Enter — отправить, Shift+Enter — перенос строки).
4. Ответ получателя из MAX появится в чате автоматически.

## Структура

```
src/
  api/greenApi.js               — запросы к GREEN-API
  store/                        — Redux Toolkit: authSlice, chatsSlice, сохранение в localStorage
  hooks/useNotificationPolling  — цикл receiveNotification → обработка → deleteNotification
  pages/                        — LoginPage, ChatLayout
  components/                   — Sidebar, NewChatForm, ChatWindow, MessageBubble, MessageInput…
  App.jsx                       — маршруты: /login, /chats, /chats/:chatId
```
