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

// Ítem del evento: el operador le pone precio y orden
export interface ItemEvento {
  numero?: number;
  categoria: string;
  descripcion?: string;
  cantidad: number;
  valorUnidad?: number;
}

export interface FotoEvento {
  _id?: string;
  url: string;
  nombre?: string;
  subidaEn?: string;
}

export type EstadoEvento = 'programado' | 'en_ejecucion' | 'finalizado' | 'certificado';

export interface Evento {
  _id?: string;
  solicitud: string | Solicitud;
  nombre: string;
  fecha: string;
  lugar: string;
  dependencia?: string;
  responsable?: string | Usuario;
  estado?: EstadoEvento;
  valorTotal?: number;
  proyecto?: string;
  rubro?: string;
  codigoAlojamiento?: string;
  observaciones?: string;
  items?: ItemEvento[];
  fotos?: FotoEvento[];
  firma?: string;
  firmanteNombre?: string;
}