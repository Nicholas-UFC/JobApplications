import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ConfirmacaoExclusaoDialogComponent } from '../../shared/components/confirmacao-exclusao-dialog/confirmacao-exclusao-dialog.component';
import { EmpresaMonitoradaService } from '../../core/services/empresa-monitorada.service';
import { NotificacaoService } from '../../shared/services/notificacao.service';
import { EmpresaMonitoradaDialogComponent } from './empresa-monitorada-dialog.component';
import { EmpresaMonitoradaComponent } from './empresa-monitorada.component';

const EMPRESA = {
    id: 1,
    nome: 'Acme',
    ativo: true,
    url_vagas: 'https://acme.example/vagas',
    ultima_consulta: '0001-01-01T00:00:00Z',
};

const PAGINA = { items: [EMPRESA], count: 1 };

function simularDialog(valor: boolean): void {
    vi.spyOn(MatDialog.prototype, 'open').mockReturnValue({
        afterClosed: () => of(valor),
    } as never);
}

describe('EmpresaMonitoradaComponent', () => {
    let component: EmpresaMonitoradaComponent;
    let fixture: ComponentFixture<EmpresaMonitoradaComponent>;
    let service: EmpresaMonitoradaService;
    let notificacao: NotificacaoService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [EmpresaMonitoradaComponent],
            providers: [provideHttpClient(), provideRouter([])],
        }).compileComponents();

        fixture = TestBed.createComponent(EmpresaMonitoradaComponent);
        component = fixture.componentInstance;
        service = TestBed.inject(EmpresaMonitoradaService);
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
        expect(component['empresasLista']).toEqual(PAGINA.items);
        expect(component['total']).toBe(1);
    });

    it('deve buscar no servidor com debounce', () => {
        vi.useFakeTimers();
        try {
            vi.clearAllMocks();
            component['busca'].setValue('acme');
            vi.advanceTimersByTime(300);
            expect(service.listar).toHaveBeenCalledWith({
                busca: 'acme',
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

    it('deve registrar consulta e recarregar a lista', () => {
        const consultar = vi.spyOn(service, 'consultar').mockReturnValue(of(EMPRESA));
        const sucesso = vi.spyOn(notificacao, 'sucesso');
        vi.clearAllMocks();

        component['consultar'](EMPRESA);

        expect(consultar).toHaveBeenCalledWith(1);
        expect(sucesso).toHaveBeenCalledWith('Consulta registrada.');
        expect(service.listar).toHaveBeenCalled();
        expect(component['consultandoId']()).toBeNull();
    });

    it('deve manter a lista e exibir erro quando a consulta falha', () => {
        vi.spyOn(service, 'consultar').mockReturnValue(throwError(() => new Error('falhou')));
        const erro = vi.spyOn(notificacao, 'erro');
        vi.clearAllMocks();

        component['consultar'](EMPRESA);

        expect(erro).toHaveBeenCalled();
        expect(component['empresasLista']).toEqual(PAGINA.items);
        expect(component['consultandoId']()).toBeNull();
    });

    it('deve abrir confirmação com o nome ao excluir', () => {
        simularDialog(false);
        component['confirmarExclusao'](EMPRESA);
        expect(MatDialog.prototype.open).toHaveBeenCalledWith(ConfirmacaoExclusaoDialogComponent, {
            width: '400px',
            data: { nome: 'Acme', titulo: 'Excluir Empresa monitorada' },
        });
    });

    it('deve excluir e recarregar ao confirmar', () => {
        simularDialog(true);
        const excluir = vi.spyOn(service, 'excluir').mockReturnValue(of(void 0));
        const sucesso = vi.spyOn(notificacao, 'sucesso');
        vi.clearAllMocks();
        component['confirmarExclusao'](EMPRESA);
        expect(excluir).toHaveBeenCalledWith(1);
        expect(sucesso).toHaveBeenCalledWith('Empresa monitorada excluída.');
        expect(service.listar).toHaveBeenCalled();
    });

    it('não deve excluir ao cancelar a confirmação', () => {
        simularDialog(false);
        const excluir = vi.spyOn(service, 'excluir');
        component['confirmarExclusao'](EMPRESA);
        expect(excluir).not.toHaveBeenCalled();
    });

    it('deve abrir edição com os dados salvos e recarregar ao salvar', () => {
        simularDialog(true);
        component['abrirEdicao'](EMPRESA);
        expect(MatDialog.prototype.open).toHaveBeenCalledWith(EmpresaMonitoradaDialogComponent, {
            width: '480px',
            data: { empresa: EMPRESA },
        });
        expect(service.listar).toHaveBeenCalled();
    });

    it('não deve recarregar ao cancelar a edição', () => {
        simularDialog(false);
        vi.clearAllMocks();
        component['abrirEdicao'](EMPRESA);
        expect(service.listar).not.toHaveBeenCalled();
    });
});
