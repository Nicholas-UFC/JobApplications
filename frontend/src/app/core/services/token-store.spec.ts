import { TestBed } from '@angular/core/testing';
import { ARMAZENAMENTO, ArmazenamentoMemoria, TokenStore } from './token-store';

describe('TokenStore', () => {
    let armazenamento: ArmazenamentoMemoria;

    beforeEach(() => {
        armazenamento = new ArmazenamentoMemoria();
        TestBed.configureTestingModule({
            providers: [{ provide: ARMAZENAMENTO, useValue: armazenamento }],
        });
    });

    it('grava e lê um valor', () => {
        const store = TestBed.inject(TokenStore);
        store.gravar('access_token', 'abc');
        expect(store.ler('access_token')).toBe('abc');
    });

    it('lê null quando ausente', () => {
        const store = TestBed.inject(TokenStore);
        expect(store.ler('refresh_token')).toBeNull();
    });

    it('remove um valor', () => {
        const store = TestBed.inject(TokenStore);
        store.gravar('access_token', 'abc');
        store.remover('access_token');
        expect(store.ler('access_token')).toBeNull();
    });
});
