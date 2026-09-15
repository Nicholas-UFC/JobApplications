import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
    Candidatura,
    CandidaturaCreate,
    CandidaturaFiltro,
    CandidaturaUpdate,
} from '../models/candidatura.models';
import { Pagina } from '../models/plataforma.models';

@Injectable({ providedIn: 'root' })
export class CandidaturaService {
    private readonly http = inject(HttpClient);

    /** GET /api/candidatura/ — lista paginada com filtros opcionais. */
    listar(filtro: CandidaturaFiltro = {}): Observable<Pagina<Candidatura>> {
        let params = new HttpParams();
        if (filtro.busca) {
            params = params.set('busca', filtro.busca);
        }
        if (filtro.status) {
            params = params.set('status', filtro.status);
        }
        if (filtro.plataforma_id != null) {
            params = params.set('plataforma_id', filtro.plataforma_id);
        }
        if (filtro.page) {
            params = params.set('page', filtro.page);
        }
        if (filtro.page_size) {
            params = params.set('page_size', filtro.page_size);
        }
        return this.http.get<Pagina<Candidatura>>('/api/candidatura/', { params });
    }

    /** POST /api/candidatura/ — registra uma Candidatura. */
    criar(payload: CandidaturaCreate): Observable<Candidatura> {
        return this.http.post<Candidatura>('/api/candidatura/', payload);
    }

    /** PUT /api/candidatura/{id} — atualiza uma Candidatura. */
    atualizar(id: number, payload: CandidaturaUpdate): Observable<Candidatura> {
        return this.http.put<Candidatura>(`/api/candidatura/${id}`, payload);
    }

    /** DELETE /api/candidatura/{id} — exclui uma Candidatura (204). */
    excluir(id: number): Observable<void> {
        return this.http.delete<void>(`/api/candidatura/${id}`);
    }
}
