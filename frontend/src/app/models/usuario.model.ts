export type Rol = 'secretaria' | 'operador' | 'admin' | 'supervisor';

export interface Usuario {
  id?: string;
  _id?: string;
  nombre: string;
  email: string;
  rol: Rol;
  dependencia?: string;
  firma?: string;
  activo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RespuestaAuth {
  token: string;
  usuario: Usuario;
}

export interface CredencialesLogin {
  email: string;
  password: string;
}

export interface DatosRegistro {
  nombre: string;
  email: string;
  password: string;
  rol?: Rol;
  dependencia?: string;
}