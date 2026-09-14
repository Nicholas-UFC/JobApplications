import { HttpErrorResponse } from '@angular/common/http';
import { mensagemDeErro } from './mensagem-erro';

describe('mensagemDeErro', () => {
    it('retorna a própria string', () => {
        expect(mensagemDeErro('falhou')).toBe('falhou');
    });

    it('usa detail do contrato da API', () => {
        const erro = new HttpErrorResponse({
            error: { detail: 'Já existe' },
            status: 409,
        });
        expect(mensagemDeErro(erro)).toBe('Já existe');
    });

    it('usa o status quando não há detail', () => {
        const erro = new HttpErrorResponse({ status: 500 });
        expect(mensagemDeErro(erro)).toBe('Erro 500.');
    });

    it('usa a mensagem padrão para valor desconhecido', () => {
        expect(mensagemDeErro(42)).toBe('Ocorreu um erro inesperado.');
    });
});
