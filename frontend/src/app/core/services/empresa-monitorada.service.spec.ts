import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { EmpresaMonitoradaService } from './empresa-monitorada.service';

const BASE = '/api/empresa-monitorada/';

const EMPRESA = {
    id: 1,
    nome: 'Acme',
    ativo: true,
    url_vagas: 'https://acme.example/vagas',
    ultima_consulta: '0001-01-01T00:00:00Z',
};

describe('EmpresaMonitoradaService', () => {
    let service: EmpresaMonitoradaService;
    let http: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient(), provideHttpClientTesting()],
        });
        service = TestBed.inject(EmpresaMonitoradaService);
        http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        http.verify();
    });

    it('deve listar com busca, ordenação e paginação', () => {
        service
            .listar({ busca: 'acme', ordenacao: 'ultima_consulta', page: 2, page_size: 5 })
            .subscribe();

        const requisicao = http.expectOne(
            (req) =>
                req.url === BASE &&
                req.params.get('busca') === 'acme' &&
                req.params.get('ordenacao') === 'ultima_consulta' &&
                req.params.get('page') === '2' &&
                req.params.get('page_size') === '5',
        );
        expect(requisicao.request.method).toBe('GET');
        requisicao.flush({ items: [], count: 0 });
    });

    it('deve cadastrar uma empresa', () => {
        service.criar({ nome: 'Acme', url_vagas: EMPRESA.url_vagas }).subscribe();

        const requisicao = http.expectOne(BASE);
        expect(requisicao.request.method).toBe('POST');
        expect(requisicao.request.body).toEqual({
            nome: 'Acme',
            url_vagas: EMPRESA.url_vagas,
        });
        requisicao.flush(EMPRESA);
    });

    it('deve atualizar uma empresa', () => {
        service
            .atualizar(1, {
                nome: 'Acme Renomeada',
                url_vagas: EMPRESA.url_vagas,
                ativo: false,
            })
            .subscribe();

        const requisicao = http.expectOne(`${BASE}1`);
        expect(requisicao.request.method).toBe('PUT');
        expect(requisicao.request.body).toEqual({
            nome: 'Acme Renomeada',
            url_vagas: EMPRESA.url_vagas,
            ativo: false,
        });
        requisicao.flush({ ...EMPRESA, nome: 'Acme Renomeada', ativo: false });
    });

    it('deve registrar consulta', () => {
        service.consultar(1).subscribe();

        const requisicao = http.expectOne(`${BASE}1/consultar`);
        expect(requisicao.request.method).toBe('POST');
        expect(requisicao.request.body).toEqual({});
        requisicao.flush(EMPRESA);
    });

    it('deve excluir uma empresa', () => {
        service.excluir(1).subscribe();

        const requisicao = http.expectOne(`${BASE}1`);
        expect(requisicao.request.method).toBe('DELETE');
        requisicao.flush(null);
    });
});
