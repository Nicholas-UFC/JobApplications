import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CandidaturaService } from '../../core/services/candidatura.service';
import { PlataformaService } from '../../core/services/plataforma.service';
import { NotificacaoService } from '../../shared/services/notificacao.service';
import { ConfirmacaoExclusaoDialogComponent } from '../plataforma/confirmacao-exclusao-dialog.component';
import { CandidaturaDialogComponent } from './candidatura-dialog.component';
import { CandidaturaComponent } from './candidatura.component';

const PAGINA = {
    items: [
        {
            id: 1,
            nome: 'Dev Frontend',
            ativo: true,
            empresa: 'Acme',
            observacoes: '',
            plataforma_id: 2,
            status: 'ENVIADO' as const,
        },
    ],
    count: 1,
};

const PAGINA_PLATAFORMAS = {
    items: [{ id: 2, nome: 'LinkedIn', ativo: true, site_url: 'https://linkedin.com' }],
    count: 1,
};

function simularDialog(valor: boolean): void {
    vi.spyOn(MatDialog.prototype, 'open').mockReturnValue({
        afterClosed: () => of(valor),
    } as never);
}

describe('CandidaturaComponent', () => {
    let component: CandidaturaComponent;
    let fixture: ComponentFixture<CandidaturaComponent>;
    let service: CandidaturaService;
    let plataformas: PlataformaService;
    let notificacao: NotificacaoService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CandidaturaComponent],
            providers: [provideHttpClient(), provideRouter([])],
        }).compileComponents();

        fixture = TestBed.createComponent(CandidaturaComponent);
        component = fixture.componentInstance;
        service = TestBed.inject(CandidaturaService);
        plataformas = TestBed.inject(PlataformaService);
        notificacao = TestBed.inject(NotificacaoService);
        vi.spyOn(service, 'listar').mockReturnValue(of(PAGINA));
        vi.spyOn(plataformas, 'listar').mockReturnValue(of(PAGINA_PLATAFORMAS));
        fixture.detectChanges();
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('deve carregar a lista ao iniciar', () => {
        expect(service.listar).toHaveBeenCalledWith({
            busca: undefined,
            status: undefined,
            plataforma_id: undefined,
            page: 1,
            page_size: 10,
        });
        expect(component['candidaturasLista']).toEqual(PAGINA.items);
        expect(component['total']).toBe(1);
    });

    it('deve carregar plataformas para exibir nomes', () => {
        expect(plataformas.listar).toHaveBeenCalledWith({ page_size: 100 });
        expect(component['nomePlataforma'](2)).toBe('LinkedIn');
    });

    it('deve buscar no servidor com debounce', () => {
        vi.useFakeTimers();
        try {
            vi.clearAllMocks();
            component['busca'].setValue('dev');
            vi.advanceTimersByTime(300);
            expect(service.listar).toHaveBeenCalledWith({
                busca: 'dev',
                status: undefined,
                plataforma_id: undefined,
                page: 1,
                page_size: 10,
            });
            expect(component['pagina']).toBe(0);
        } finally {
            vi.useRealTimers();
        }
    });

    it('deve filtrar por status e plataforma', () => {
        vi.clearAllMocks();
        component['filtroStatus'].setValue('ENTREVISTA');
        expect(service.listar).toHaveBeenCalledWith({
            busca: undefined,
            status: 'ENTREVISTA',
            plataforma_id: undefined,
            page: 1,
            page_size: 10,
        });
        vi.clearAllMocks();
        component['filtroPlataforma'].setValue(2);
        expect(service.listar).toHaveBeenCalledWith({
            busca: undefined,
            status: 'ENTREVISTA',
            plataforma_id: 2,
            page: 1,
            page_size: 10,
        });
    });

    it('deve recarregar ao trocar de página', () => {
        vi.clearAllMocks();
        component['paginar']({ pageIndex: 1, pageSize: 5, length: 1 } as never);
        expect(service.listar).toHaveBeenCalledWith({
            busca: undefined,
            status: undefined,
            plataforma_id: undefined,
            page: 2,
            page_size: 5,
        });
    });

    it('deve abrir confirmação com o nome ao excluir', () => {
        simularDialog(false);
        component['confirmarExclusao'](PAGINA.items[0]);
        expect(MatDialog.prototype.open).toHaveBeenCalledWith(ConfirmacaoExclusaoDialogComponent, {
            width: '400px',
            data: { nome: 'Dev Frontend', titulo: 'Excluir Candidatura' },
        });
    });

    it('deve excluir e recarregar ao confirmar', () => {
        simularDialog(true);
        const excluir = vi.spyOn(service, 'excluir').mockReturnValue(of(void 0));
        const sucesso = vi.spyOn(notificacao, 'sucesso');
        vi.clearAllMocks();
        component['confirmarExclusao'](PAGINA.items[0]);
        expect(excluir).toHaveBeenCalledWith(1);
        expect(sucesso).toHaveBeenCalledWith('Candidatura excluída.');
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
        expect(MatDialog.prototype.open).toHaveBeenCalledWith(CandidaturaDialogComponent, {
            width: '480px',
            data: { candidatura: PAGINA.items[0] },
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
        vi.spyOn(service, 'excluir').mockReturnValue(throwError(() => new Error('falha')));
        const erro = vi.spyOn(notificacao, 'erro');
        component['confirmarExclusao'](PAGINA.items[0]);
        expect(erro).toHaveBeenCalled();
        expect(component['candidaturasLista']).toEqual(PAGINA.items);
    });
});
