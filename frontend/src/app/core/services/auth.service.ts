import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, Observable, tap, throwError } from 'rxjs';
import { LoginPayload, Tokens, UsuarioMe } from '../models/auth.models';
import { CHAVE_ACCESS, CHAVE_REFRESH, CHAVE_USUARIO, TokenStore } from './token-store';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly router = inject(Router);
    private readonly tokens = inject(TokenStore);

    private readonly access = signal<string | null>(this.tokens.ler(CHAVE_ACCESS));
    private readonly refresh = signal<string | null>(this.tokens.ler(CHAVE_REFRESH));
    readonly isAutenticado = computed(() => this.access() !== null);

    private readonly usuario = signal<string | null>(this.tokens.ler(CHAVE_USUARIO));

    /** Nome do usuário logado (salvo no login, limpo no logout). */
    readonly nomeUsuario = computed(() => this.usuario() ?? '');

    private refreshEmAndamento: Observable<Tokens> | null = null;

    private readonly staff = signal(false);
    private readonly superuser = signal(false);

    /** Usuário tem acesso ao painel admin do Django. */
    readonly isAdmin = computed(() => this.staff() || this.superuser());

    /** GET /api/auth/me — carrega nome e privilégios do usuário autenticado. */
    obterUsuario() {
        return this.http.get<UsuarioMe>('/api/auth/me').pipe(
            tap((dados) => {
                this.usuario.set(dados.username);
                this.tokens.gravar(CHAVE_USUARIO, dados.username);
                this.staff.set(dados.is_staff);
                this.superuser.set(dados.is_superuser);
            }),
        );
    }

    /** POST /api/auth/login — retorna tokens e já os armazena. */
    login(credentials: LoginPayload) {
        return this.http.post<Tokens>('/api/auth/login', credentials).pipe(
            tap((tokens) => {
                this.armazenar(tokens);
                this.usuario.set(credentials.username);
                this.tokens.gravar(CHAVE_USUARIO, credentials.username);
            }),
        );
    }

    /** POST /api/auth/refresh — renova access e mantém o refresh. */
    renovarToken(): Observable<Tokens> {
        const refresh = this.refresh();

        if (!refresh) {
            return throwError(() => new Error('Sem refresh token'));
        }
        if (!this.refreshEmAndamento) {
            this.refreshEmAndamento = this.http.post<Tokens>('/api/auth/refresh', { refresh }).pipe(
                tap((tokens) => this.armazenar(tokens)),
                finalize(() => (this.refreshEmAndamento = null)),
            );
        }
        return this.refreshEmAndamento;
    }

    armazenar(tokens: Tokens): void {
        this.tokens.gravar(CHAVE_ACCESS, tokens.access);
        this.tokens.gravar(CHAVE_REFRESH, tokens.refresh);
        this.access.set(tokens.access);
        this.refresh.set(tokens.refresh);
    }

    obterAccessToken(): string | null {
        return this.access();
    }

    logout(): void {
        this.tokens.remover(CHAVE_ACCESS);
        this.tokens.remover(CHAVE_REFRESH);
        this.tokens.remover(CHAVE_USUARIO);
        this.access.set(null);
        this.refresh.set(null);
        this.usuario.set(null);
        this.router.navigate(['/login']);
    }
}
