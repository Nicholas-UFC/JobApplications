import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
    EmpresaMonitorada,
    EmpresaMonitoradaCreate,
    EmpresaMonitoradaFiltro,
    EmpresaMonitoradaUpdate,
} from '../models/empresa-monitorada.models';
import { Pagina } from '../../shared/models/pagina.models';

@Injectable({ providedIn: 'root' })
export class EmpresaMonitoradaService {
    private readonly http = inject(HttpClient);
    private readonly base = '/api/empresa-monitorada/';

    /** GET /api/empresa-monitorada/ — lista paginada com busca e ordenação. */
    listar(filtro: EmpresaMonitoradaFiltro = {}): Observable<Pagina<EmpresaMonitorada>> {
        let params = new HttpParams();
        if (filtro.busca) {
            params = params.set('busca', filtro.busca);
        }
        if (filtro.ordenacao) {
            params = params.set('ordenacao', filtro.ordenacao);
        }
        if (filtro.page) {
            params = params.set('page', filtro.page);
        }
        if (filtro.page_size) {
            params = params.set('page_size', filtro.page_size);
        }
        return this.http.get<Pagina<EmpresaMonitorada>>(this.base, { params });
    }

    /** POST /api/empresa-monitorada/ — cadastra uma Empresa monitorada. */
    criar(payload: EmpresaMonitoradaCreate): Observable<EmpresaMonitorada> {
        return this.http.post<EmpresaMonitorada>(this.base, payload);
    }

    /** PUT /api/empresa-monitorada/{id} — atualiza nome, URL e ativo. */
    atualizar(id: number, payload: EmpresaMonitoradaUpdate): Observable<EmpresaMonitorada> {
        return this.http.put<EmpresaMonitorada>(`${this.base}${id}`, payload);
    }

    /** POST /api/empresa-monitorada/{id}/consultar — registra a consulta agora. */
    consultar(id: number): Observable<EmpresaMonitorada> {
        return this.http.post<EmpresaMonitorada>(`${this.base}${id}/consultar`, {});
    }

    /** DELETE /api/empresa-monitorada/{id} — exclui a empresa (204). */
    excluir(id: number): Observable<void> {
        return this.http.delete<void>(`${this.base}${id}`);
    }
}
