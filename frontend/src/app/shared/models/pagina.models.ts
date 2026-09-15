/** Envelope da paginação do django-ninja (`PageNumberPagination`). */
export interface Pagina<T> {
    items: T[];
    count: number;
}
