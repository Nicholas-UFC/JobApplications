export interface EmpresaMonitorada {
    id: number;
    nome: string;
    ativo: boolean;
    url_vagas: string;
    ultima_consulta: string;
}

export interface EmpresaMonitoradaCreate {
    nome: string;
    url_vagas: string;
}

export interface EmpresaMonitoradaUpdate {
    nome: string;
    url_vagas: string;
    ativo: boolean;
}

export interface EmpresaMonitoradaFiltro {
    busca?: string;
    ordenacao?: string;
    page?: number;
    page_size?: number;
}
