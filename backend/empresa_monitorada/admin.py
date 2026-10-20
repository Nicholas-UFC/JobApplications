from django.contrib import admin
from simple_history.admin import SimpleHistoryAdmin

from empresa_monitorada.models import EmpresaMonitorada


@admin.register(EmpresaMonitorada)
class EmpresaMonitoradaAdmin(SimpleHistoryAdmin):
    list_display = (
        "nome",
        "url_vagas",
        "ultima_consulta",
        "ativo",
        "created_at",
        "updated_at",
    )
    list_filter = ("ativo",)
    search_fields = ("nome", "url_vagas")
    ordering = ("ultima_consulta", "nome")
