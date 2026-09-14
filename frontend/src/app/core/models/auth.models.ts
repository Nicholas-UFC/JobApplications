export interface UsuarioMe {
    username: string;
    is_staff: boolean;
    is_superuser: boolean;
}

export interface LoginPayload {
    username: string;
    password: string;
}

export interface Tokens {
    access: string;
    refresh: string;
}
