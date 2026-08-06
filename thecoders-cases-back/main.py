from fastapi import FastAPI

from database.supabase_client import supabase
from routers import solucao

app = FastAPI()

app.include_router(solucao.router)


@app.get("/health")
def health_check():
    response = supabase.table("usuarios").select("id").limit(1).execute()
    return {"status": "ok", "supabase_conectado": True, "dados": response.data}