import { 
    HttpErrorResponse, 
    HttpInterceptorFn 
} from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { catchError, switchMap, throwError } from "rxjs";


/**
 * Injeta `Authorization: Bearer <access>`. Em 401 (token expirado) tenta
 * renovar via `/api/auth/refresh` uma vez e repete a requisição; se falhar,
 * faz logout e redireciona para o login. Endpoints `/auth/` ficam de fora.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const auth = inject(AuthService);

    const token = auth.obterAccessToken();
    const comToken = token
    ? req.clone({ setHeaders: {Authorization: `Bearer ${token}`} })
    : req;

    return next(comToken).pipe(
        // Endpoints públicos: falham sem token e não tentam refresh.
        // /auth/me é autenticado e pode renovar o token em 401.
        catchError((erro: HttpErrorResponse) => {
            const ehPublico = ["/auth/login", "/auth/pair", "/auth/refresh", "/auth/verify"]
                .some((rota) => req.url.includes(rota));
            if (erro.status !== 401 || ehPublico) {
                return throwError(() => erro);
            }
            return auth.renovarToken().pipe(
                switchMap((tokens) => 
                    next(
                        req.clone({
                            setHeaders: { Authorization: `Bearer ${tokens.access}`},
                        }),
                    ),
                ),
                catchError(() => {
                    auth.logout();
                    return throwError(() => erro);
                }),
            );
        }),
    );
};
