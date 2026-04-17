# ALONE

ALONE — MVP веб-приложения для онлайн-записи клиентов на услуги малого бизнеса: барбершопов, салонов красоты, частных мастеров и небольших студий.

Проект сочетает клиентский каталог услуг, запись к конкретному исполнителю, профиль пользователя и единую админку для управления расписанием, услугами, работниками, статусами записей и базовой аналитикой.

## Что есть в проекте

### Клиентская часть

- единый экран авторизации `/auth`
- каталог услуг с поиском и фильтрами
- карточки услуг с ценой, длительностью и списком исполнителей
- запись по сценарию: `услуга -> исполнитель -> дата -> время -> подтверждение`
- confirm-модалка перед созданием записи
- профиль пользователя с редактированием имени, email, пароля и аватарки
- вкладка с личными записями внутри профиля
- перенос и отмена записи
- mobile-first интерфейс и PWA-режим

### Админка

- единая панель `/admin`
- вкладки:
  - `Дашборд`
  - `Календарь`
  - `Услуги`
  - `Работники`
  - `Аналитика`
- управление статусами записей
- модальные окна для создания и редактирования услуг
- модальные окна для создания и редактирования работников
- глобальная confirm-система для чувствительных действий
- настройка рабочих часов
- подтверждение, перевод в работу, завершение, отмена и удаление записей
- аналитика по выручке, клиентам, услугам и загрузке

### Уведомления

- REST API для уведомлений
- WebSocket-канал для realtime-обновлений
- fallback на тихий polling, если WebSocket недоступен

## Как работает запись

Текущий пользовательский сценарий:

1. открыть каталог услуг
2. выбрать услугу
3. выбрать исполнителя из списка работников, назначенных на эту услугу
4. выбрать дату
5. получить свободные слоты именно выбранного работника
6. подтвердить запись в модальном окне

Такой flow ближе к реальному сценарию барбершопа или салона, где клиент записывается не просто на услугу, а к конкретному мастеру.

## Жизненный цикл записи

- `pending` — ожидает подтверждения
- `confirmed` — подтверждена администратором
- `in_progress` — услуга в работе
- `completed` — услуга оказана
- `cancelled` — запись отменена

Если подтверждённую запись переносят, статус автоматически сбрасывается обратно в `pending`.

## Антиспам и базовые ограничения

На backend добавлена базовая защита от забивания базы однотипными заявками:

- cooldown между попытками создания записи
- лимит активных записей на пользователя
- лимит активных записей на одну дату
- запрет дубля активной записи на тот же слот
- защита от гонок при одновременных запросах

## Технологии

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- База данных: PostgreSQL
- Аутентификация: JWT
- Уведомления realtime: WebSocket (`ws`)
- Локальная БД: Docker Compose
- Production backend process manager: PM2
- Веб-сервер: Nginx

## Структура проекта

