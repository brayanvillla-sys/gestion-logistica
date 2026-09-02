import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private auth = inject(Auth);
  private router = inject(Router);

  email = '';
  password = '';
  error = signal('');
  cargando = signal(false);

  ingresar() {
    this.error.set('');
    if (!this.email || !this.password) {
      this.error.set('Ingresa tu correo y contraseña');
      return;
    }
    this.cargando.set(true);
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.cargando.set(false);
        this.router.navigate(['/panel']);
      },
      error: (e) => {
        this.cargando.set(false);
        this.error.set(e.error?.mensaje ?? 'No se pudo iniciar sesión');
      },
    });
  }
}