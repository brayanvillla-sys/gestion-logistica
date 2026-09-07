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
  mensajeFirma = signal('');
  guardandoFirma = signal(false);

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
      supervisor: 'Supervisor(a)',
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
        'Aprobar solicitudes y crear eventos',
        'Asignar precios y subir evidencia',
        'Enviar documentos a firma',
      ];
    }
    if (rol === 'supervisor') {
      return [
        'Revisar eventos enviados por el operador',
        'Aprobar y firmar documentos',
        'Rechazar documentos con observaciones',
      ];
    }
    return [
      'Crear solicitudes de servicios',
      'Consultar el estado de sus solicitudes',
    ];
  }

  esSupervisor(): boolean {
    return this.auth.rol() === 'supervisor' || this.auth.rol() === 'admin';
  }

  alSeleccionarFirma(evt: Event) {
    const input = evt.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const archivo = input.files[0];
    this.mensajeFirma.set('');
    this.guardandoFirma.set(true);

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      this.auth.guardarFirma(base64).subscribe({
        next: (u) => {
          this.datos.set(u);
          this.guardandoFirma.set(false);
          this.mensajeFirma.set('Firma guardada correctamente');
          input.value = '';
        },
        error: (e) => {
          this.guardandoFirma.set(false);
          this.mensajeFirma.set(e.error?.mensaje ?? 'No se pudo guardar la firma');
        },
      });
    };
    reader.onerror = () => {
      this.guardandoFirma.set(false);
      this.mensajeFirma.set('No se pudo leer el archivo');
    };
    reader.readAsDataURL(archivo);
  }
}