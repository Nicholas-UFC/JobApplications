from django.contrib import admin
from django.urls import path
from ninja import NinjaAPI
from ninja_jwt.authentication import JWTAuth
from ninja_jwt.routers.obtain import obtain_pair_router
from ninja_jwt.routers.verify import verify_router

from autenticacao.api import router_auth
from candidatura.api import router_candidatura
from healthcheck.api import router_healthcheck
from plataforma.api import router_plataforma
from utils.excecoes import registrar_erro_nao_tratado

api = NinjaAPI(
    title="JobApplications API",
    version="1.0.0",
    description="API do sistema de JobApplications",
    auth=JWTAuth(),
)
api.add_router("auth", router_auth, tags=["Autenticação"])
api.add_router("auth", obtain_pair_router, tags=["Autenticação"])
api.add_router("auth", verify_router, tags=["Autenticação"])
api.add_router("candidatura", router_candidatura, tags=["Candidatura"])
api.add_router("plataforma", router_plataforma, tags=["Plataforma"])
api.add_router("", router_healthcheck, tags=["Healthcheck"])

registrar_erro_nao_tratado(api)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", api.urls),
]
