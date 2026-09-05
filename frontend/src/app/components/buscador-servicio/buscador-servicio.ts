import { Component, inject, input, output, signal, ElementRef, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-buscador-servicio',
  imports: [FormsModule],
  templateUrl: './buscador-servicio.html',
  styleUrl: './buscador-servicio.css',
})
export class BuscadorServicio {
  private el = inject(ElementRef);

  // La lista de servicios disponibles (viene del panel)
  opciones = input<string[]>([]);
  // El valor actual seleccionado (viene del panel)
  valor = input<string>('');
  // Avisa al panel cuando el usuario elige o escribe algo
  cambio = output<string>();

  texto = signal('');
  abierto = signal(false);

  ngOnInit() {
    this.texto.set(this.valor());
  }

  get filtradas(): string[] {
    const t = this.texto().toLowerCase().trim();
    if (!t) return this.opciones();
    return this.opciones().filter((o) => o.toLowerCase().includes(t));
  }

  // ¿Lo que escribió no coincide exacto con ninguna opción? Ofrecer agregarlo
  get mostrarAgregar(): boolean {
    const t = this.texto().trim();
    if (!t) return false;
    return !this.opciones().some((o) => o.toLowerCase() === t.toLowerCase());
  }

  alEscribir() {
    this.abierto.set(true);
    this.cambio.emit(this.texto());
  }

  seleccionar(opcion: string) {
    this.texto.set(opcion);
    this.cambio.emit(opcion);
    this.abierto.set(false);
  }

  agregarNuevo() {
    const nuevo = this.texto().trim();
    this.cambio.emit(nuevo);
    this.abierto.set(false);
  }

  abrir() {
    this.abierto.set(true);
  }

  // Cierra el desplegable si el usuario hace clic fuera
  @HostListener('document:click', ['$event'])
  clicFuera(evento: Event) {
    if (!this.el.nativeElement.contains(evento.target)) {
      this.abierto.set(false);
    }
  }
}