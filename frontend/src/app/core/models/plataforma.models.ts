export interface Plataforma {
    id: number;
    nome: string;
    ativo: boolean;
    site_url: string;
}

export interface PlataformaCreate {
    nome: string;
    site_url: string;
}

export interface PlataformaUpdate {
    nome: string;
    site_url: string;
    ativo: boolean;
}

/** Envelope da paginação do django-ninja (`PageNumberPagination`). */
export interface Pagina<T> {
    items: T[];
    count: number;
}

export interface PlataformaFiltro {
    busca?: string;
    page?: number;
    page_size?: number;
}
