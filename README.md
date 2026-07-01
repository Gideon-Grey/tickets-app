## Структура репозитория

```
backend/    FastAPI API + SQLite
frontend/   React + TypeScript SPA
```

## Быстрый старт

1. Backend:

**Linux / macOS:**

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Windows (PowerShell)**:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

2. Frontend:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

3. О проекте:

- Модель заявки: `id`, `title` (3–120 симв.), `description` (до 1000 симв.,
  опционально), `status` (`new` / `in_progress` / `done`), `priority`
  (`low` / `normal` / `high`), `created_at`, `updated_at` в UTC.
- Создание, просмотр списка, фильтрация по `status`/`priority`, поиск по
  `title`/`description`, сортировка по дате создания и приоритету, изменение
  статуса, удаление (только админ), пагинация — всё на backend.
- Админский аккаунт с дефолтными кредами `admin:admin`, нужен только для
  удаления.
- Заявку в статусе `done` нельзя редактировать/удалять; обратный переход из
  `done` запрещён — при нарушении возвращается `409` с понятным сообщением.
- Один экран фронтенда со всеми требуемыми элементами: таблица, поиск,
  фильтры, сортировка, форма создания, смена статуса, удаление, вход админа,
  состояния загрузки/пустого списка/ошибок API.
