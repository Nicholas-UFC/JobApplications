import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import {
    Candidatura,
    CandidaturaCreate,
    CandidaturaUpdate,
    STATUS_CANDIDATURA,
    StatusCandidatura,
} from '../../core/models/candidatura.models';
import { Plataforma } from '../../core/models/plataforma.models';
import { CandidaturaService } from '../../core/services/candidatura.service';
import { PlataformaService } from '../../core/services/plataforma.service';
import { NotificacaoService } from '../../shared/services/notificacao.service';
import { OrquestradorSalvar } from '../../shared/dialogo-salvar/dialogo-salvar';

export interface CandidaturaDialogDados {
    candidatura?: Candidatura;
}

@Component({
    selector: 'app-candidatura-dialog',
    standalone: true,
    imports: [
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        ReactiveFormsModule,
    ],
    templateUrl: './candidatura-dialog.component.html',
    styleUrl: './candidatura-dialog.component.scss',
})
export class CandidaturaDialogComponent implements OnInit {
    private readonly candidaturas = inject(CandidaturaService);
    private readonly plataformas = inject(PlataformaService);
    private readonly notificacao = inject(NotificacaoService);
    private readonly dialogRef = inject(MatDialogRef<CandidaturaDialogComponent>);
    private readonly dados = inject<CandidaturaDialogDados | null>(MAT_DIALOG_DATA, {
        optional: true,
    });

    protected readonly salvarEstado = new OrquestradorSalvar<CandidaturaCreate, CandidaturaUpdate>(
        {
            criar: (payload) => this.candidaturas.criar(payload),
            atualizar: (id, payload) => this.candidaturas.atualizar(id, payload),
            notificacao: this.notificacao,
            dialogRef: this.dialogRef,
            mensagemCriado: 'Candidatura salva.',
            mensagemAtualizado: 'Candidatura atualizada.',
        },
        this.dados?.candidatura?.id,
    );

    protected get modoEdicao(): boolean {
        return this.salvarEstado.modoEdicao;
    }

    protected get carregamento(): boolean {
        return this.salvarEstado.carregamento;
    }

    protected readonly opcoesStatus = STATUS_CANDIDATURA;
    protected plataformasLista: Plataforma[] = [];

    protected readonly formulario = new FormGroup({
        nome: new FormControl(this.dados?.candidatura?.nome ?? '', [Validators.required]),
        empresa: new FormControl(this.dados?.candidatura?.empresa ?? '', [Validators.required]),
        plataforma_id: new FormControl<number | null>(
            this.dados?.candidatura?.plataforma_id ?? null,
            [Validators.required],
        ),
        status: new FormControl<StatusCandidatura>(this.dados?.candidatura?.status ?? 'ENVIADO', [
            Validators.required,
        ]),
        observacoes: new FormControl(this.dados?.candidatura?.observacoes ?? ''),
    });

    ngOnInit(): void {
        this.plataformas.listar({ page_size: 100 }).subscribe({
            next: (pagina) => (this.plataformasLista = pagina.items),
            error: (erro) => this.notificacao.erro(erro),
        });
    }

    salvar(): void {
        this.salvarEstado.salvar(
            this.formulario,
            () => ({
                nome: this.formulario.getRawValue().nome ?? '',
                empresa: this.formulario.getRawValue().empresa ?? '',
                plataforma_id: this.formulario.getRawValue().plataforma_id ?? 0,
                status: this.formulario.getRawValue().status ?? ('ENVIADO' as StatusCandidatura),
                observacoes: this.formulario.getRawValue().observacoes ?? '',
            }),
            () => ({
                nome: this.formulario.getRawValue().nome ?? '',
                empresa: this.formulario.getRawValue().empresa ?? '',
                plataforma_id: this.formulario.getRawValue().plataforma_id ?? 0,
                status: this.formulario.getRawValue().status ?? ('ENVIADO' as StatusCandidatura),
                observacoes: this.formulario.getRawValue().observacoes ?? '',
                ativo: this.dados?.candidatura?.ativo ?? true,
            }),
        );
    }

    fechar(): void {
        this.salvarEstado.fechar();
    }
}
