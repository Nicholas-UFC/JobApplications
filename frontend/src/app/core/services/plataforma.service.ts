import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
    Pagina,
    Plataforma,
    PlataformaCreate,
    PlataformaFiltro,
    PlataformaUpdate,
} from '../models/plataforma.models';

@Injectable({ providedIn: 'root' })
export class PlataformaService {
    private readonly http = inject(HttpClient);

    /** GET /api/plataforma/ — lista paginada com busca opcional. */
    listar(filtro: PlataformaFiltro = {}): Observable<Pagina<Plataforma>> {
        let params = new HttpParams();
        if (filtro.busca) {
            params = params.set('busca', filtro.busca);
        }
        if (filtro.page) {
            params = params.set('page', filtro.page);
        }
        if (filtro.page_size) {
            params = params.set('page_size', filtro.page_size);
        }
        return this.http.get<Pagina<Plataforma>>('/api/plataforma/', { params });
    }

    /** POST /api/plataforma/ — registra uma Plataforma. */
    criar(payload: PlataformaCreate): Observable<Plataforma> {
        return this.http.post<Plataforma>('/api/plataforma/', payload);
    }

    /** PUT /api/plataforma/{id} — atualiza uma Plataforma. */
    atualizar(id: number, payload: PlataformaUpdate): Observable<Plataforma> {
        return this.http.put<Plataforma>(`/api/plataforma/${id}`, payload);
    }

    /** DELETE /api/plataforma/{id} — exclui uma Plataforma (204). */
    excluir(id: number): Observable<void> {
        return this.http.delete<void>(`/api/plataforma/${id}`);
    }
}
