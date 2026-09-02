import { Usuario } from './usuario.model';

export interface Item {
  categoria: string;
  cantidad: number;
  descripcion?: string;
}

export type EstadoSolicitud = 'pendiente' | 'aprobada' | 'rechazada';

export interface Solicitud {
  _id?: string;
  nombreEvento: string;
  fechaEvento: string;
  lugar: string;
  dependencia: string;
  items: Item[];
  contactoNombre?: string;
  contactoTelefono?: string;
  estado?: EstadoSolicitud;
  solicitante?: string | Usuario;
  createdAt?: string;
  updatedAt?: string;
}

export type EstadoEvento = 'programado' | 'en_ejecucion' | 'finalizado' | 'certificado';

export interface Evento {
  _id?: string;
  solicitud: string | Solicitud;
  nombre: string;
  fecha: string;
  lugar: string;
  responsable?: string | Usuario;
  estado?: EstadoEvento;
  valorTotal?: number;
  observaciones?: string;
}