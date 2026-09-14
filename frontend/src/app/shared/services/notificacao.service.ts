import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mensagemDeErro } from '../utils/mensagem-erro';

/**
 * Snackbar centralizado. `erro()` lê o campo `detail` da resposta da API
 * (contrato: erros vêm como `{"detail": "mensagem"}`).
 */
@Injectable({ providedIn: 'root' })
export class NotificacaoService {
    private readonly snackBar = inject(MatSnackBar);

    sucesso(mensagem: string): void {
        this.snackBar.open(mensagem, 'Fechar', {
            duration: 4000,
            panelClass: ['snack-sucesso'],
        });
    }

    erro(mensagemOuErro: string | unknown): void {
        this.snackBar.open(mensagemDeErro(mensagemOuErro), 'Fechar', {
            duration: 6000,
            panelClass: ['snackbar-erro'],
        });
    }
}
