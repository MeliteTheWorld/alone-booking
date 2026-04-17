# ALONE

ALONE — MVP веб-приложения для онлайн-записи клиентов на услуги малого бизнеса: барбершопов, салонов красоты, клиник и частных специалистов.

Проект собран как демонстрационный продукт для защиты: с клиентским кабинетом, удобной админкой, календарём, аналитикой, управлением услугами и работниками, а также mobile-first интерфейсом.

## Что умеет система

### Клиент

- регистрация и вход через единый экран `/auth`
- просмотр каталога услуг
- поиск и фильтрация услуг
- выбор услуги
- выбор исполнителя из списка работников, назначенных на услугу
- выбор даты и свободного времени именно у выбранного исполнителя
- создание записи через confirm-модалку
- просмотр своих визитов в профиле
- перенос и отмена записи
- редактирование профиля, пароля и аватарки

### Администратор

- единая панель `/admin`
- вкладки:
  - `Дашборд`
  - `Календарь`
  - `Услуги`
  - `Работники`
  - `Аналитика`
- модальные окна для создания и редактирования услуг
- модальные окна для создания и редактирования работников
- глобальные confirm-модалки для чувствительных действий
- управление рабочими часами
- подтверждение записи
- перевод записи в работу
- завершение услуги
- отмена или полное удаление записи
- базовая аналитика по выручке, клиентам, услугам и загрузке

## Основная логика записи

Текущий пользовательский сценарий:

1. открыть каталог услуг
2. выбрать услугу
3. выбрать исполнителя
4. выбрать дату
5. выбрать свободный слот именно у этого исполнителя
6. подтвердить запись через модальное окно

Это позволяет моделировать реальный сценарий барбершопа или салона, когда клиент идёт не просто на услугу, а к конкретному мастеру.

## Жизненный цикл записи

- `pending` — ожидает подтверждения
- `confirmed` — подтверждена администратором
- `in_progress` — услуга в работе
- `completed` — услуга оказана
- `cancelled` — запись отменена

Если подтверждённую запись переносят на другое время, статус автоматически сбрасывается обратно в `pending`.

## Антиспам-защита

На backend встроены базовые ограничения против спама при создании записей:

- cooldown между попытками создания
- лимит активных записей на пользователя
- лимит активных записей на одну дату
- запрет дубля активной записи на тот же слот
- блокировка гонок при одновременных запросах

Это не позволяет просто закликать кнопку записи и забить базу однотипными заявками.

## Технологии

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- База данных: PostgreSQL
- Аутентификация: JWT
- Хеширование паролей: `crypto.scrypt`
- Локальная база: Docker Compose
- Mobile Web App: PWA

## Архитектура

- `frontend` — интерфейс, роутинг, формы, модалки, клиентский API, PWA
- `backend` — REST API, авторизация, бизнес-логика записи, аналитика, антиспам
- `database` — SQL-схема и seed-данные

## Структура проекта

```text
.
├── backend/
│   ├── scripts/
│   └── src/
│       ├── config/
│       ├── middleware/
│       ├── routes/
│       └── utils/
├── database/
│   ├── schema.sql
│   └── seed.sql
├── frontend/
│   ├── public/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── context/
│       ├── layouts/
│       ├── pages/
│       └── utils/
├── docker-compose.yml
├── package.json
└── README.md
```

## Модель данных

### `users`

- `id`
- `name`
- `email`
- `password_hash`
- `avatar_key`
- `role`
- `created_at`

### `workers`

- `id`
- `first_name`
- `last_name`
- `position`
- `created_at`
- `updated_at`

### `services`

- `id`
- `name`
- `description`
- `staff_name`
- `worker_id`
- `duration`
- `price`
- `is_active`
- `created_at`
- `updated_at`

### `service_workers`

- `service_id`
- `worker_id`
- `created_at`

### `bookings`

- `id`
- `user_id`
- `service_id`
- `worker_id`
- `booking_date`
- `booking_time`
- `status`
- `created_at`
- `updated_at`

### `business_hours`

- `day_of_week`
- `start_time`
- `end_time`
- `is_working`

## API

Базовый локальный URL:

```text
http://localhost:5000/api
```

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `PATCH /auth/me`

### Services

- `GET /services`
- `GET /services/admin/all`
- `POST /services`
- `PUT /services/:id`
- `DELETE /services/:id`

### Workers

- `GET /workers`
- `POST /workers`
- `PUT /workers/:id`
- `DELETE /workers/:id`

### Bookings

- `GET /bookings`
- `POST /bookings`
- `PUT /bookings/:id`
- `DELETE /bookings/:id`
- `DELETE /bookings/:id/permanent`
- `PATCH /bookings/:id/status`
- `GET /bookings/dashboard/summary`
- `GET /bookings/dashboard/analytics`

### Schedule

