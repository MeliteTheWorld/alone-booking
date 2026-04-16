# ALONE

MVP веб-приложения для онлайн-записи клиентов на услуги малого бизнеса: салонов красоты, барбершопов, клиник и частных специалистов.

Проект ориентирован на мобильное использование, но полноценно работает и на десктопе. В приложении есть клиентский контур, единая админ-панель, календарь записей, управление услугами, расписанием и жизненным циклом визита.

## Что умеет MVP

### Клиент

- регистрируется и входит в систему
- смотрит каталог услуг
- видит исполнителя услуги
- выбирает дату и свободный слот
- создаёт запись
- просматривает свои записи
- переносит или отменяет запись, пока услуга не начата

### Администратор

- работает в единой панели `/admin`
- управляет услугами
- назначает исполнителя для услуги
- управляет рабочими часами
- видит календарь записей
- подтверждает запись
- переводит запись в работу
- завершает оказанную услугу
- отменяет или удаляет запись
- отслеживает загрузку расписания

## Жизненный цикл записи

В проекте реализованы статусы записи:

- `pending` — ожидает подтверждения
- `confirmed` — подтверждена администратором
- `in_progress` — услуга в работе
- `completed` — услуга оказана
- `cancelled` — запись отменена

При переносе подтверждённой записи статус автоматически сбрасывается обратно в `pending`.

## Технологии

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- База данных: PostgreSQL
- Аутентификация: JWT
- Хранение БД для локальной разработки: Docker Compose
- Mobile Web App: PWA

## Архитектура

- `frontend` — UI, маршруты, формы, мобильная адаптация, PWA-слой
- `backend` — REST API, JWT-аутентификация, бизнес-логика записей и расписания
- `database` — SQL-схема, seed-данные

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
│   └── src/
│       ├── api/
│       ├── components/
│       ├── context/
│       ├── layouts/
│       └── pages/
├── docker-compose.yml
└── README.md
```

## Модель данных

### `users`

- `id`
- `name`
- `email`
- `password_hash`
- `role`
- `created_at`

### `services`

- `id`
- `name`
- `description`
- `staff_name`
- `duration`
- `price`
- `is_active`
- `created_at`
- `updated_at`

### `bookings`

- `id`
- `user_id`
- `service_id`
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

Базовый URL:

```text
http://localhost:5000/api
```

### Auth

- `POST /auth/register`
- `POST /auth/login`

### Services

- `GET /services`
- `GET /services/admin/all`
- `POST /services`
- `PUT /services/:id`
- `DELETE /services/:id`

### Bookings

- `GET /bookings`
- `POST /bookings`
- `PUT /bookings/:id`
- `DELETE /bookings/:id`
- `DELETE /bookings/:id/permanent`
- `PATCH /bookings/:id/status`
- `GET /bookings/dashboard/summary`

### Schedule

- `GET /schedule/slots?serviceId=1&date=2026-04-16`
- `GET /schedule/hours`
- `PUT /schedule/hours/:dayOfWeek`
- `GET /schedule/load?from=2026-04-15&to=2026-04-21`

## Ключевые экраны

- главная страница
- каталог услуг
- страница записи
- мои записи
- единый экран авторизации `/auth`
- админ-панель `/admin`
- календарь записей
- управление услугами

## Примеры кода

- backend server: [backend/src/app.js](backend/src/app.js), [backend/src/server.js](backend/src/server.js)
- схема БД: [database/schema.sql](database/schema.sql)
- логика записей: [backend/src/routes/bookingRoutes.js](backend/src/routes/bookingRoutes.js)
- страница записи: [frontend/src/pages/BookingPage.jsx](frontend/src/pages/BookingPage.jsx)
- единый auth-экран: [frontend/src/pages/AuthPage.jsx](frontend/src/pages/AuthPage.jsx)
- единая админка: [frontend/src/pages/AdminPage.jsx](frontend/src/pages/AdminPage.jsx)

## Локальный запуск

### 1. Поднять PostgreSQL

Убедитесь, что Docker Desktop запущен, затем из корня проекта выполните:

```bash
docker compose up -d postgres
```

PostgreSQL поднимется на:

```text
localhost:5433
```

### 2. Создать `.env`

Backend:

Файл `backend/.env` на основе `backend/.env.example`

```env
PORT=5000
CLIENT_URL=http://localhost:5173
JWT_SECRET=replace-with-long-random-secret
DATABASE_URL=postgres://booking_user:booking_pass@localhost:5433/booking_mvp
```

Frontend:

Файл `frontend/.env` на основе `frontend/.env.example`

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

Если база поднимается впервые или нужна повторная инициализация:

```bash
cd backend
npm run db:init
```

### 5. Запустить backend

Для разработки:

```bash
cd backend
npm run dev
```

Для стабильного демо:

```bash
cd backend
npm run start
```

### 6. Запустить frontend

```bash
cd frontend
npm run dev
```

## Мобильный режим и PWA

Проект адаптирован под телефоны и поддерживает установку как mobile web app.

Что уже реализовано:

- адаптивный интерфейс
- мобильная навигация
- install prompt
- PWA manifest
- standalone-режим после установки

### Локальный тест с телефона

1. Убедитесь, что телефон и компьютер в одной Wi-Fi сети
2. Укажите в `frontend/.env` IP компьютера:

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

- Администратор: `admin@smartbooking.local / admin12345`
- Клиент: `client@smartbooking.local / client12345`

## Ограничения текущего MVP

- онлайн-оплата не реализована
- уведомления по email/SMS/Telegram не подключены
- нет мультифилиальности
- нет отдельного учёта нескольких сотрудников с личными графиками
- нет истории изменений и audit log

## Как использовался ИИ

- проектирование архитектуры frontend/backend/database
- декомпозиция ролей и сценариев клиента/администратора
- ускорение написания backend и frontend-кода
- генерация и переработка UI
- поиск багов и доработка UX
- подготовка структуры MVP для защиты проекта

## Идеи для следующей версии

- уведомления клиенту о подтверждении и переносе записи
- комментарии администратора к записи
- история изменений статусов
- фильтры и поиск по клиентам в админке
- отдельные расписания для разных сотрудников
- статистика по завершённым услугам
- AI-подбор лучшего времени записи
- прогноз загруженности по дням и часам
