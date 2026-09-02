# Consulta inválida — HTTP 400
ORDENACAO_INVALIDA = (
    "Ordenação inválida: '{ordenacao}'. Valores permitidos: {permitidos}."
)

# Duplicidade — HTTP 409
PLATAFORMA_NOME_DUPLICADO = "Já existe uma Plataforma com o nome '{nome}'."
PLATAFORMA_EM_USO = (
    "Não é possível excluir a Plataforma '{nome}' porque existem "
    "candidaturas vinculadas a ela."
)

# Erro inesperado — HTTP 500
ERRO_INTERNO = "Erro interno do servidor."
