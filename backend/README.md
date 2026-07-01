# Backend — учёт внутренних заявок (FastAPI)

## Стек
- Python 3.11+
- FastAPI
- SQLAlchemy + SQLite
- PyJWT (авторизация админа)

## Запуск

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
```

После запуска:
- API: http://localhost:8000
- Интерактивная документация (Swagger): http://localhost:8000/docs

## Админ-доступ

Дефолтные креды: `admin` / `admin`.
Используются только для удаления заявок (`DELETE /tickets/{id}`).

```
POST /auth/login
{ "username": "admin", "password": "admin" }
```

Возвращает JWT-токен, который нужно передавать в заголовке
`Authorization: Bearer <token>` при удалении заявки.

## Эндпоинты

| Метод | Путь                      | Описание                                              | Доступ |
|-------|---------------------------|--------------------------------------------------------|--------|
| POST  | /tickets                  | Создать заявку                                         | все    |
| GET   | /tickets                  | Список заявок (фильтры, поиск, сортировка, пагинация)   | все    |
| GET   | /tickets/{id}             | Получить одну заявку                                    | все    |
| PATCH | /tickets/{id}/status      | Изменить статус заявки                                   | все    |
| DELETE| /tickets/{id}             | Удалить заявку                                           | админ  |
| POST  | /auth/login                | Вход админа, выдача токена                              | -      |

### Параметры GET /tickets

- `status` — `new` / `in_progress` / `done`
- `priority` — `low` / `normal` / `high`
- `search` — поиск по `title` и `description` (регистронезависимый)
- `sort_by` — `created_at` (по умолчанию) или `priority`
- `order` — `asc` / `desc` (по умолчанию `desc`)
- `page`, `page_size` — пагинация (по умолчанию `page=1`, `page_size=10`, максимум 100)

Все фильтрация/поиск/сортировка/пагинация выполняются на backend (через SQL-запрос),
а не на стороне фронтенда.

## Структура проекта

```
backend/
  app/
    main.py          точка входа, CORS, обработка ошибок валидации
    database.py      подключение к SQLite
    models.py        ORM-модель Ticket, enum статусов/приоритетов
    schemas.py       Pydantic-схемы запросов/ответов
    crud.py          бизнес-логика: фильтры, поиск, сортировка, пагинация, правила
    auth.py          авторизация админа (JWT)
    routers/
      tickets.py     CRUD-эндпоинты заявок
      auth.py        вход админа
  requirements.txt
```