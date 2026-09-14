import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
    selector: 'app-shell',
    imports: [
        MatButtonModule,
        MatIconModule,
        MatListModule,
        MatMenuModule,
        MatSidenavModule,
        MatToolbarModule,
        RouterLink,
        RouterOutlet,
        RouterLinkActive,
    ],
    templateUrl: './shell.component.html',
    styleUrl: './shell.component.scss',
})
export class ShellComponent implements OnInit {
    private readonly auth = inject(AuthService);
    protected readonly nomeUsuario = this.auth.nomeUsuario;
    protected readonly isAdmin = this.auth.isAdmin;

    ngOnInit(): void {
        this.auth.obterUsuario().subscribe({ error: () => undefined });
    }

    protected readonly itensMenu = [
        { rota: '/', icone: 'home', rotulo: 'Home' },
        { rota: '/plataforma', icone: 'public', rotulo: 'Plataforma' },
    ];

    sair(): void {
        this.auth.logout();
    }
}
