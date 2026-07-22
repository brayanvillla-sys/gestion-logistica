import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { Rol } from '../../models/usuario.model';

@Component({
  selector: 'app-registro',
  imports: [FormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  private auth = inject(Auth);
  private router = inject(Router);

  nombre = '';
  email = '';
  password = '';
  dependencia = '';
  rol: Rol = 'secretaria';

  error = signal('');
  cargando = signal(false);

  crearCuenta() {
    this.error.set('');

    if (!this.nombre || !this.email || !this.password) {
      this.error.set('Completa todos los campos obligatorios');
      return;
    }

    if (this.password.length < 6) {
      this.error.set('La contraseña debe tener mínimo 6 caracteres');
      return;
    }

    this.cargando.set(true);

    this.auth.registro({
      nombre: this.nombre,
      email: this.email,
      password: this.password,
      rol: this.rol,
      dependencia: this.dependencia,
    }).subscribe({
      next: () => {
        this.cargando.set(false);
        this.router.navigate(['/panel']);
      },
      error: (e) => {
        this.cargando.set(false);
        this.error.set(e.error?.mensaje ?? 'No se pudo crear la cuenta');
      },
    });
  }
}