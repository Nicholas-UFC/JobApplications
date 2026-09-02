from django.db import models

from utils.basemodel import BaseModel


class Plataforma(BaseModel):
    site_url = models.URLField(
        blank=True,
        verbose_name="URL Principal",
    )

    class Meta:
        verbose_name = "Plataforma"
        verbose_name_plural = "Plataformas"
        ordering = ("nome",)
