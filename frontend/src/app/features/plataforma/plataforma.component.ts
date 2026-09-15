import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { Plataforma, PlataformaFiltro } from '../../core/models/plataforma.models';
import { PlataformaService } from '../../core/services/plataforma.service';
import { NotificacaoService } from '../../shared/services/notificacao.service';
import { OrquestradorListagem } from '../../shared/listagem/listagem';
import { PlataformaDialogComponent } from './plataforma-dialog.component';

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
    protected readonly listagem = new OrquestradorListagem<Plataforma, PlataformaFiltro>({
        listar: (filtro) => this.plataformas.listar(filtro),
        excluir: (id) => this.plataformas.excluir(id),
        notificacao: this.notificacao,
        dialog: this.dialog,
        mensagemExcluido: 'Plataforma excluída.',
        tituloExclusao: 'Excluir Plataforma',
        extrairId: (plataforma) => plataforma.id,
        extrairNome: (plataforma) => plataforma.nome,
        montarFiltro: () => ({}),
    });

    protected get plataformasLista(): Plataforma[] {
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
        this.listagem.iniciar();
    }

    carregar(): void {
        this.listagem.carregar();
    }

    paginar(evento: PageEvent): void {
        this.listagem.paginar(evento);
    }

    limparBusca(): void {
        this.listagem.limparBusca();
    }

    abrirDialog(): void {
        this.listagem.acompanharDialogo(
            this.dialog.open(PlataformaDialogComponent, { width: '480px' }).afterClosed(),
        );
    }

    abrirEdicao(plataforma: Plataforma): void {
        this.listagem.acompanharDialogo(
            this.dialog
                .open(PlataformaDialogComponent, {
                    width: '480px',
                    data: { plataforma },
                })
                .afterClosed(),
        );
    }

    confirmarExclusao(plataforma: Plataforma): void {
        this.listagem.confirmarExclusao(plataforma);
    }
}
