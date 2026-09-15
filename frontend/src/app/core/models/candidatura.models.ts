export type StatusCandidatura = 'ENVIADO' | 'REJEITADO' | 'ENTREVISTA' | 'PROPOSTA' | 'APROVADA';

export const STATUS_CANDIDATURA: { valor: StatusCandidatura; rotulo: string }[] = [
    { valor: 'ENVIADO', rotulo: 'Enviado' },
    { valor: 'REJEITADO', rotulo: 'Rejeitado' },
    { valor: 'ENTREVISTA', rotulo: 'Entrevista' },
    { valor: 'PROPOSTA', rotulo: 'Proposta Recebida' },
    { valor: 'APROVADA', rotulo: 'Aprovada' },
];

export interface Candidatura {
    id: number;
    nome: string;
    ativo: boolean;
    empresa: string;
    observacoes: string;
    plataforma_id: number;
    status: StatusCandidatura;
}

export interface CandidaturaCreate {
    nome: string;
    empresa: string;
    observacoes: string;
    plataforma_id: number;
    status: StatusCandidatura;
}

export interface CandidaturaUpdate {
    nome: string;
    empresa: string;
    observacoes: string;
    plataforma_id: number;
    status: StatusCandidatura;
    ativo: boolean;
}

export interface CandidaturaFiltro {
    busca?: string;
    status?: StatusCandidatura;
    plataforma_id?: number;
    page?: number;
    page_size?: number;
}
