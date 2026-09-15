import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { NotificacaoService } from '../services/notificacao.service';
import { ConfirmacaoExclusaoDialogComponent } from '../components/confirmacao-exclusao-dialog/confirmacao-exclusao-dialog.component';
import { ConfigListagem, OrquestradorListagem } from './listagem';

interface Item {
    id: number;
    nome: string;
}

interface Filtro {
    busca?: string;
}

const ITENS = [{ id: 1, nome: 'LinkedIn' }];

function criar(overrides: Partial<ConfigListagem<Item, Filtro>> = {}): {
    listagem: OrquestradorListagem<Item, Filtro>;
    config: ConfigListagem<Item, Filtro>;
    notificacao: NotificacaoService;
    dialog: MatDialog;
} {
    const listar = vi.fn().mockReturnValue(of({ items: ITENS, count: 1 }));
    const excluir = vi.fn().mockReturnValue(of(void 0));
    const notificacao = { sucesso: vi.fn(), erro: vi.fn() } as unknown as NotificacaoService;
    const dialog = { open: vi.fn() } as unknown as MatDialog;
    const config: ConfigListagem<Item, Filtro> = {
        listar,
        excluir,
        notificacao,
        dialog,
        mensagemExcluido: 'Excluído.',
        tituloExclusao: 'Excluir item',
        extrairId: (item) => item.id,
        extrairNome: (item) => item.nome,
        montarFiltro: () => ({}),
        ...overrides,
    };
    return { listagem: new OrquestradorListagem(config), config, notificacao, dialog };
}

describe('OrquestradorListagem', () => {
    it('should create', () => {
        expect(criar().listagem).toBeTruthy();
    });

    it('deve carregar a lista ao iniciar com página 1-indexada', () => {
        const { listagem, config } = criar();
        listagem.iniciar();
        expect(config.listar).toHaveBeenCalledWith({
            busca: undefined,
            page: 1,
            page_size: 10,
        });
        expect(listagem.itens).toEqual(ITENS);
        expect(listagem.total).toBe(1);
    });

    it('deve buscar com debounce e incluir filtros do adapter', () => {
        const { listagem, config } = criar({
            montarFiltro: () => ({ busca: undefined }) as Filtro,
        });
        vi.useFakeTimers();
        try {
            listagem.iniciar();
            vi.clearAllMocks();
            listagem.busca.setValue('link');
            vi.advanceTimersByTime(300);
            expect(config.listar).toHaveBeenCalledWith({
                busca: 'link',
                page: 1,
                page_size: 10,
            });
            expect(listagem.pagina).toBe(0);
        } finally {
            vi.useRealTimers();
        }
    });

    it('deve recarregar do início ao trocar filtro extra', () => {
        const { listagem, config } = criar();
        listagem.pagina = 2;
        listagem.recarregarDoInicio();
        expect(listagem.pagina).toBe(0);
        expect(config.listar).toHaveBeenCalled();
    });

    it('deve recarregar ao trocar de página', () => {
        const { listagem, config } = criar();
        listagem.iniciar();
        vi.clearAllMocks();
        listagem.paginar({ pageIndex: 1, pageSize: 5, length: 1 } as never);
        expect(config.listar).toHaveBeenCalledWith({
            busca: undefined,
            page: 2,
            page_size: 5,
        });
    });

    it('deve recarregar quando o dialog sinaliza salvamento', () => {
        const { listagem, config } = criar();
        listagem.iniciar();
        vi.clearAllMocks();
        listagem.acompanharDialogo(of(true));
        expect(config.listar).toHaveBeenCalled();
    });

    it('não deve recarregar quando o dialog é cancelado', () => {
        const { listagem, config } = criar();
        listagem.iniciar();
        vi.clearAllMocks();
        listagem.acompanharDialogo(of(false));
        expect(config.listar).not.toHaveBeenCalled();
    });

    it('deve confirmar exclusão com nome e título e excluir ao confirmar', () => {
        const { listagem, config, notificacao } = criar();
        const afterClosed = vi.fn().mockReturnValue(of(true));
        vi.mocked(config.dialog.open).mockReturnValue({ afterClosed } as never);
        listagem.iniciar();
        vi.clearAllMocks();
        listagem.confirmarExclusao(ITENS[0]);
        expect(config.dialog.open).toHaveBeenCalledWith(ConfirmacaoExclusaoDialogComponent, {
            width: '400px',
            data: { nome: 'LinkedIn', titulo: 'Excluir item' },
        });
        expect(config.excluir).toHaveBeenCalledWith(1);
        expect(notificacao.sucesso).toHaveBeenCalledWith('Excluído.');
        expect(config.listar).toHaveBeenCalled();
    });

    it('não deve excluir ao cancelar a confirmação', () => {
        const { listagem, config } = criar();
        const afterClosed = vi.fn().mockReturnValue(of(false));
        vi.mocked(config.dialog.open).mockReturnValue({ afterClosed } as never);
        listagem.confirmarExclusao(ITENS[0]);
        expect(config.excluir).not.toHaveBeenCalled();
    });

    it('deve voltar uma página ao excluir o último item', () => {
        const { listagem, config } = criar();
        const afterClosed = vi.fn().mockReturnValue(of(true));
        vi.mocked(config.dialog.open).mockReturnValue({ afterClosed } as never);
        listagem.iniciar();
        listagem.pagina = 1;
        listagem.confirmarExclusao(ITENS[0]);
        expect(listagem.pagina).toBe(0);
    });

    it('deve exibir erro e manter lista quando exclusão falha', () => {
        const { listagem, notificacao } = criar({
            excluir: () => throwError(() => new Error('falha')),
        });
        const afterClosed = vi.fn().mockReturnValue(of(true));
        vi.mocked(listagem['config'].dialog.open).mockReturnValue({ afterClosed } as never);
        listagem.iniciar();
        listagem.confirmarExclusao(ITENS[0]);
        expect(notificacao.erro).toHaveBeenCalled();
        expect(listagem.itens).toEqual(ITENS);
    });
});
