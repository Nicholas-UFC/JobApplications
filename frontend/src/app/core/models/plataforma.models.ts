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

export interface PlataformaFiltro {
    busca?: string;
    page?: number;
    page_size?: number;
}
