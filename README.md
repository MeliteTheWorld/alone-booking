# ALONE

ALONE — MVP веб-приложения для онлайн-записи клиентов на услуги малого бизнеса: салонов красоты, барбершопов, клиник и частных специалистов.

Проект сделан как полноценный демонстрационный продукт для защиты: с клиентским кабинетом, единой админкой, управлением услугами, календарём, аналитикой и mobile-first интерфейсом.

## Что уже реализовано

### Клиент

- регистрация и вход через единый экран `/auth`
- просмотр каталога услуг
- поиск и фильтрация услуг
- просмотр исполнителя, длительности и стоимости
- выбор даты и свободного слота
- создание записи
- перенос и отмена записи в профиле
- просмотр своих визитов внутри профиля

### Администратор

- единая панель `/admin`
- вкладки `Дашборд`, `Календарь`, `Услуги`, `Аналитика`
- управление каталогом услуг
- назначение исполнителя для услуги
- настройка рабочих часов
- подтверждение записи
- перевод записи в работу
- завершение услуги
- отмена или полное удаление записи
- просмотр загрузки по неделе
- базовая бизнес-аналитика по выручке, услугам, клиентам и записям

## Жизненный цикл записи

Статусы записи:

- `pending` — ожидает подтверждения
- `confirmed` — подтверждена
- `in_progress` — услуга в работе
- `completed` — услуга оказана
- `cancelled` — запись отменена

Если подтверждённую запись переносят на другое время, её статус автоматически сбрасывается обратно в `pending`.

## Защита от спама

На backend уже встроены базовые ограничения против спама при создании записей:

- cooldown между попытками записи
- лимит активных записей на пользователя
- лимит активных записей на одну дату
- запрет дубля активной записи на тот же слот
- блокировка гонок при одновременных запросах на один день

Это значит, что забить базу простыми повторными кликами по кнопке записи уже нельзя.

## Технологии

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- База данных: PostgreSQL
- Аутентификация: JWT
- Хеширование паролей: `crypto.scrypt`
- Локальная БД для разработки: Docker Compose
- Mobile Web App: PWA

## Архитектура

- `frontend` — интерфейс, маршруты, состояние, клиентский API, PWA-часть
- `backend` — REST API, авторизация, бизнес-логика, антиспам-защита, аналитика
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
│       └── pages/
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

Базовый URL для локальной разработки:

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

- `GET /schedule/slots?serviceId=1&date=2026-04-16`
- `GET /schedule/hours`
- `PUT /schedule/hours/:dayOfWeek`
- `GET /schedule/load?from=2026-04-15&to=2026-04-21`

## Ключевые экраны

- главная страница
- каталог услуг
- страница записи
- единый экран авторизации `/auth`
- профиль пользователя
- админка `/admin`
- календарь записей
- управление услугами
- аналитика по выручке и записям

## Полезные файлы

- backend app: [backend/src/app.js](backend/src/app.js)
- backend start: [backend/src/server.js](backend/src/server.js)
- логика записей: [backend/src/routes/bookingRoutes.js](backend/src/routes/bookingRoutes.js)
- схема БД: [database/schema.sql](database/schema.sql)
- seed-данные: [database/seed.sql](database/seed.sql)
- страница записи: [frontend/src/pages/BookingPage.jsx](frontend/src/pages/BookingPage.jsx)
- каталог услуг: [frontend/src/pages/ServicesPage.jsx](frontend/src/pages/ServicesPage.jsx)
- админка: [frontend/src/pages/AdminPage.jsx](frontend/src/pages/AdminPage.jsx)
- аналитика: [frontend/src/pages/AdminAnalyticsPage.jsx](frontend/src/pages/AdminAnalyticsPage.jsx)

## Локальный запуск

### 1. Поднять PostgreSQL

Убедитесь, что Docker Desktop запущен:

```bash
docker compose up -d postgres
```

PostgreSQL для локальной разработки поднимается на:

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

или для стабильного локального демо:

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

Что уже реализовано:

- мобильная адаптация
- mobile-friendly навигация
- manifest
- installable PWA
- standalone-режим после установки

### Тест на телефоне

1. Убедитесь, что телефон и компьютер в одной Wi-Fi сети.
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

Для новых инициализаций базы в `seed.sql`:

- Администратор: `admin@alone.local / alonedb`
- Клиент: `client@smartbooking.local / client12345`

Важно:

- изменение `database/seed.sql` влияет на новые инициализации БД
- для уже существующей production-базы аккаунты нужно обновлять отдельным SQL-запросом

## Продакшен-деплой

Проект уже рассчитан на выкладку на VPS.

Текущий production workflow:

1. На локальной машине:

```bash
git add .
git commit -m "update"
git push
```

2. На сервере:

```bash
bash /var/www/ALONE_GIT/deploy.sh
```

Что делает `deploy.sh`:

- подтягивает код из GitHub
- собирает frontend
- публикует `dist` в nginx-папку
- перезапускает nginx
- перезапускает backend через PM2

## Ограничения текущего MVP

- онлайн-оплата не реализована
- email/SMS/Telegram уведомления не подключены
- нет мультифилиальности
- нет полноценной истории изменений и audit log
- нет разделения сотрудников по личным графикам и кабинетам

## Как использовался ИИ

- проектирование общей архитектуры frontend/backend/database
- ускорение написания кода и рефакторинга
- генерация и переработка UI
- поиск багов и UX-проблем
- доработка логики записи, антиспама и админских сценариев
- подготовка структуры MVP для демонстрации и защиты

## Идеи для следующей версии

- уведомления клиенту о подтверждении, переносе и отмене
- комментарии администратора к записи
- история действий по записи
- фильтры и поиск по клиентам в админке
- отдельные графики для разных сотрудников
- средний чек, конверсия и расширенная аналитика
- AI-подбор лучшего времени записи
- прогноз загруженности по дням и часам
