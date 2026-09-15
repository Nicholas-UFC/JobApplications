import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
    Plataforma,
    PlataformaCreate,
    PlataformaUpdate,
} from '../../core/models/plataforma.models';
import { PlataformaService } from '../../core/services/plataforma.service';
import { NotificacaoService } from '../../shared/services/notificacao.service';
import { OrquestradorSalvar } from '../../shared/dialogo-salvar/dialogo-salvar';

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
    private readonly dialogRef = inject(MatDialogRef<PlataformaDialogComponent>);
    private readonly dados = inject<PlataformaDialogDados | null>(MAT_DIALOG_DATA, {
        optional: true,
    });

    protected readonly salvarEstado = new OrquestradorSalvar<PlataformaCreate, PlataformaUpdate>(
        {
            criar: (payload) => this.plataformas.criar(payload),
            atualizar: (id, payload) => this.plataformas.atualizar(id, payload),
            notificacao: inject(NotificacaoService),
            dialogRef: this.dialogRef,
            mensagemCriado: 'Plataforma salva.',
            mensagemAtualizado: 'Plataforma atualizada.',
        },
        this.dados?.plataforma?.id,
    );

    protected get modoEdicao(): boolean {
        return this.salvarEstado.modoEdicao;
    }

    protected get carregamento(): boolean {
        return this.salvarEstado.carregamento;
    }

    protected readonly formulario = new FormGroup({
        nome: new FormControl(this.dados?.plataforma?.nome ?? '', [Validators.required]),
        site_url: new FormControl(this.dados?.plataforma?.site_url ?? ''),
    });

    salvar(): void {
        this.salvarEstado.salvar(
            this.formulario,
            () => ({
                nome: this.formulario.value.nome ?? '',
                site_url: this.formulario.value.site_url ?? '',
            }),
            () => ({
                nome: this.formulario.value.nome ?? '',
                site_url: this.formulario.value.site_url ?? '',
                ativo: this.dados?.plataforma?.ativo ?? true,
            }),
        );
    }

    fechar(): void {
        this.salvarEstado.fechar();
    }
}
