import { HttpErrorResponse } from '@angular/common/http';

const MENSAGEM_PADRAO = 'Ocorreu um erro inesperado.';

/**
 * Extrai a mensagem do contrato de erro da API ({"detail": ...}).
 * É o único ponto que interpreta o corpo de erro.
 */
export function mensagemDeErro(mensagemOuErro: string | unknown): string {
    if (typeof mensagemOuErro === 'string') {
        return mensagemOuErro;
    }
    if (mensagemOuErro instanceof HttpErrorResponse) {
        const detail = (mensagemOuErro.error as { detail?: string } | null)?.detail;
        return detail ?? `Erro ${mensagemOuErro.status}.`;
    }
    return MENSAGEM_PADRAO;
}
