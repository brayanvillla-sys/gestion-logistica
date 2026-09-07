import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { API_URL } from '../config';
import { Usuario, RespuestaAuth, CredencialesLogin, DatosRegistro } from '../models/usuario.model';

const CLAVE_TOKEN = 'gl_token';
const CLAVE_USUARIO = 'gl_usuario';

@Injectable({ providedIn: 'root' })
export class Auth {
  private http = inject(HttpClient);
  private router = inject(Router);
  private navegador = isPlatformBrowser(inject(PLATFORM_ID));

  private usuarioActual = signal<Usuario | null>(this.leerUsuarioGuardado());

  usuario = this.usuarioActual.asReadonly();
  autenticado = computed(() => this.usuarioActual() !== null);
  rol = computed(() => this.usuarioActual()?.rol ?? null);

  login(credenciales: CredencialesLogin) {
    return this.http.post<RespuestaAuth>(`${API_URL}/auth/login`, credenciales)
      .pipe(tap((r) => this.guardarSesion(r)));
  }

  registro(datos: DatosRegistro) {
    return this.http.post<RespuestaAuth>(`${API_URL}/auth/registro`, datos)
      .pipe(tap((r) => this.guardarSesion(r)));
  }

  perfil() {
    return this.http.get<Usuario>(`${API_URL}/auth/perfil`);
  }

  guardarFirma(firma: string) {
    return this.http.put<Usuario>(`${API_URL}/usuarios/mi-firma`, { firma })
      .pipe(tap((u) => this.actualizarUsuarioLocal(u)));
  }

  logout() {
    if (this.navegador) {
      localStorage.removeItem(CLAVE_TOKEN);
      localStorage.removeItem(CLAVE_USUARIO);
    }
    this.usuarioActual.set(null);
    this.router.navigate(['/login']);
  }

  obtenerToken(): string | null {
    if (!this.navegador) return null;
    return localStorage.getItem(CLAVE_TOKEN);
  }

  private actualizarUsuarioLocal(u: Usuario) {
    const actual = this.usuarioActual();
    const combinado = { ...actual, ...u } as Usuario;
    if (this.navegador) {
      localStorage.setItem(CLAVE_USUARIO, JSON.stringify(combinado));
    }
    this.usuarioActual.set(combinado);
  }

  private guardarSesion(respuesta: RespuestaAuth) {
    if (this.navegador) {
      localStorage.setItem(CLAVE_TOKEN, respuesta.token);
      localStorage.setItem(CLAVE_USUARIO, JSON.stringify(respuesta.usuario));
    }
    this.usuarioActual.set(respuesta.usuario);
  }

  private leerUsuarioGuardado(): Usuario | null {
    if (!this.navegador) return null;
    const guardado = localStorage.getItem(CLAVE_USUARIO);
    if (!guardado) return null;
    try {
      return JSON.parse(guardado) as Usuario;
    } catch {
      return null;
    }
  }
}