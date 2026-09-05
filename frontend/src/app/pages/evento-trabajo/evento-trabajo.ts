import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EventoService } from '../../services/evento';
import { Auth } from '../../services/auth';
import { Evento, ItemEvento } from '../../models/solicitud.model';
import { SERVER_URL } from '../../config';
import { CATALOGO, ServicioCatalogo } from '../../data/catalogo';
import { ESCUDO_RISARALDA } from '../../data/escudo';
import html2pdf from 'html2pdf.js';

@Component({
  selector: 'app-evento-trabajo',
  imports: [FormsModule, DatePipe, CurrencyPipe, RouterLink],
  templateUrl: './evento-trabajo.html',
  styleUrl: './evento-trabajo.css',
})
export class EventoTrabajo implements OnInit {
  private ruta = inject(ActivatedRoute);
  private eventoServicio = inject(EventoService);
  auth = inject(Auth);

  servidor = SERVER_URL;
  catalogo = CATALOGO;
  escudo = ESCUDO_RISARALDA;

  evento = signal<Evento | null>(null);
  cargando = signal(true);
  error = signal('');
  guardando = signal(false);
  mensaje = signal('');
  subiendoFotos = signal(false);

  busqueda: { [i: number]: string } = {};
  abierto = signal<number | null>(null);

  ngOnInit() {
    const id = this.ruta.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Evento no válido');
      this.cargando.set(false);
      return;
    }
    this.eventoServicio.obtener(id).subscribe({
      next: (ev) => {
        this.evento.set(ev);
        this.cargando.set(false);
      },
      error: (e) => {
        this.error.set(e.error?.mensaje ?? 'No se pudo cargar el evento');
        this.cargando.set(false);
      },
    });
  }

  opcionesFiltradas(i: number): ServicioCatalogo[] {
    const t = (this.busqueda[i] || '').toLowerCase().trim();
    if (!t) return this.catalogo.slice(0, 30);
    return this.catalogo
      .filter((s) => s.descripcion.toLowerCase().includes(t) || String(s.codigo) === t)
      .slice(0, 30);
  }

  abrirBuscador(i: number) {
    this.abierto.set(i);
  }

  elegirServicio(i: number, serv: ServicioCatalogo) {
    const ev = this.evento();
    if (!ev?.items) return;
    const items = [...ev.items];
    items[i] = {
      ...items[i],
      descripcion: serv.descripcion,
      valorUnidad: serv.valorUnidad,
    };
    this.evento.set({ ...ev, items });
    this.busqueda[i] = '';
    this.abierto.set(null);
  }

  totalItem(item: ItemEvento): number {
    return (item.cantidad || 0) * (item.valorUnidad || 0);
  }

  totalGeneral(): number {
    const ev = this.evento();
    if (!ev?.items) return 0;
    return ev.items.reduce((s, i) => s + this.totalItem(i), 0);
  }

  subir(i: number) {
    const ev = this.evento();
    if (!ev?.items || i === 0) return;
    const items = [...ev.items];
    [items[i - 1], items[i]] = [items[i], items[i - 1]];
    items.forEach((it, idx) => (it.numero = idx + 1));
    this.evento.set({ ...ev, items });
  }

  bajar(i: number) {
    const ev = this.evento();
    if (!ev?.items || i === ev.items.length - 1) return;
    const items = [...ev.items];
    [items[i + 1], items[i]] = [items[i], items[i + 1]];
    items.forEach((it, idx) => (it.numero = idx + 1));
    this.evento.set({ ...ev, items });
  }

  agregarItem() {
    const ev = this.evento();
    if (!ev) return;
    const items = [...(ev.items || [])];
    items.push({
      numero: items.length + 1,
      categoria: 'Nuevo ítem',
      descripcion: '',
      cantidad: 1,
      valorUnidad: 0,
    });
    this.evento.set({ ...ev, items });
  }

  quitarItem(i: number) {
    const ev = this.evento();
    if (!ev?.items) return;
    if (!confirm('¿Quitar este ítem?')) return;
    const items = ev.items.filter((_, idx) => idx !== i);
    items.forEach((it, idx) => (it.numero = idx + 1));
    this.evento.set({ ...ev, items });
  }

  guardar() {
    const ev = this.evento();
    if (!ev?._id) return;
    this.guardando.set(true);
    this.mensaje.set('');
    this.eventoServicio.actualizar(ev._id, {
      proyecto: ev.proyecto,
      rubro: ev.rubro,
      codigoAlojamiento: ev.codigoAlojamiento,
      items: ev.items,
      valorTotal: this.totalGeneral(),
    }).subscribe({
      next: (act) => {
        this.evento.set(act);
        this.guardando.set(false);
        this.mensaje.set('Guardado correctamente');
      },
      error: (e) => {
        this.guardando.set(false);
        this.mensaje.set(e.error?.mensaje ?? 'No se pudo guardar');
      },
    });
  }

  alSeleccionarFotos(evt: Event) {
    const input = evt.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const ev = this.evento();
    if (!ev?._id) return;
    const archivos = Array.from(input.files);
    this.subiendoFotos.set(true);
    this.eventoServicio.subirFotos(ev._id, archivos).subscribe({
      next: (act) => {
        this.evento.set(act);
        this.subiendoFotos.set(false);
        input.value = '';
      },
      error: (e) => {
        this.subiendoFotos.set(false);
        this.mensaje.set(e.error?.mensaje ?? 'No se pudieron subir las fotos');
      },
    });
  }

  eliminarFoto(fotoId?: string) {
    const ev = this.evento();
    if (!ev?._id || !fotoId) return;
    if (!confirm('¿Eliminar esta foto?')) return;
    this.eventoServicio.eliminarFoto(ev._id, fotoId).subscribe({
      next: (r) => this.evento.set(r.evento),
      error: (e) => this.mensaje.set(e.error?.mensaje ?? 'No se pudo eliminar'),
    });
  }

  descargarPdf(idHoja: string, nombre: string) {
    const elemento = document.getElementById(idHoja);
    if (!elemento) return;
    const opciones: any = {
      margin: 8,
      filename: `${nombre}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };
    html2pdf().set(opciones).from(elemento).save();
  }

  descargarPaquete() {
    const cert = document.getElementById('hoja-certificacion');
    const fotos = document.getElementById('hoja-fotos');
    const soli = document.getElementById('hoja-solicitud');
    if (!cert || !soli) return;

    const ev = this.evento();
    const nombre = ev?.nombre || 'evento';

    const cont = document.createElement('div');
    const clonCert = cert.cloneNode(true) as HTMLElement;
    const clonSoli = soli.cloneNode(true) as HTMLElement;
    clonCert.style.pageBreakAfter = 'always';
    cont.appendChild(clonCert);

    if (fotos) {
      const clonFotos = fotos.cloneNode(true) as HTMLElement;
      clonFotos.style.pageBreakAfter = 'always';
      cont.appendChild(clonFotos);
    }
    cont.appendChild(clonSoli);

    const opciones: any = {
      margin: 8,
      filename: `Paquete-${nombre}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] },
    };
    html2pdf().set(opciones).from(cont).save();
  }
}