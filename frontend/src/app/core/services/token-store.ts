import { inject, Injectable, InjectionToken } from '@angular/core';

export const CHAVE_ACCESS = 'access_token';
export const CHAVE_REFRESH = 'refresh_token';
export const CHAVE_USUARIO = 'usuario_logado';

/** Seam de persistência dos tokens. */
export interface Armazenamento {
    ler(chave: string): string | null;
    gravar(chave: string, valor: string): void;
    remover(chave: string): void;
}

/** Adaptador do browser. No servidor (SSR) não existe localStorage. */
export class ArmazenamentoLocal implements Armazenamento {
    ler(chave: string): string | null {
        return typeof localStorage === 'undefined' ? null : localStorage.getItem(chave);
    }

    gravar(chave: string, valor: string): void {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(chave, valor);
        }
    }

    remover(chave: string): void {
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem(chave);
        }
    }
}

/** Adaptador em memória para testes e SSR. */
export class ArmazenamentoMemoria implements Armazenamento {
    private readonly valores = new Map<string, string>();

    ler(chave: string): string | null {
        return this.valores.get(chave) ?? null;
    }

    gravar(chave: string, valor: string): void {
        this.valores.set(chave, valor);
    }

    remover(chave: string): void {
        this.valores.delete(chave);
    }
}

export const ARMAZENAMENTO = new InjectionToken<Armazenamento>('ARMAZENAMENTO', {
    providedIn: 'root',
    factory: () => new ArmazenamentoLocal(),
});

/** Persistência dos tokens atrás de um seam substituível. */
@Injectable({ providedIn: 'root' })
export class TokenStore {
    private readonly armazenamento = inject(ARMAZENAMENTO);

    ler(chave: string): string | null {
        return this.armazenamento.ler(chave);
    }

    gravar(chave: string, valor: string): void {
        this.armazenamento.gravar(chave, valor);
    }

    remover(chave: string): void {
        this.armazenamento.remover(chave);
    }
}
