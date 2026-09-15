import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';
import { Plataforma } from '../../core/models/plataforma.models';
import { PlataformaService } from '../../core/services/plataforma.service';
import { NotificacaoService } from '../../shared/services/notificacao.service';

export interface PlataformaDialogDados {
    plataforma?: Plataforma;
}

@Component({
    selector: 'app-plataforma-dialog',
    standalone: true,
    imports: [
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        ReactiveFormsModule,
    ],
    templateUrl: './plataforma-dialog.component.html',
    styleUrl: './plataforma-dialog.component.scss',
})
export class PlataformaDialogComponent {
    private readonly plataformas = inject(PlataformaService);
    private readonly notificacao = inject(NotificacaoService);
    private readonly dialogRef = inject(MatDialogRef<PlataformaDialogComponent>);
    private readonly dados = inject<PlataformaDialogDados | null>(MAT_DIALOG_DATA, {
        optional: true,
    });

    protected readonly modoEdicao = this.dados?.plataforma != null;

    protected readonly formulario = new FormGroup({
        nome: new FormControl(this.dados?.plataforma?.nome ?? '', [Validators.required]),
        site_url: new FormControl(this.dados?.plataforma?.site_url ?? ''),
    });

    protected carregamento = false;

    salvar(): void {
        if (this.formulario.invalid || this.carregamento) {
            return;
        }
        const payload = {
            nome: this.formulario.value.nome ?? '',
            site_url: this.formulario.value.site_url ?? '',
        };
        this.carregamento = true;
        const requisicao =
            this.modoEdicao && this.dados?.plataforma
                ? this.plataformas.atualizar(this.dados.plataforma.id, {
                      ...payload,
                      ativo: this.dados.plataforma.ativo,
                  })
                : this.plataformas.criar(payload);
        requisicao.pipe(finalize(() => (this.carregamento = false))).subscribe({
            next: () => {
                this.notificacao.sucesso(
                    this.modoEdicao ? 'Plataforma atualizada.' : 'Plataforma salva.',
                );
                this.dialogRef.close(true);
            },
            error: (erro) => this.notificacao.erro(erro),
        });
    }

    fechar(): void {
        this.dialogRef.close(false);
    }
}
