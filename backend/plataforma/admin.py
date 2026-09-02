from django.contrib import admin
from simple_history.admin import SimpleHistoryAdmin

from plataforma.models import Plataforma


@admin.register(Plataforma)
class PlataformaAdmin(SimpleHistoryAdmin):
    list_display = (
        "nome",
        "ativo",
        "site_url",
        "created_at",
        "updated_at",
    )
    list_filter = ("nome", "ativo")
    search_fields = ("nome",)
    ordering = ("nome",)
