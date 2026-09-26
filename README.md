## Локальный запуск

```
npm install
npm run dev
```

Откройте http://localhost:3000.

В режиме разработки запросы к GREEN-API идут через локальный Vite-прокси (без CORS).

Сборка production:

```bash
npm run build
npm run preview
```

## Стек

- React 19 + TypeScript
- Vite
- Redux Toolkit

## Структура

- `src/api/greenApi.ts` — клиент GREEN-API
- `src/store/` — Redux (auth, chats)
- `src/hooks/useNotificationPolling.ts` — опрос очереди уведомлений

