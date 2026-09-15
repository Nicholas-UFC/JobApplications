import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ConfirmacaoExclusaoDialogComponent } from './confirmacao-exclusao-dialog.component';
import { PlataformaDialogComponent } from './plataforma-dialog.component';
import { PlataformaComponent } from './plataforma.component';
import { PlataformaService } from '../../core/services/plataforma.service';
import { NotificacaoService } from '../../shared/services/notificacao.service';

const PAGINA = {
    items: [{ id: 1, nome: 'LinkedIn', ativo: true, site_url: 'https://linkedin.com' }],
    count: 1,
};

function simularDialog(valor: boolean): void {
    vi.spyOn(MatDialog.prototype, 'open').mockReturnValue({
        afterClosed: () => of(valor),
    } as never);
}

describe('PlataformaComponent', () => {
    let component: PlataformaComponent;
    let fixture: ComponentFixture<PlataformaComponent>;
    let service: PlataformaService;
    let notificacao: NotificacaoService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PlataformaComponent],
            providers: [provideHttpClient(), provideRouter([])],
        }).compileComponents();

        fixture = TestBed.createComponent(PlataformaComponent);
        component = fixture.componentInstance;
        service = TestBed.inject(PlataformaService);
        notificacao = TestBed.inject(NotificacaoService);
        vi.spyOn(service, 'listar').mockReturnValue(of(PAGINA));
        fixture.detectChanges();
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('deve carregar a lista ao iniciar', () => {
        expect(service.listar).toHaveBeenCalledWith({
            busca: undefined,
            page: 1,
            page_size: 10,
        });
        expect(component['plataformasLista']).toEqual(PAGINA.items);
        expect(component['total']).toBe(1);
    });

    it('deve buscar no servidor com debounce', () => {
        vi.useFakeTimers();
        try {
            vi.clearAllMocks();
            component['busca'].setValue('link');
            vi.advanceTimersByTime(300);
            expect(service.listar).toHaveBeenCalledWith({
                busca: 'link',
                page: 1,
                page_size: 10,
            });
            expect(component['pagina']).toBe(0);
        } finally {
            vi.useRealTimers();
        }
    });

    it('deve recarregar ao trocar de página', () => {
        vi.clearAllMocks();
        component['paginar']({ pageIndex: 1, pageSize: 5, length: 1 } as never);
        expect(service.listar).toHaveBeenCalledWith({
            busca: undefined,
            page: 2,
            page_size: 5,
        });
    });

    it('deve abrir confirmação com o nome ao excluir', () => {
        simularDialog(false);
        component['confirmarExclusao'](PAGINA.items[0]);
        expect(MatDialog.prototype.open).toHaveBeenCalledWith(ConfirmacaoExclusaoDialogComponent, {
            width: '400px',
            data: { nome: 'LinkedIn' },
        });
    });

    it('deve excluir e recarregar ao confirmar', () => {
        simularDialog(true);
        const excluir = vi.spyOn(service, 'excluir').mockReturnValue(of(void 0));
        const sucesso = vi.spyOn(notificacao, 'sucesso');
        vi.clearAllMocks();
        component['confirmarExclusao'](PAGINA.items[0]);
        expect(excluir).toHaveBeenCalledWith(1);
        expect(sucesso).toHaveBeenCalledWith('Plataforma excluída.');
        expect(service.listar).toHaveBeenCalled();
    });

    it('não deve excluir ao cancelar a confirmação', () => {
        simularDialog(false);
        const excluir = vi.spyOn(service, 'excluir');
        component['confirmarExclusao'](PAGINA.items[0]);
        expect(excluir).not.toHaveBeenCalled();
    });

    it('deve abrir edição com os dados salvos e recarregar ao salvar', () => {
        simularDialog(true);
        component['abrirEdicao'](PAGINA.items[0]);
        expect(MatDialog.prototype.open).toHaveBeenCalledWith(PlataformaDialogComponent, {
            width: '480px',
            data: { plataforma: PAGINA.items[0] },
        });
        expect(service.listar).toHaveBeenCalled();
    });

    it('não deve recarregar ao cancelar a edição', () => {
        simularDialog(false);
        vi.clearAllMocks();
        component['abrirEdicao'](PAGINA.items[0]);
        expect(service.listar).not.toHaveBeenCalled();
    });

    it('deve exibir erro e manter lista quando exclusão falha', () => {
        simularDialog(true);
        vi.spyOn(service, 'excluir').mockReturnValue(throwError(() => new Error('em uso')));
        const erro = vi.spyOn(notificacao, 'erro');
        component['confirmarExclusao'](PAGINA.items[0]);
        expect(erro).toHaveBeenCalled();
        expect(component['plataformasLista']).toEqual(PAGINA.items);
    });
});