- `GET /schedule/slots?serviceId=1&workerId=2&date=2026-04-17`
- `GET /schedule/hours`
- `PUT /schedule/hours/:dayOfWeek`
- `GET /schedule/load?from=2026-04-15&to=2026-04-21`

## Ключевые экраны

- главная
- каталог услуг
- страница записи
- единый экран авторизации `/auth`
- профиль пользователя
- админка `/admin`
- управление услугами через модалки
- управление работниками через модалки
- календарь записей
- аналитика

## Полезные файлы

- backend app: [backend/src/app.js](backend/src/app.js)
- backend start: [backend/src/server.js](backend/src/server.js)
- записи: [backend/src/routes/bookingRoutes.js](backend/src/routes/bookingRoutes.js)
- услуги: [backend/src/routes/serviceRoutes.js](backend/src/routes/serviceRoutes.js)
- работники: [backend/src/routes/workerRoutes.js](backend/src/routes/workerRoutes.js)
- схема БД: [database/schema.sql](database/schema.sql)
- seed: [database/seed.sql](database/seed.sql)
- страница записи: [frontend/src/pages/BookingPage.jsx](frontend/src/pages/BookingPage.jsx)
- услуги в админке: [frontend/src/pages/ManageServicesPage.jsx](frontend/src/pages/ManageServicesPage.jsx)
- работники в админке: [frontend/src/pages/WorkersPage.jsx](frontend/src/pages/WorkersPage.jsx)
- админка: [frontend/src/pages/AdminPage.jsx](frontend/src/pages/AdminPage.jsx)
- confirm-система: [frontend/src/context/ConfirmDialogContext.jsx](frontend/src/context/ConfirmDialogContext.jsx)

## Локальный запуск

### 1. Поднять PostgreSQL

Убедитесь, что Docker Desktop запущен:

```bash
docker compose up -d postgres
```

Локальная БД:

```text
localhost:5433
```

### 2. Настроить `.env`

`backend/.env`

```env
PORT=5000
CLIENT_URL=http://localhost:5173
JWT_SECRET=replace-with-long-random-secret
DATABASE_URL=postgres://booking_user:booking_pass@localhost:5433/booking_mvp
```

`frontend/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Установить зависимости

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 4. Инициализировать базу

```bash
cd backend
npm run db:init
```

### 5. Запустить backend

```bash
cd backend
npm run dev
```

или для стабильного демо:

```bash
cd backend
npm run start
```

### 6. Запустить frontend

```bash
cd frontend
npm run dev
```

## PWA и мобильный режим

Проект адаптирован под телефоны и может использоваться как mobile web app.

Что уже есть:

- mobile-first интерфейс
- адаптация ключевых экранов под телефон
- installable PWA
- standalone-режим после установки

### Тест на телефоне

1. Телефон и компьютер должны быть в одной Wi-Fi сети.
2. В `frontend/.env` укажите IP компьютера:

```env
VITE_API_URL=http://IP_ВАШЕГО_ПК:5000/api
```

3. Соберите frontend:

```bash
cd frontend
npm run build
```

4. Запустите preview:

```bash
npm run preview:mobile
```

5. Откройте на телефоне:

```text
http://IP_ВАШЕГО_ПК:4173
```

## Тестовые аккаунты

Для новых инициализаций базы:

- Администратор: `admin@alone.local / alonedb`
- Клиент: `client@smartbooking.local / client12345`

Важно:

- `database/seed.sql` влияет только на новые инициализации
- в существующей production-базе логины и пароли надо менять отдельным SQL-запросом

## Продакшен-деплой

Текущий production workflow:

На локальной машине:

```bash
git add .
git commit -m "update"
git push origin main
```

На сервере:

```bash
cd /var/www/ALONE_GIT
git pull
bash /var/www/ALONE_GIT/deploy.sh
```

`deploy.sh`:

- подтягивает код из GitHub
- собирает frontend
- публикует `dist` в nginx-папку
- перезапускает nginx
- перезапускает backend через PM2

## Ограничения текущего MVP

- онлайн-оплата не реализована
- email / SMS / Telegram уведомления не подключены
- нет мультифилиальности
- нет персональных графиков и кабинетов для каждого работника
- нет полноценного audit log
- нет drag-and-drop управления записями

## Как использовался ИИ

- проектирование архитектуры frontend/backend/database
- ускорение написания и рефакторинга кода
- переработка UX и admin flow
- доработка сценариев записи, исполнителей и антиспама
- генерация и улучшение интерфейсов
- поиск ошибок и быстрые правки перед демо

## Идеи для следующей версии

- персональные графики для каждого работника
- кабинеты / рабочие места
- уведомления клиенту о подтверждении, переносе и отмене
- комментарии администратора к записи
- история действий по записи
- фильтры по исполнителям в календаре
- средний чек и конверсия в аналитике
- AI-подбор лучшего времени записи
- прогноз загруженности по дням и часам
