import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { NotificacaoService } from '../services/notificacao.service';
import { ConfigSalvar, OrquestradorSalvar } from './dialogo-salvar';

interface Create {
    nome: string;
}

interface Update {
    nome: string;
    ativo: boolean;
}

function criarFormulario(valido: boolean): FormGroup {
    return new FormGroup({
        nome: new FormControl(valido ? 'LinkedIn' : '', [Validators.required]),
    });
}

function criar(
    overrides: Partial<ConfigSalvar<Create, Update>> = {},
    idEdicao: number | null = null,
): {
    salvar: OrquestradorSalvar<Create, Update>;
    config: ConfigSalvar<Create, Update>;
    notificacao: NotificacaoService;
} {
    const criarFn = vi.fn().mockReturnValue(of({ id: 1 }));
    const atualizar = vi.fn().mockReturnValue(of({ id: 1 }));
    const notificacao = { sucesso: vi.fn(), erro: vi.fn() } as unknown as NotificacaoService;
    const dialogRef = { close: vi.fn() } as unknown as MatDialogRef<unknown>;
    const config: ConfigSalvar<Create, Update> = {
        criar: criarFn,
        atualizar,
        notificacao,
        dialogRef,
        mensagemCriado: 'Salvo.',
        mensagemAtualizado: 'Atualizado.',
        ...overrides,
    };
    return { salvar: new OrquestradorSalvar(config, idEdicao), config, notificacao };
}

describe('OrquestradorSalvar', () => {
    it('should create', () => {
        expect(criar().salvar).toBeTruthy();
    });

    it('não deve chamar criar com formulário inválido', () => {
        const { salvar, config } = criar();
        salvar.salvar(
            criarFormulario(false),
            () => ({ nome: '' }),
            () => ({
                nome: '',
                ativo: true,
            }),
        );
        expect(config.criar).not.toHaveBeenCalled();
    });

    it('deve criar e fechar com true', () => {
        const { salvar, config, notificacao } = criar();
        const fechar = vi.spyOn(config.dialogRef, 'close');
        salvar.salvar(
            criarFormulario(true),
            () => ({ nome: 'LinkedIn' }),
            () => ({
                nome: 'LinkedIn',
                ativo: true,
            }),
        );
        expect(config.criar).toHaveBeenCalledWith({ nome: 'LinkedIn' });
        expect(notificacao.sucesso).toHaveBeenCalledWith('Salvo.');
        expect(fechar).toHaveBeenCalledWith(true);
        expect(salvar.carregamento).toBe(false);
    });

    it('deve atualizar preservando o id de edição e fechar com true', () => {
        const { salvar, config } = criar({}, 1);
        expect(salvar.modoEdicao).toBe(true);
        salvar.salvar(
            criarFormulario(true),
            () => ({ nome: 'Novo' }),
            () => ({
                nome: 'Novo',
                ativo: true,
            }),
        );
        expect(config.atualizar).toHaveBeenCalledWith(1, { nome: 'Novo', ativo: true });
        expect(config.criar).not.toHaveBeenCalled();
    });

    it('deve exibir erro e resetar carregamento quando falhar', () => {
        const { salvar, notificacao, config } = criar({
            criar: () => throwError(() => new Error('falha')),
        });
        const fechar = vi.spyOn(config.dialogRef, 'close');
        salvar.salvar(
            criarFormulario(true),
            () => ({ nome: 'LinkedIn' }),
            () => ({
                nome: 'LinkedIn',
                ativo: true,
            }),
        );
        expect(notificacao.erro).toHaveBeenCalled();
        expect(fechar).not.toHaveBeenCalled();
        expect(salvar.carregamento).toBe(false);
    });

    it('deve fechar com false ao cancelar', () => {
        const { salvar, config } = criar();
        salvar.fechar();
        expect(config.dialogRef.close).toHaveBeenCalledWith(false);
    });
});
