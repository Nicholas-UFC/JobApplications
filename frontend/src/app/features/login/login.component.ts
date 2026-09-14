import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { NotificacaoService } from '../../shared/services/notificacao.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        ReactiveFormsModule,
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
})
export class LoginComponent {
    private readonly auth = inject(AuthService);
    private readonly notificacao = inject(NotificacaoService); 
    private readonly router = inject(Router);

    protected readonly formulario = new FormGroup({
        usuario: new FormControl("", [Validators.required]),
        senha: new FormControl("", [Validators.required]),
    })

    protected carregamento = false;

    entrar(): void {
        if (this.formulario.invalid || this.carregamento) {
        return;
        }
        const { usuario, senha } = this.formulario.value;
        this.carregamento = true;
        this.auth
        .login({ username: usuario ?? "", password: senha ?? "" })
        .pipe(finalize(() => (this.carregamento = false)))
        .subscribe({
            next: () => this.router.navigate(["/"]),
            error: (erro) => this.notificacao.erro(erro),
        });
    }
}
