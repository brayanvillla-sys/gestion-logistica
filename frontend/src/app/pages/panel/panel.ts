import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { SolicitudService } from '../../services/solicitud';
import { Auth } from '../../services/auth';
import { Solicitud, Item } from '../../models/solicitud.model';

@Component({
  selector: 'app-panel',
  imports: [FormsModule, DatePipe],
  templateUrl: './panel.html',
  styleUrl: './panel.css',
})
export class Panel implements OnInit {
  private servicio = inject(SolicitudService);
  auth = inject(Auth);

  solicitudes = signal<Solicitud[]>([]);
  cargando = signal(false);
  error = signal('');
  filtro = signal('');

  mostrarFormulario = signal(false);
  editandoId = signal<string | null>(null);

  // Campos del formulario
  nombreEvento = '';
  fechaEvento = '';
  lugar = '';
  dependencia = '';
  contactoNombre = '';
  contactoTelefono = '';
  items: Item[] = [{ categoria: '', cantidad: 1, descripcion: '' }];

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

  abrirNueva() {
    this.limpiarFormulario();
    this.editandoId.set(null);
    this.dependencia = this.auth.usuario()?.dependencia ?? '';
    this.contactoNombre = this.auth.usuario()?.nombre ?? '';
    this.mostrarFormulario.set(true);
  }

  editar(s: Solicitud) {
    this.editandoId.set(s._id ?? null);
    this.nombreEvento = s.nombreEvento;
    this.fechaEvento = s.fechaEvento?.substring(0, 10) ?? '';
    this.lugar = s.lugar;
    this.dependencia = s.dependencia;
    this.contactoNombre = s.contactoNombre ?? '';
    this.contactoTelefono = s.contactoTelefono ?? '';
    this.items = s.items.map((i) => ({ ...i }));
    this.mostrarFormulario.set(true);
  }

  agregarItem() {
    this.items = [...this.items, { categoria: '', cantidad: 1, descripcion: '' }];
  }

  quitarItem(indice: number) {
    if (this.items.length === 1) return;
    this.items = this.items.filter((_, i) => i !== indice);
  }

  guardar() {
    this.error.set('');

    if (!this.nombreEvento || !this.fechaEvento || !this.lugar || !this.dependencia) {
      this.error.set('Completa los datos del evento');
      return;
    }

    const itemsValidos = this.items.filter((i) => i.categoria.trim() && i.cantidad > 0);
    if (itemsValidos.length === 0) {
      this.error.set('Agrega al menos un item con categoria y cantidad');
      return;
    }

    const datos: Solicitud = {
      nombreEvento: this.nombreEvento,
      fechaEvento: this.fechaEvento,
      lugar: this.lugar,
      dependencia: this.dependencia,
      items: itemsValidos,
      contactoNombre: this.contactoNombre,
      contactoTelefono: this.contactoTelefono,
      solicitante: this.auth.usuario()?.id ?? this.auth.usuario()?._id,
    };

    const id = this.editandoId();
    const peticion = id
      ? this.servicio.actualizar(id, datos)
      : this.servicio.crear(datos);

    peticion.subscribe({
      next: () => {
        this.mostrarFormulario.set(false);
        this.limpiarFormulario();
        this.cargar();
      },
      error: (e) => this.error.set(e.error?.mensaje ?? 'No se pudo guardar'),
    });
  }

  cambiarEstado(s: Solicitud, estado: 'aprobada' | 'rechazada') {
    if (!s._id) return;
    this.servicio.actualizar(s._id, { estado }).subscribe({
      next: () => this.cargar(),
      error: (e) => this.error.set(e.error?.mensaje ?? 'No se pudo actualizar el estado'),
    });
  }

  eliminar(s: Solicitud) {
    if (!s._id) return;
    if (!confirm(`¿Eliminar la solicitud "${s.nombreEvento}"?`)) return;

    this.servicio.eliminar(s._id).subscribe({
      next: () => this.cargar(),
      error: (e) => this.error.set(e.error?.mensaje ?? 'No se pudo eliminar'),
    });
  }

  cancelar() {
    this.mostrarFormulario.set(false);
    this.limpiarFormulario();
    this.error.set('');
  }

  totalItems(s: Solicitud): number {
    return s.items.reduce((suma, i) => suma + i.cantidad, 0);
  }

  private limpiarFormulario() {
    this.nombreEvento = '';
    this.fechaEvento = '';
    this.lugar = '';
    this.dependencia = '';
    this.contactoNombre = '';
    this.contactoTelefono = '';
    this.items = [{ categoria: '', cantidad: 1, descripcion: '' }];
  }
}