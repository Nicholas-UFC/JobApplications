import { FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Observable, finalize } from 'rxjs';
import { NotificacaoService } from '../services/notificacao.service';

/**
 * Configuração do adapter: o que muda entre Candidatura e Plataforma.
 * O formulário e a montagem do payload ficam no adapter; o resto mora dentro.
 */
export interface ConfigSalvar<Create, Update> {
    criar: (payload: Create) => Observable<unknown>;
    atualizar: (id: number, payload: Update) => Observable<unknown>;
    notificacao: NotificacaoService;
    dialogRef: MatDialogRef<unknown>;
    mensagemCriado: string;
    mensagemAtualizado: string;
}

/**
 * Orquestração de salvamento criar/editar com guarda, finalize, toast e close.
 * Composition: cada dialog instancia o seu com a sua ConfigSalvar.
 */
export class OrquestradorSalvar<Create, Update> {
    carregamento = false;

    readonly modoEdicao: boolean;

    constructor(
        private readonly config: ConfigSalvar<Create, Update>,
        private readonly idEdicao: number | null | undefined,
    ) {
        this.modoEdicao = idEdicao != null;
    }

    salvar(
        formulario: FormGroup,
        montarCriacao: () => Create,
        montarAtualizacao: () => Update,
    ): void {
        if (formulario.invalid || this.carregamento) {
            return;
        }
        this.carregamento = true;
        const requisicao =
            this.modoEdicao && this.idEdicao != null
                ? this.config.atualizar(this.idEdicao, montarAtualizacao())
                : this.config.criar(montarCriacao());
        requisicao.pipe(finalize(() => (this.carregamento = false))).subscribe({
            next: () => {
                this.config.notificacao.sucesso(
                    this.modoEdicao ? this.config.mensagemAtualizado : this.config.mensagemCriado,
                );
                this.config.dialogRef.close(true);
            },
            error: (erro) => this.config.notificacao.erro(erro),
        });
    }

    fechar(): void {
        this.config.dialogRef.close(false);
    }
}
