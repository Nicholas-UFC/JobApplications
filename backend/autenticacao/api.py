from django.http import HttpRequest
from ninja import Router
from ninja_jwt.schema import (
    TokenObtainPairInputSchema,
    TokenObtainPairOutputSchema,
)

from autenticacao.schemas import UsuarioSchema

router_auth = Router()


@router_auth.get("/me", response=UsuarioSchema)
def me(request: HttpRequest) -> UsuarioSchema:
    user = request.user
    return UsuarioSchema(
        username=user.username,
        is_staff=user.is_staff,
        is_superuser=user.is_superuser,
    )


@router_auth.post(
    "login",
    response=TokenObtainPairInputSchema.get_response_schema(),
    auth=None,
)
def login(
    request: HttpRequest,  # noqa: ARG001
    user_token: TokenObtainPairInputSchema,
) -> TokenObtainPairOutputSchema:
    user_token.check_user_authentication_rule()
    return user_token.to_response_schema()
