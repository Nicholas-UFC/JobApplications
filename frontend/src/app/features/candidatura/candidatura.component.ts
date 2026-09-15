import { Component, inject, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import {
    Candidatura,
    STATUS_CANDIDATURA,
    StatusCandidatura,
} from '../../core/models/candidatura.models';
import { Plataforma } from '../../core/models/plataforma.models';
import { CandidaturaService } from '../../core/services/candidatura.service';
import { PlataformaService } from '../../core/services/plataforma.service';
import { NotificacaoService } from '../../shared/services/notificacao.service';
import { ConfirmacaoExclusaoDialogComponent } from '../../shared/components/confirmacao-exclusao-dialog/confirmacao-exclusao-dialog.component';
import { CandidaturaDialogComponent } from './candidatura-dialog.component';

@Component({
    selector: 'app-candidatura',
    standalone: true,
    imports: [
        MatButtonModule,
        MatCardModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatPaginatorModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        MatTableModule,
        ReactiveFormsModule,
    ],
    templateUrl: './candidatura.component.html',
    styleUrl: './candidatura.component.scss',
})
export class CandidaturaComponent implements OnInit {
    private readonly candidaturas = inject(CandidaturaService);
    private readonly plataformas = inject(PlataformaService);
    private readonly notificacao = inject(NotificacaoService);
    private readonly dialog = inject(MatDialog);

    protected readonly colunas = ['id', 'nome', 'empresa', 'plataforma', 'status', 'acoes'];
    protected candidaturasLista: Candidatura[] = [];
    protected plataformasLista: Plataforma[] = [];
    protected plataformasNomes: Record<number, string> = {};
    protected readonly opcoesStatus = STATUS_CANDIDATURA;
    protected total = 0;
    protected pagina = 0;
    protected tamanhoPagina = 10;
    protected carregamento = false;

    protected readonly busca = new FormControl('', { nonNullable: true });
    protected readonly filtroStatus = new FormControl<StatusCandidatura | ''>('', {
        nonNullable: true,
    });
    protected readonly filtroPlataforma = new FormControl<number | ''>('', { nonNullable: true });

    ngOnInit(): void {
        this.busca.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => {
            this.pagina = 0;
            this.carregar();
        });
        this.filtroStatus.valueChanges.subscribe(() => {
            this.pagina = 0;
            this.carregar();
        });
        this.filtroPlataforma.valueChanges.subscribe(() => {
            this.pagina = 0;
            this.carregar();
        });
        this.carregarPlataformas();
        this.carregar();
    }

    carregar(): void {
        if (this.carregamento) {
            return;
        }
        this.carregamento = true;
        const busca = this.busca.value.trim();
        const status = this.filtroStatus.value || undefined;
        const plataformaId =
            this.filtroPlataforma.value === '' ? undefined : this.filtroPlataforma.value;
        this.candidaturas
            .listar({
                busca: busca || undefined,
                status,
                plataforma_id: plataformaId,
                page: this.pagina + 1,
                page_size: this.tamanhoPagina,
            })
            .pipe(finalize(() => (this.carregamento = false)))
            .subscribe({
                next: (pagina) => {
                    this.candidaturasLista = pagina.items;
                    this.total = pagina.count;
                },
                error: (erro) => this.notificacao.erro(erro),
            });
    }

    paginar(evento: PageEvent): void {
        this.pagina = evento.pageIndex;
        this.tamanhoPagina = evento.pageSize;
        this.carregar();
    }

    limparFiltros(): void {
        this.busca.setValue('');
        this.filtroStatus.setValue('');
        this.filtroPlataforma.setValue('');
    }

    temFiltroAtivo(): boolean {
        return (
            !!this.busca.value || !!this.filtroStatus.value || this.filtroPlataforma.value !== ''
        );
    }

    nomePlataforma(plataformaId: number): string {
        return this.plataformasNomes[plataformaId] ?? '—';
    }

    rotuloStatus(status: StatusCandidatura): string {
        return this.opcoesStatus.find((opcao) => opcao.valor === status)?.rotulo ?? status;
    }

    abrirDialog(): void {
        this.dialog
            .open(CandidaturaDialogComponent, { width: '480px' })
            .afterClosed()
            .subscribe((salvou: boolean | undefined) => {
                if (salvou) {
                    this.carregar();
                }
            });
    }

    abrirEdicao(candidatura: Candidatura): void {
        this.dialog
            .open(CandidaturaDialogComponent, {
                width: '480px',
                data: { candidatura },
            })
            .afterClosed()
            .subscribe((salvou: boolean | undefined) => {
                if (salvou) {
                    this.carregar();
                }
            });
    }

    confirmarExclusao(candidatura: Candidatura): void {
        this.dialog
            .open(ConfirmacaoExclusaoDialogComponent, {
                width: '400px',
                data: { nome: candidatura.nome, titulo: 'Excluir Candidatura' },
            })
            .afterClosed()
            .subscribe((confirmou: boolean | undefined) => {
                if (confirmou) {
                    this.excluir(candidatura);
                }
            });
    }

    private carregarPlataformas(): void {
        this.plataformas.listar({ page_size: 100 }).subscribe({
            next: (pagina) => {
                this.plataformasLista = pagina.items;
                this.plataformasNomes = Object.fromEntries(
                    pagina.items.map((plataforma) => [plataforma.id, plataforma.nome]),
                );
            },
            error: (erro) => this.notificacao.erro(erro),
        });
    }

    private excluir(candidatura: Candidatura): void {
        this.candidaturas.excluir(candidatura.id).subscribe({
            next: () => {
                this.notificacao.sucesso('Candidatura excluída.');
                if (this.candidaturasLista.length === 1 && this.pagina > 0) {
                    this.pagina--;
                }
                this.carregar();
            },
            error: (erro) => this.notificacao.erro(erro),
        });
    }
}
