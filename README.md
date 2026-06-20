# FearSearch Staff Panel

Web-панель управления стаффом для Discord бота FearSearch.

## Tech Stack

- **Frontend:** React + TypeScript + Tailwind CSS + Framer Motion
- **Backend:** Go + PostgreSQL
- **Auth:** Discord OAuth2 + JWT

## Features

- Discord OAuth2 авторизация
- Проверка Discord ролей и автоматическое назначение прав
- Dashboard со статистикой стаффа
- Просмотр и фильтрация участников стаффа
- Профиль с ролями и разрешениями
- Тёмная тема с плавными анимациями

## Local Development

### 1. Настройка Discord OAuth2

1. Перейдите в [Discord Developer Portal](https://discord.com/developers/applications)
2. Создайте приложение
3. В **OAuth2** добавьте redirect URL: `http://localhost:8080/api/auth/callback`
4. В **Bot** добавьте права: `guilds.members.read`, `identify`

### 2. Запуск

```bash
# Копируйте переменные окружения
cp backend/.env.example backend/.env
# Заполните значения в backend/.env

# Запустите через Docker Compose
docker-compose up --build
```

Frontend: http://localhost:5173
Backend: http://localhost:8080

## Deployment

### Railway (Backend + Database)

1. Создайте аккаунт на [Railway](https://railway.app)
2. Создайте проект с PostgreSQL
3. Добавьте Go service из репозитория `website/backend/`
4. Настройте переменные окружения:

```
DISCORD_CLIENT_ID=...
DISCORD_CLIENT_SECRET=...
DISCORD_GUILD_ID=...
JWT_SECRET=your-secret-key
DATABASE_URL=${{Postgres.DATABASE_URL}}
FRONTEND_URL=https://your-app.vercel.app
```

5. Railway автоматически задеплоит бэкенд

### Vercel (Frontend)

1. Создайте аккаунт на [Vercel](https://vercel.com)
2. Импортируйте папку `website/frontend/`
3. Настройте переменные:

```
VITE_API_URL=https://your-app.up.railway.app
```

4. Deploy

## Structure

```
website/
├── backend/           # Go API server
│   ├── config/        # App configuration
│   ├── database/      # PostgreSQL + JSON fallback
│   ├── handlers/      # HTTP handlers
│   ├── models/        # Data models
│   └── main.go        # Entry point
├── frontend/          # React SPA
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── hooks/       # React hooks (auth context)
│   │   ├── pages/       # Page components
│   │   ├── services/    # API service
│   │   └── types/       # TypeScript types
│   └── ...
└── docker-compose.yml
```

## Role Hierarchy

| Role | Level | Permissions |
|------|-------|-------------|
| OWNER | 100 | Full access |
| GLADMIN | 90 | Staff manage, punishments, settings |
| STADMIN | 80 | Staff view, punishments |
| ADMIN | 70 | Staff view, punishments |
| STMODER | 60 | Staff view, reports |
| CURATOR | 65 | Staff view, reports |
| MODER | 50 | Staff view |
| MLMODER | 40 | Staff view |
