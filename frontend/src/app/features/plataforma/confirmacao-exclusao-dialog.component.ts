import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmacaoExclusaoDados {
    nome: string;
    titulo?: string;
}

@Component({
    selector: 'app-confirmacao-exclusao-dialog',
    standalone: true,
    imports: [MatButtonModule, MatDialogModule, MatIconModule],
    templateUrl: './confirmacao-exclusao-dialog.component.html',
    styleUrl: './confirmacao-exclusao-dialog.component.scss',
})
export class ConfirmacaoExclusaoDialogComponent {
    protected readonly dados = inject<ConfirmacaoExclusaoDados>(MAT_DIALOG_DATA);
    private readonly dialogRef = inject(MatDialogRef<ConfirmacaoExclusaoDialogComponent>);

    confirmar(): void {
        this.dialogRef.close(true);
    }

    cancelar(): void {
        this.dialogRef.close(false);
    }
}
