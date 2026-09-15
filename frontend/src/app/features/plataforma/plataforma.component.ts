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
import { MatTableModule } from '@angular/material/table';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import { Plataforma } from '../../core/models/plataforma.models';
import { PlataformaService } from '../../core/services/plataforma.service';
import { NotificacaoService } from '../../shared/services/notificacao.service';
import { PlataformaDialogComponent } from './plataforma-dialog.component';
import { ConfirmacaoExclusaoDialogComponent } from './confirmacao-exclusao-dialog.component';

@Component({
    selector: 'app-plataforma',
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
        MatTableModule,
        ReactiveFormsModule,
    ],
    templateUrl: './plataforma.component.html',
    styleUrl: './plataforma.component.scss',
})
export class PlataformaComponent implements OnInit {
    private readonly plataformas = inject(PlataformaService);
    private readonly notificacao = inject(NotificacaoService);
    private readonly dialog = inject(MatDialog);

    protected readonly colunas = ['id', 'nome', 'site_url', 'acoes'];
    protected plataformasLista: Plataforma[] = [];
    protected total = 0;
    protected pagina = 0;
    protected tamanhoPagina = 10;
    protected carregamento = false;

    protected readonly busca = new FormControl('', { nonNullable: true });

    ngOnInit(): void {
        this.busca.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => {
            this.pagina = 0;
            this.carregar();
        });
        this.carregar();
    }

    carregar(): void {
        if (this.carregamento) {
            return;
        }
        this.carregamento = true;
        const busca = this.busca.value.trim();
        this.plataformas
            .listar({
                busca: busca || undefined,
                page: this.pagina + 1,
                page_size: this.tamanhoPagina,
            })
            .pipe(finalize(() => (this.carregamento = false)))
            .subscribe({
                next: (pagina) => {
                    this.plataformasLista = pagina.items;
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

    limparBusca(): void {
        this.busca.setValue('');
    }

    abrirDialog(): void {
        this.dialog
            .open(PlataformaDialogComponent, { width: '480px' })
            .afterClosed()
            .subscribe((salvou: boolean | undefined) => {
                if (salvou) {
                    this.carregar();
                }
            });
    }

    abrirEdicao(plataforma: Plataforma): void {
        this.dialog
            .open(PlataformaDialogComponent, {
                width: '480px',
                data: { plataforma },
            })
            .afterClosed()
            .subscribe((salvou: boolean | undefined) => {
                if (salvou) {
                    this.carregar();
                }
            });
    }

    confirmarExclusao(plataforma: Plataforma): void {
        this.dialog
            .open(ConfirmacaoExclusaoDialogComponent, {
                width: '400px',
                data: { nome: plataforma.nome },
            })
            .afterClosed()
            .subscribe((confirmou: boolean | undefined) => {
                if (confirmou) {
                    this.excluir(plataforma);
                }
            });
    }

    private excluir(plataforma: Plataforma): void {
        this.plataformas.excluir(plataforma.id).subscribe({
            next: () => {
                this.notificacao.sucesso('Plataforma excluída.');
                if (this.plataformasLista.length === 1 && this.pagina > 0) {
                    this.pagina--;
                }
                this.carregar();
            },
            error: (erro) => this.notificacao.erro(erro),
        });
    }
}
