import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../config';
import { Evento } from '../models/solicitud.model';

@Injectable({ providedIn: 'root' })
export class EventoService {
  private http = inject(HttpClient);

  crearDesdeSolicitud(solicitudId: string, responsableId?: string) {
    return this.http.post<Evento>(`${API_URL}/eventos`, {
      solicitud: solicitudId,
      responsable: responsableId,
    });
  }

  obtenerPorSolicitud(solicitudId: string) {
    return this.http.get<Evento>(`${API_URL}/eventos/por-solicitud/${solicitudId}`);
  }

  obtener(id: string) {
    return this.http.get<Evento>(`${API_URL}/eventos/${id}`);
  }

  actualizar(id: string, cambios: Partial<Evento>) {
    return this.http.put<Evento>(`${API_URL}/eventos/${id}`, cambios);
  }

  subirFotos(id: string, archivos: File[]) {
    const formData = new FormData();
    archivos.forEach((f) => formData.append('fotos', f));
    return this.http.post<Evento>(`${API_URL}/eventos/${id}/fotos`, formData);
  }

  eliminarFoto(id: string, fotoId: string) {
    return this.http.delete<{ mensaje: string; evento: Evento }>(
      `${API_URL}/eventos/${id}/fotos/${fotoId}`
    );
  }
}