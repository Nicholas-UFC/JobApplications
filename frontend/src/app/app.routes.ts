import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () =>
            import('./features/login/login.component').then((m) => m.LoginComponent),
    },
    {
        path: '',
        component: ShellComponent,
        canActivate: [authGuard],
        children: [
            {
                path: '',
                loadComponent: () => import('./features/home/home.component').then((m) => m.Home),
            },
            {
                path: 'plataforma',
                loadComponent: () =>
                    import('./features/plataforma/plataforma.component').then(
                        (m) => m.PlataformaComponent,
                    ),
            },
            {
                path: 'candidatura',
                loadComponent: () =>
                    import('./features/candidatura/candidatura.component').then(
                        (m) => m.CandidaturaComponent,
                    ),
            },
        ],
    },
    {
        path: '**',
        redirectTo: '',
    },
];
