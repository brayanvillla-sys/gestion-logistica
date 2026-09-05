import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { SolicitudService } from '../../services/solicitud';
import { EventoService } from '../../services/evento';
import { Auth } from '../../services/auth';
import { Solicitud } from '../../models/solicitud.model';

@Component({
  selector: 'app-operacion',
  imports: [DatePipe],
  templateUrl: './operacion.html',
  styleUrl: './operacion.css',
})
export class Operacion implements OnInit {
  private servicio = inject(SolicitudService);
  private eventoServicio = inject(EventoService);
  private router = inject(Router);
  auth = inject(Auth);

  solicitudes = signal<Solicitud[]>([]);
  cargando = signal(false);
  error = signal('');
  filtro = signal('');

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.error.set('');
    this.servicio.listar(this.filtro() || undefined).subscribe({
      next: (datos) => {
        this.solicitudes.set(datos);
        this.cargando.set(false);
      },
      error: (e) => {
        this.error.set(e.error?.mensaje ?? 'No se pudieron cargar las solicitudes');
        this.cargando.set(false);
      },
    });
  }

  cambiarFiltro(valor: string) {
    this.filtro.set(valor);
    this.cargar();
  }

  aprobar(s: Solicitud) {
    if (!s._id) return;
    const respId = this.auth.usuario()?.id ?? this.auth.usuario()?._id;
    this.eventoServicio.crearDesdeSolicitud(s._id, respId).subscribe({
      next: () => this.cargar(),
      error: (e) => this.error.set(e.error?.mensaje ?? 'No se pudo aprobar'),
    });
  }

  rechazar(s: Solicitud) {
    if (!s._id) return;
    this.servicio.actualizar(s._id, { estado: 'rechazada' }).subscribe({
      next: () => this.cargar(),
      error: (e) => this.error.set(e.error?.mensaje ?? 'No se pudo rechazar'),
    });
  }

  irATrabajar(s: Solicitud) {
    if (!s._id) return;
    this.eventoServicio.obtenerPorSolicitud(s._id).subscribe({
      next: (ev) => {
        if (ev._id) this.router.navigate(['/operacion/evento', ev._id]);
      },
      error: () => this.error.set('No se encontró el evento de esta solicitud'),
    });
  }

  totalItems(s: Solicitud): number {
    return s.items.reduce((suma, i) => suma + i.cantidad, 0);
  }
}