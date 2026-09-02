import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../config';
import { Solicitud } from '../models/solicitud.model';

@Injectable({ providedIn: 'root' })
export class SolicitudService {
  private http = inject(HttpClient);

  listar(estado?: string) {
    const query = estado ? `?estado=${estado}` : '';
    return this.http.get<Solicitud[]>(`${API_URL}/solicitudes${query}`);
  }

  obtener(id: string) {
    return this.http.get<Solicitud>(`${API_URL}/solicitudes/${id}`);
  }

  crear(solicitud: Solicitud) {
    return this.http.post<Solicitud>(`${API_URL}/solicitudes`, solicitud);
  }

  actualizar(id: string, cambios: Partial<Solicitud>) {
    return this.http.put<Solicitud>(`${API_URL}/solicitudes/${id}`, cambios);
  }

  eliminar(id: string) {
    return this.http.delete<{ mensaje: string }>(`${API_URL}/solicitudes/${id}`);
  }
}