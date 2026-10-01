import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';
import {
    Candidatura,
    STATUS_CANDIDATURA,
    StatusCandidatura,
} from '../../core/models/candidatura.models';
import { CandidaturaService } from '../../core/services/candidatura.service';
import { NotificacaoService } from '../../shared/services/notificacao.service';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [MatButtonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule, RouterLink],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
})
export class Home implements OnInit {
    private readonly candidaturas = inject(CandidaturaService);
    private readonly notificacao = inject(NotificacaoService);

    protected readonly trilho = STATUS_CANDIDATURA;
    protected readonly totais = signal<Record<StatusCandidatura, number>>({
        ENVIADO: 0,
        REJEITADO: 0,
        ENTREVISTA: 0,
        PROPOSTA: 0,
        APROVADA: 0,
    });
    protected readonly total = signal(0);
    protected readonly recentes = signal<Candidatura[]>([]);
    protected readonly carregamento = signal(true);

    ngOnInit(): void {
        forkJoin(
            this.trilho.map((etapa) =>
                this.candidaturas.listar({ status: etapa.valor, page: 1, page_size: 1 }),
            ),
        ).subscribe({
            next: (paginas) => {
                const acumulados: Record<StatusCandidatura, number> = {
                    ENVIADO: 0,
                    REJEITADO: 0,
                    ENTREVISTA: 0,
                    PROPOSTA: 0,
                    APROVADA: 0,
                };
                paginas.forEach((pagina, indice) => {
                    acumulados[this.trilho[indice].valor] = pagina.count;
                });
                this.totais.set(acumulados);
                this.total.set(Object.values(acumulados).reduce((soma, valor) => soma + valor, 0));
            },
            error: (erro) => this.notificacao.erro(erro),
        });

        this.candidaturas.listar({ page: 1, page_size: 5 }).subscribe({
            next: (pagina) => {
                this.recentes.set(pagina.items);
                this.carregamento.set(false);
            },
            error: (erro) => {
                this.notificacao.erro(erro);
                this.carregamento.set(false);
            },
        });
    }

    protected rotulo(status: StatusCandidatura): string {
        return this.trilho.find((etapa) => etapa.valor === status)?.rotulo ?? status;
    }

    protected largura(status: StatusCandidatura): string {
        const total = this.total();
        if (total === 0) {
            return '0%';
        }
        const fatia = (this.totais()[status] / total) * 100;
        if (fatia === 0) {
            return '0%';
        }
        return `${Math.max(fatia, 9)}%`;
    }
}
