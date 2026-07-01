from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.database import Base, engine
from app.routers import tickets, auth

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Учёт внутренних заявок API",
    description="API для создания, просмотра, фильтрации и управления заявками",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    messages = []
    for err in errors:
        loc = ".".join(str(p) for p in err.get("loc", []) if p != "body")
        messages.append(f"{loc}: {err.get('msg')}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "; ".join(messages) or "Ошибка валидации данных"},
    )


app.include_router(tickets.router)
app.include_router(auth.router)


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok"}
