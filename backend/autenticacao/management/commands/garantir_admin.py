"""Cria o superusuário inicial a partir de variáveis de ambiente."""

from os import environ

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Cria o superusuário de ADMIN_USER se ainda não existir."

    def handle(
        self,
        *args: object,  # noqa: ARG002
        **options: object,  # noqa: ARG002
    ) -> None:
        nome = environ.get("ADMIN_USER", "")
        email = environ.get("ADMIN_EMAIL", "")
        senha = environ.get("ADMIN_PASSWORD", "")
        if not nome or not senha:
            self.stdout.write("ADMIN_USER incompleto; nada a fazer.")
            return
        usuario = get_user_model()
        if usuario.objects.filter(username=nome).exists():
            self.stdout.write(f"Superusuário '{nome}' já existe.")
            return
        usuario.objects.create_superuser(nome, email or "", senha)
        self.stdout.write(self.style.SUCCESS(f"Superusuário '{nome}' criado."))