```text
.
├── backend/
│   ├── scripts/
│   └── src/
│       ├── config/
│       ├── middleware/
│       ├── routes/
│       ├── utils/
│       └── ws/
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

## Основные сущности

### users

- пользователь системы
- хранит имя, email, хэш пароля, роль и выбранную аватарку

### workers

- сотрудники бизнеса
- имя, фамилия, должность

### services

- услуги, отображаемые в каталоге
- название, описание, длительность, цена, активность

### service_workers

- связка многие-ко-многим между услугами и работниками
- определяет, какие сотрудники могут выполнять конкретную услугу

### bookings

- запись пользователя на услугу
- хранит услугу, работника, дату, время и статус

### business_hours

- рабочие часы бизнеса по дням недели

### notifications

- серверные уведомления для клиента и администратора

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
- `DELETE /services/:id/permanent`

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

### Notifications

- `GET /notifications`
- `PATCH /notifications/:id/read`
- `PATCH /notifications/read-all`

## Ключевые файлы

- backend app: [backend/src/app.js](backend/src/app.js)
- backend start: [backend/src/server.js](backend/src/server.js)
- миграции при старте: [backend/src/config/runMigrations.js](backend/src/config/runMigrations.js)
- записи: [backend/src/routes/bookingRoutes.js](backend/src/routes/bookingRoutes.js)
- услуги: [backend/src/routes/serviceRoutes.js](backend/src/routes/serviceRoutes.js)
- работники: [backend/src/routes/workerRoutes.js](backend/src/routes/workerRoutes.js)
- расписание: [backend/src/routes/scheduleRoutes.js](backend/src/routes/scheduleRoutes.js)
- уведомления API: [backend/src/routes/notificationRoutes.js](backend/src/routes/notificationRoutes.js)
- WebSocket-уведомления: [backend/src/ws/notificationsServer.js](backend/src/ws/notificationsServer.js)
- схема БД: [database/schema.sql](database/schema.sql)
- сид-данные: [database/seed.sql](database/seed.sql)
- главная страница: [frontend/src/pages/HomePage.jsx](frontend/src/pages/HomePage.jsx)
- каталог услуг: [frontend/src/pages/ServicesPage.jsx](frontend/src/pages/ServicesPage.jsx)
- страница записи: [frontend/src/pages/BookingPage.jsx](frontend/src/pages/BookingPage.jsx)
- профиль: [frontend/src/pages/ProfilePage.jsx](frontend/src/pages/ProfilePage.jsx)
- админка: [frontend/src/pages/AdminPage.jsx](frontend/src/pages/AdminPage.jsx)
- услуги в админке: [frontend/src/pages/ManageServicesPage.jsx](frontend/src/pages/ManageServicesPage.jsx)
- работники в админке: [frontend/src/pages/WorkersPage.jsx](frontend/src/pages/WorkersPage.jsx)
- аналитика: [frontend/src/pages/AdminAnalyticsPage.jsx](frontend/src/pages/AdminAnalyticsPage.jsx)
- глобальные confirm-модалки: [frontend/src/context/ConfirmDialogContext.jsx](frontend/src/context/ConfirmDialogContext.jsx)
- уведомления на фронте: [frontend/src/context/NotificationsContext.jsx](frontend/src/context/NotificationsContext.jsx)

## Локальный запуск

### 1. Поднять PostgreSQL

Убедитесь, что Docker Desktop запущен:

```bash
docker compose up -d postgres
```

Локальная база:

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
- в уже существующей production-базе логины и пароли меняются отдельным SQL-запросом

## Production и деплой

Текущий workflow:

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
- публикует `dist` в папку nginx
- перезапускает nginx
- перезапускает backend через PM2

### Важный production-нюанс

Если менялись backend-зависимости, после `git pull` на сервере нужно дополнительно выполнить:

```bash
cd /var/www/ALONE_GIT/backend
npm install
pm2 restart alone-api
```

### Важный production-нюанс по БД

Для уже существующей production-базы не стоит использовать `npm run db:init`.

Почему:

- `db:init` рассчитан в первую очередь на новую пустую базу
- на проде актуализацию структуры делает backend через `runMigrations()` при старте

То есть для production-сервера правильный путь:

- обновить код
- установить зависимости при необходимости
- перезапустить backend

## Ограничения текущего MVP

- онлайн-оплата не реализована
- email / SMS / Telegram уведомления не подключены
- нет мультифилиальности
- нет персональных кабинетов работников
- нет полноценного audit log
- WebSocket-уведомления требуют корректного проксирования в nginx

## Как использовался ИИ

- проектирование архитектуры frontend, backend и базы данных
- ускорение написания и рефакторинга кода
- переработка клиентского flow записи
- улучшение UX админки и каталога услуг
- генерация и переработка интерфейсов
- поиск багов перед демо и деплоем

## Идеи для следующей версии

- персональные графики для каждого работника
- отдельные кабинеты / рабочие места
- push, email или Telegram-уведомления
- комментарии администратора к записи
- история действий по записи
- фильтры по работникам в календаре
- средний чек и конверсия в аналитике
- AI-подбор лучшего времени записи
- прогноз загруженности по дням и часам
