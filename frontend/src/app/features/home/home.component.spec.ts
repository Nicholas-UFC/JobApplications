import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { CandidaturaService } from '../../core/services/candidatura.service';
import { EmpresaMonitoradaService } from '../../core/services/empresa-monitorada.service';
import { Home } from './home.component';

const PAGINA_VAZIA = { items: [], count: 0 };

describe('Home', () => {
    let component: Home;
    let fixture: ComponentFixture<Home>;
    let service: CandidaturaService;
    let empresas: EmpresaMonitoradaService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [Home],
            providers: [provideHttpClient(), provideRouter([])],
        }).compileComponents();

        fixture = TestBed.createComponent(Home);
        component = fixture.componentInstance;
        service = TestBed.inject(CandidaturaService);
        empresas = TestBed.inject(EmpresaMonitoradaService);
        vi.spyOn(service, 'listar').mockReturnValue(of(PAGINA_VAZIA));
        vi.spyOn(empresas, 'listar').mockReturnValue(of(PAGINA_VAZIA));
        fixture.detectChanges();
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('deve somar totais por status e carregar recentes', () => {
        const listar = vi.spyOn(service, 'listar').mockReturnValue(of({ items: [], count: 3 }));
        component['ngOnInit']();
        expect(listar).toHaveBeenCalledWith({ status: 'ENVIADO', page: 1, page_size: 1 });
        expect(listar).toHaveBeenCalledWith({ page: 1, page_size: 5 });
    });

    it('deve carregar todas as empresas monitoradas em ordem de consulta', () => {
        const listar = vi.spyOn(empresas, 'listar').mockReturnValue(
            of({
                items: [
                    {
                        id: 1,
                        nome: 'Acme',
                        ativo: true,
                        url_vagas: 'https://acme.example/vagas',
                        ultima_consulta: '0001-01-01T00:00:00Z',
                    },
                ],
                count: 1,
            }),
        );

        component['ngOnInit']();

        expect(listar).toHaveBeenCalledWith({
            page: 1,
            page_size: 100,
            ordenacao: 'ultima_consulta',
        });
        expect(component['empresas']().length).toBe(1);
        expect(component['carregamentoEmpresas']()).toBe(false);
    });

    it('deve calcular largura proporcional ao total', () => {
        component['totais'].set({
            ENVIADO: 2,
            REJEITADO: 0,
            ENTREVISTA: 1,
            PROPOSTA: 1,
            APROVADA: 0,
        });
        component['total'].set(4);
        expect(component['largura']('ENVIADO')).toBe('50%');
        expect(component['largura']('REJEITADO')).toBe('0%');
    });

    it('deve zerar largura sem candidaturas', () => {
        component['total'].set(0);
        expect(component['largura']('ENVIADO')).toBe('0%');
    });
});
