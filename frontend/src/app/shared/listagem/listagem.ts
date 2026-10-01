import { FormControl } from '@angular/forms';
import { signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Observable, debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import { Pagina } from '../models/pagina.models';
import { NotificacaoService } from '../services/notificacao.service';
import {
    ConfirmacaoExclusaoDialogComponent,
    ConfirmacaoExclusaoDados,
} from '../components/confirmacao-exclusao-dialog/confirmacao-exclusao-dialog.component';

/**
 * Configuração do adapter: o que muda entre Candidatura e Plataforma.
 * Tudo que é igual (debounce, pagina + 1, afterClosed, widths) mora dentro.
 */
export interface ConfigListagem<T, F> {
    listar: (
        filtro: F & { busca?: string; page: number; page_size: number },
    ) => Observable<Pagina<T>>;
    excluir: (id: number) => Observable<void>;
    notificacao: NotificacaoService;
    dialog: MatDialog;
    mensagemExcluido: string;
    tituloExclusao: string;
    extrairId: (item: T) => number;
    extrairNome: (item: T) => string;
    montarFiltro: () => F;
}

/**
 * Orquestração de listagem paginada com busca, exclusão e recarga pós-dialog.
 * Composition: cada componente instancia o seu com a sua ConfigListagem.
 */
export class OrquestradorListagem<T, F> {
    readonly itens = signal<T[]>([]);
    readonly total = signal(0);
    readonly pagina = signal(0);
    readonly tamanhoPagina = signal(10);
    readonly carregamento = signal(false);

    readonly busca = new FormControl('', { nonNullable: true });

    constructor(private readonly config: ConfigListagem<T, F>) {}

    iniciar(): void {
        this.busca.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => {
            this.pagina.set(0);
            this.carregar();
        });
        this.carregar();
    }

    /** Chamado por filtros extras do adapter (ex. Status, Plataforma). */
    recarregarDoInicio(): void {
        this.pagina.set(0);
        this.carregar();
    }

    carregar(): void {
        if (this.carregamento()) {
            return;
        }
        this.carregamento.set(true);
        const busca = this.busca.value.trim();
        this.config
            .listar({
                ...this.config.montarFiltro(),
                busca: busca || undefined,
                page: this.pagina() + 1,
                page_size: this.tamanhoPagina(),
            })
            .pipe(finalize(() => this.carregamento.set(false)))
            .subscribe({
                next: (pagina) => {
                    this.itens.set(pagina.items);
                    this.total.set(pagina.count);
                },
                error: (erro) => this.config.notificacao.erro(erro),
            });
    }

    paginar(evento: PageEvent): void {
        this.pagina.set(evento.pageIndex);
        this.tamanhoPagina.set(evento.pageSize);
        this.carregar();
    }

    limparBusca(): void {
        this.busca.setValue('');
    }

    /** Recarrega a lista se o dialog sinalizou salvamento (afterClosed === true). */
    acompanharDialogo(afterClosed$: Observable<boolean | undefined>): void {
        afterClosed$.subscribe((salvou: boolean | undefined) => {
            if (salvou) {
                this.carregar();
            }
        });
    }

    confirmarExclusao(item: T): void {
        this.config.dialog
            .open<ConfirmacaoExclusaoDialogComponent, ConfirmacaoExclusaoDados, boolean>(
                ConfirmacaoExclusaoDialogComponent,
                {
                    width: '400px',
                    data: {
                        nome: this.config.extrairNome(item),
                        titulo: this.config.tituloExclusao,
                    },
                },
            )
            .afterClosed()
            .subscribe((confirmou: boolean | undefined) => {
                if (confirmou) {
                    this.excluir(item);
                }
            });
    }

    private excluir(item: T): void {
        this.config.excluir(this.config.extrairId(item)).subscribe({
            next: () => {
                this.config.notificacao.sucesso(this.config.mensagemExcluido);
                if (this.itens().length === 1 && this.pagina() > 0) {
                    this.pagina.set(this.pagina() - 1);
                }
                this.carregar();
            },
            error: (erro) => this.config.notificacao.erro(erro),
        });
    }
}
