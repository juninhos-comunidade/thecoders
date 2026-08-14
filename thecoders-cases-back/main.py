from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.supabase_client import supabase
from routers import solucao, avaliacao, login, usuario, cases, salas

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://thecoders-front.onrender.com",  # confirmar/ajustar após o deploy do Static Site
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(solucao.router)
app.include_router(avaliacao.router)
app.include_router(login.router)
app.include_router(usuario.router)
app.include_router(cases.router)
app.include_router(salas.router)


@app.get("/health")
def health_check():
    response = supabase.table("usuarios").select("id").limit(1).execute()
    return {"status": "ok", "supabase_conectado": True, "dados": response.data}