from ninja import Schema


class UsuarioSchema(Schema):
    username: str
    is_staff: bool
    is_superuser: bool
