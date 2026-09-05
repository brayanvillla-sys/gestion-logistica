import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { SolicitudService } from '../../services/solicitud';
import { Auth } from '../../services/auth';
import { Solicitud, Item } from '../../models/solicitud.model';
import { BuscadorServicio } from '../../components/buscador-servicio/buscador-servicio';

@Component({
  selector: 'app-panel',
  imports: [FormsModule, DatePipe, BuscadorServicio],
  templateUrl: './panel.html',
  styleUrl: './panel.css',
})
export class Panel implements OnInit {
  private servicio = inject(SolicitudService);
  auth = inject(Auth);

  categorias = [
    'Refrigerios',
    'Almuerzos',
    'Estación de café',
    'Sillas',
    'Mesas',
    'Sonido',
    'Carpas / toldos',
    'Tarima',
    'Video beam / pantalla',
    'Decoración',
    'Circuito cerrado de TV',
    'Transmisión en vivo',
  ];

  plantillas: { nombre: string; items: Item[] }[] = [
    {
      nombre: 'Jornada de salud',
      items: [
        { categoria: 'Refrigerios', cantidad: 120, descripcion: 'Sándwich y jugo' },
        { categoria: 'Sillas', cantidad: 150, descripcion: 'Plásticas apilables' },
        { categoria: 'Mesas', cantidad: 10, descripcion: 'Para atención' },
        { categoria: 'Carpas / toldos', cantidad: 4, descripcion: 'Puntos de atención' },
        { categoria: 'Sonido', cantidad: 1, descripcion: 'Equipo con 2 micrófonos' },
      ],
    },
    {
      nombre: 'Capacitación',
      items: [
        { categoria: 'Sillas', cantidad: 40, descripcion: 'Auditorio' },
        { categoria: 'Mesas', cantidad: 5, descripcion: 'Mesa principal' },
        { categoria: 'Video beam / pantalla', cantidad: 1, descripcion: 'Proyección' },
        { categoria: 'Sonido', cantidad: 1, descripcion: 'Micrófono inalámbrico' },
        { categoria: 'Estación de café', cantidad: 1, descripcion: 'Café permanente' },
      ],
    },
    {
      nombre: 'Evento masivo',
      items: [
        { categoria: 'Sillas', cantidad: 300, descripcion: 'Público' },
        { categoria: 'Tarima', cantidad: 1, descripcion: 'Escenario principal' },
        { categoria: 'Sonido', cantidad: 1, descripcion: 'Line array + consola' },
        { categoria: 'Carpas / toldos', cantidad: 6, descripcion: 'Logística y stands' },
        { categoria: 'Refrigerios', cantidad: 300, descripcion: 'Hidratación' },
        { categoria: 'Decoración', cantidad: 1, descripcion: 'Pendones y ambientación' },
      ],
    },
    {
      nombre: 'Reunión / rueda de prensa',
      items: [
        { categoria: 'Sillas', cantidad: 30, descripcion: 'Asistentes' },
        { categoria: 'Mesas', cantidad: 2, descripcion: 'Mesa directiva' },
        { categoria: 'Sonido', cantidad: 1, descripcion: 'Micrófonos de mesa' },
        { categoria: 'Estación de café', cantidad: 1, descripcion: 'Café y agua' },
        { categoria: 'Decoración', cantidad: 1, descripcion: 'Backing institucional' },
      ],
    },
  ];

  solicitudes = signal<Solicitud[]>([]);
  cargando = signal(false);
  error = signal('');
  filtro = signal('');

  mostrarFormulario = signal(false);
  editandoId = signal<string | null>(null);

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
    const enUnaSemana = new Date();
    enUnaSemana.setDate(enUnaSemana.getDate() + 7);
    this.fechaEvento = enUnaSemana.toISOString().substring(0, 10);
    this.mostrarFormulario.set(true);
  }

  aplicarPlantilla(indice: number) {
    const plantilla = this.plantillas[indice];
    this.items = plantilla.items.map((i) => ({ ...i }));
    if (!this.nombreEvento) {
      this.nombreEvento = plantilla.nombre;
    }
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

  actualizarCategoria(indice: number, valor: string) {
    this.items[indice].categoria = valor;
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
    const peticion = id ? this.servicio.actualizar(id, datos) : this.servicio.crear(datos);
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