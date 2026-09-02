import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Auth } from '../../services/auth';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-perfil',
  imports: [DatePipe],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {
  auth = inject(Auth);

  datos = signal<Usuario | null>(null);
  cargando = signal(true);
  error = signal('');

  ngOnInit() {
    this.auth.perfil().subscribe({
      next: (u) => {
        this.datos.set(u);
        this.cargando.set(false);
      },
      error: (e) => {
        this.error.set(e.error?.mensaje ?? 'No se pudo cargar el perfil');
        this.cargando.set(false);
      },
    });
  }

  etiquetaRol(rol?: string): string {
    const mapa: Record<string, string> = {
      secretaria: 'Secretaría',
      operador: 'Operador logístico',
      admin: 'Administrador',
    };
    return rol ? mapa[rol] ?? rol : '—';
  }

  permisos(rol?: string): string[] {
    if (rol === 'admin') {
      return [
        'Crear, editar y eliminar usuarios',
        'Aprobar y rechazar solicitudes',
        'Eliminar solicitudes y eventos',
        'Acceso completo al sistema',
      ];
    }
    if (rol === 'operador') {
      return [
        'Consultar todas las solicitudes',
        'Aprobar y rechazar solicitudes',
        'Crear y actualizar eventos',
      ];
    }
    return [
      'Crear solicitudes de servicios',
      'Consultar el estado de sus solicitudes',
    ];
  }
}