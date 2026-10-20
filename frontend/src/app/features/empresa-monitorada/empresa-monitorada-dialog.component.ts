import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
    EmpresaMonitorada,
    EmpresaMonitoradaCreate,
    EmpresaMonitoradaUpdate,
} from '../../core/models/empresa-monitorada.models';
import { EmpresaMonitoradaService } from '../../core/services/empresa-monitorada.service';
import { NotificacaoService } from '../../shared/services/notificacao.service';
import { OrquestradorSalvar } from '../../shared/dialogo-salvar/dialogo-salvar';

export interface EmpresaMonitoradaDialogDados {
    empresa?: EmpresaMonitorada;
}

@Component({
    selector: 'app-empresa-monitorada-dialog',
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
    templateUrl: './empresa-monitorada-dialog.component.html',
    styleUrl: './empresa-monitorada-dialog.component.scss',
})
export class EmpresaMonitoradaDialogComponent {
    private readonly empresas = inject(EmpresaMonitoradaService);
    private readonly dialogRef = inject(MatDialogRef<EmpresaMonitoradaDialogComponent>);
    private readonly dados = inject<EmpresaMonitoradaDialogDados | null>(MAT_DIALOG_DATA, {
        optional: true,
    });

    protected readonly salvarEstado = new OrquestradorSalvar<
        EmpresaMonitoradaCreate,
        EmpresaMonitoradaUpdate
    >(
        {
            criar: (payload) => this.empresas.criar(payload),
            atualizar: (id, payload) => this.empresas.atualizar(id, payload),
            notificacao: inject(NotificacaoService),
            dialogRef: this.dialogRef,
            mensagemCriado: 'Empresa monitorada cadastrada.',
            mensagemAtualizado: 'Empresa monitorada atualizada.',
        },
        this.dados?.empresa?.id,
    );

    protected get modoEdicao(): boolean {
        return this.salvarEstado.modoEdicao;
    }

    protected get carregamento(): boolean {
        return this.salvarEstado.carregamento();
    }

    protected readonly formulario = new FormGroup({
        nome: new FormControl(this.dados?.empresa?.nome ?? '', [Validators.required]),
        url_vagas: new FormControl(this.dados?.empresa?.url_vagas ?? '', [
            Validators.required,
            Validators.pattern(/^https?:\/\/.+/i),
        ]),
    });

    salvar(): void {
        this.salvarEstado.salvar(
            this.formulario,
            () => ({
                nome: this.formulario.value.nome ?? '',
                url_vagas: this.formulario.value.url_vagas ?? '',
            }),
            () => ({
                nome: this.formulario.value.nome ?? '',
                url_vagas: this.formulario.value.url_vagas ?? '',
                ativo: this.dados?.empresa?.ativo ?? true,
            }),
        );
    }

    fechar(): void {
        this.salvarEstado.fechar();
    }
}
