import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { finalize } from 'rxjs';
import {
    Candidatura,
    STATUS_CANDIDATURA,
    StatusCandidatura,
} from '../../core/models/candidatura.models';
import { Plataforma } from '../../core/models/plataforma.models';
import { CandidaturaService } from '../../core/services/candidatura.service';
import { PlataformaService } from '../../core/services/plataforma.service';
import { NotificacaoService } from '../../shared/services/notificacao.service';

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

    protected readonly modoEdicao = this.dados?.candidatura != null;
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

    protected carregamento = false;

    ngOnInit(): void {
        this.plataformas.listar({ page_size: 100 }).subscribe({
            next: (pagina) => (this.plataformasLista = pagina.items),
            error: (erro) => this.notificacao.erro(erro),
        });
    }

    salvar(): void {
        if (this.formulario.invalid || this.carregamento) {
            return;
        }
        const valores = this.formulario.getRawValue();
        const payload = {
            nome: valores.nome ?? '',
            empresa: valores.empresa ?? '',
            plataforma_id: valores.plataforma_id ?? 0,
            status: valores.status ?? ('ENVIADO' as StatusCandidatura),
            observacoes: valores.observacoes ?? '',
        };
        this.carregamento = true;
        const requisicao =
            this.modoEdicao && this.dados?.candidatura
                ? this.candidaturas.atualizar(this.dados.candidatura.id, {
                      ...payload,
                      ativo: this.dados.candidatura.ativo,
                  })
                : this.candidaturas.criar(payload);
        requisicao.pipe(finalize(() => (this.carregamento = false))).subscribe({
            next: () => {
                this.notificacao.sucesso(
                    this.modoEdicao ? 'Candidatura atualizada.' : 'Candidatura salva.',
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
