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
import {
    Candidatura,
    CandidaturaFiltro,
    STATUS_CANDIDATURA,
    StatusCandidatura,
} from '../../core/models/candidatura.models';
import { Plataforma } from '../../core/models/plataforma.models';
import { CandidaturaService } from '../../core/services/candidatura.service';
import { PlataformaService } from '../../core/services/plataforma.service';
import { NotificacaoService } from '../../shared/services/notificacao.service';
import { OrquestradorListagem } from '../../shared/listagem/listagem';
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
    protected plataformasLista: Plataforma[] = [];
    protected plataformasNomes: Record<number, string> = {};
    protected readonly opcoesStatus = STATUS_CANDIDATURA;

    protected readonly filtroStatus = new FormControl<StatusCandidatura | ''>('', {
        nonNullable: true,
    });
    protected readonly filtroPlataforma = new FormControl<number | ''>('', { nonNullable: true });

    protected readonly listagem = new OrquestradorListagem<Candidatura, CandidaturaFiltro>({
        listar: (filtro) => this.candidaturas.listar(filtro),
        excluir: (id) => this.candidaturas.excluir(id),
        notificacao: this.notificacao,
        dialog: this.dialog,
        mensagemExcluido: 'Candidatura excluída.',
        tituloExclusao: 'Excluir Candidatura',
        extrairId: (candidatura) => candidatura.id,
        extrairNome: (candidatura) => candidatura.nome,
        montarFiltro: () => ({
            status: this.filtroStatus.value || undefined,
            plataforma_id:
                this.filtroPlataforma.value === '' ? undefined : this.filtroPlataforma.value,
        }),
    });

    protected get candidaturasLista(): Candidatura[] {
        return this.listagem.itens;
    }

    protected get total(): number {
        return this.listagem.total;
    }

    protected get pagina(): number {
        return this.listagem.pagina;
    }

    protected get tamanhoPagina(): number {
        return this.listagem.tamanhoPagina;
    }

    protected get carregamento(): boolean {
        return this.listagem.carregamento;
    }

    protected get busca() {
        return this.listagem.busca;
    }

    ngOnInit(): void {
        this.filtroStatus.valueChanges.subscribe(() => this.listagem.recarregarDoInicio());
        this.filtroPlataforma.valueChanges.subscribe(() => this.listagem.recarregarDoInicio());
        this.carregarPlataformas();
        this.listagem.iniciar();
    }

    carregar(): void {
        this.listagem.carregar();
    }

    paginar(evento: PageEvent): void {
        this.listagem.paginar(evento);
    }

    limparFiltros(): void {
        this.listagem.limparBusca();
        this.filtroStatus.setValue('');
        this.filtroPlataforma.setValue('');
    }

    temFiltroAtivo(): boolean {
        return (
            !!this.listagem.busca.value ||
            !!this.filtroStatus.value ||
            this.filtroPlataforma.value !== ''
        );
    }

    nomePlataforma(plataformaId: number): string {
        return this.plataformasNomes[plataformaId] ?? '—';
    }

    rotuloStatus(status: StatusCandidatura): string {
        return this.opcoesStatus.find((opcao) => opcao.valor === status)?.rotulo ?? status;
    }

    abrirDialog(): void {
        this.listagem.acompanharDialogo(
            this.dialog.open(CandidaturaDialogComponent, { width: '480px' }).afterClosed(),
        );
    }

    abrirEdicao(candidatura: Candidatura): void {
        this.listagem.acompanharDialogo(
            this.dialog
                .open(CandidaturaDialogComponent, {
                    width: '480px',
                    data: { candidatura },
                })
                .afterClosed(),
        );
    }

    confirmarExclusao(candidatura: Candidatura): void {
        this.listagem.confirmarExclusao(candidatura);
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
}
