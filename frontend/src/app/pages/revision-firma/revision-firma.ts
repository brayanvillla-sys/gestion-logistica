import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { EventoService } from '../../services/evento';
import { Auth } from '../../services/auth';
import { Evento, ItemEvento } from '../../models/solicitud.model';
import { SERVER_URL } from '../../config';
import { ESCUDO_RISARALDA } from '../../data/escudo';

@Component({
  selector: 'app-revision-firma',
  imports: [DatePipe, CurrencyPipe],
  templateUrl: './revision-firma.html',
  styleUrl: './revision-firma.css',
})
export class RevisionFirma implements OnInit {
  private eventoServicio = inject(EventoService);
  auth = inject(Auth);

  servidor = SERVER_URL;
  escudo = ESCUDO_RISARALDA;

  eventos = signal<Evento[]>([]);
  indice = signal(0);
  cargando = signal(true);
  error = signal('');
  procesando = signal(false);

  actual = computed(() => this.eventos()[this.indice()] ?? null);
  hayFirma = computed(() => !!this.auth.usuario()?.firma);

  yaFirme = computed(() => {
    const ev = this.actual();
    const miId = this.auth.usuario()?.id ?? this.auth.usuario()?._id;
    if (!ev?.firmas) return false;
    return ev.firmas.some((f) => String(f.firmanteId) === String(miId));
  });

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.eventoServicio.listarParaFirma().subscribe({
      next: (evs) => {
        this.eventos.set(evs);
        this.indice.set(0);
        this.cargando.set(false);
      },
      error: (e) => {
        this.error.set(e.error?.mensaje ?? 'No se pudieron cargar los eventos');
        this.cargando.set(false);
      },
    });
  }

  totalItem(item: ItemEvento): number {
    return (item.cantidad || 0) * (item.valorUnidad || 0);
  }

  totalEvento(ev: Evento): number {
    if (!ev.items) return 0;
    return ev.items.reduce((s, i) => s + this.totalItem(i), 0);
  }

  // Espacios de firma según requeridas
  espaciosFirma(ev: Evento): { firma: string; nombre: string }[] {
    const total = ev.firmasRequeridas || 1;
    const firmas = ev.firmas || [];
    const espacios: { firma: string; nombre: string }[] = [];
    for (let i = 0; i < total; i++) {
      if (firmas[i]) {
        espacios.push({ firma: firmas[i].firma, nombre: firmas[i].firmanteNombre || '' });
      } else {
        espacios.push({ firma: '', nombre: '' });
      }
    }
    return espacios;
  }

  anterior() {
    if (this.indice() > 0) this.indice.set(this.indice() - 1);
  }

  siguiente() {
    if (this.indice() < this.eventos().length - 1) this.indice.set(this.indice() + 1);
  }

  firmar() {
    const ev = this.actual();
    const firma = this.auth.usuario()?.firma;
    const nombre = this.auth.usuario()?.nombre ?? '';
    if (!ev?._id) return;
    if (!firma) {
      this.error.set('No tienes una firma guardada. Ve a tu Perfil y guárdala primero.');
      return;
    }
    this.procesando.set(true);
    this.error.set('');
    this.eventoServicio.firmar(ev._id, firma, nombre).subscribe({
      next: (act) => {
        this.procesando.set(false);
        if (act.estado === 'certificado') {
          this.quitarActual();
        } else {
          const lista = [...this.eventos()];
          lista[this.indice()] = act;
          this.eventos.set(lista);
          this.siguiente();
        }
      },
      error: (e) => {
        this.procesando.set(false);
        this.error.set(e.error?.mensaje ?? 'No se pudo firmar');
      },
    });
  }

  rechazar() {
    const ev = this.actual();
    if (!ev?._id) return;
    const motivo = prompt('Motivo del rechazo (opcional):') ?? '';
    this.procesando.set(true);
    this.error.set('');
    this.eventoServicio.rechazarFirma(ev._id, motivo).subscribe({
      next: () => {
        this.procesando.set(false);
        this.quitarActual();
      },
      error: (e) => {
        this.procesando.set(false);
        this.error.set(e.error?.mensaje ?? 'No se pudo rechazar');
      },
    });
  }

  private quitarActual() {
    const lista = this.eventos().filter((_, i) => i !== this.indice());
    this.eventos.set(lista);
    if (this.indice() >= lista.length && this.indice() > 0) {
      this.indice.set(lista.length - 1);
    }
  }
}