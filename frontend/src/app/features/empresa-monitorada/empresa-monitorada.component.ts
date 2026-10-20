import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
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
import { finalize } from 'rxjs';
import {
    EmpresaMonitorada,
    EmpresaMonitoradaFiltro,
} from '../../core/models/empresa-monitorada.models';
import { EmpresaMonitoradaService } from '../../core/services/empresa-monitorada.service';
import { NotificacaoService } from '../../shared/services/notificacao.service';
import { OrquestradorListagem } from '../../shared/listagem/listagem';
import { EmpresaMonitoradaDialogComponent } from './empresa-monitorada-dialog.component';

@Component({
    selector: 'app-empresa-monitorada',
    standalone: true,
    imports: [
        DatePipe,
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
    templateUrl: './empresa-monitorada.component.html',
    styleUrl: './empresa-monitorada.component.scss',
})
export class EmpresaMonitoradaComponent implements OnInit {
    private readonly empresas = inject(EmpresaMonitoradaService);
    private readonly notificacao = inject(NotificacaoService);
    private readonly dialog = inject(MatDialog);

    protected readonly colunas = ['id', 'nome', 'url_vagas', 'ultima_consulta', 'acoes'];
    protected readonly consultandoId = signal<number | null>(null);
    protected readonly listagem = new OrquestradorListagem<
        EmpresaMonitorada,
        EmpresaMonitoradaFiltro
    >({
        listar: (filtro) => this.empresas.listar(filtro),
        excluir: (id) => this.empresas.excluir(id),
        notificacao: this.notificacao,
        dialog: this.dialog,
        mensagemExcluido: 'Empresa monitorada excluída.',
        tituloExclusao: 'Excluir Empresa monitorada',
        extrairId: (empresa) => empresa.id,
        extrairNome: (empresa) => empresa.nome,
        montarFiltro: () => ({}),
    });

    protected get empresasLista(): EmpresaMonitorada[] {
        return this.listagem.itens();
    }

    protected get total(): number {
        return this.listagem.total();
    }

    protected get pagina(): number {
        return this.listagem.pagina();
    }

    protected get tamanhoPagina(): number {
        return this.listagem.tamanhoPagina();
    }

    protected get carregamento(): boolean {
        return this.listagem.carregamento();
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
            this.dialog.open(EmpresaMonitoradaDialogComponent, { width: '480px' }).afterClosed(),
        );
    }

    abrirEdicao(empresa: EmpresaMonitorada): void {
        this.listagem.acompanharDialogo(
            this.dialog
                .open(EmpresaMonitoradaDialogComponent, {
                    width: '480px',
                    data: { empresa },
                })
                .afterClosed(),
        );
    }

    consultar(empresa: EmpresaMonitorada): void {
        if (this.consultandoId() !== null) {
            return;
        }
        this.consultandoId.set(empresa.id);
        this.empresas
            .consultar(empresa.id)
            .pipe(finalize(() => this.consultandoId.set(null)))
            .subscribe({
                next: () => {
                    this.notificacao.sucesso('Consulta registrada.');
                    this.listagem.carregar();
                },
                error: (erro) => this.notificacao.erro(erro),
            });
    }

    confirmarExclusao(empresa: EmpresaMonitorada): void {
        this.listagem.confirmarExclusao(empresa);
    }
}
