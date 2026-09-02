from django.contrib import admin
from simple_history.admin import SimpleHistoryAdmin

from candidatura.models import Candidatura


@admin.register(Candidatura)
class CandidaturaAdmin(SimpleHistoryAdmin):
    list_display = (
        "nome",
        "empresa",
        "observacoes",
        "plataforma",
        "status",
        "ativo",
        "created_at",
        "updated_at",
    )
    list_filter = ("nome", "ativo")
    search_fields = ("nome",)
    ordering = ("nome",)
