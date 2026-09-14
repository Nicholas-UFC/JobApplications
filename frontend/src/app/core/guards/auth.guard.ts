import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";

import { AuthService } from "../services/auth.service";

/** Bloqueia rotas protegidas; sem token, redireciona para o login. */
export const authGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (auth.isAutenticado()) {
        return true;
    }
    return router.createUrlTree(["/login"]);
}
