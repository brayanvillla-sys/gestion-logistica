import { Routes } from '@angular/router';
import { Inicio } from './pages/inicio/inicio';
import { Login } from './pages/login/login';
import { Registro } from './pages/registro/registro';
import { Panel } from './pages/panel/panel';
import { Operacion } from './pages/operacion/operacion';
import { EventoTrabajo } from './pages/evento-trabajo/evento-trabajo';
import { Perfil } from './pages/perfil/perfil';
import { SobreNosotros } from './pages/sobre-nosotros/sobre-nosotros';
import { authGuard, rolGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', component: Inicio },
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },
  { path: 'sobre-nosotros', component: SobreNosotros },
  { path: 'panel', component: Panel, canActivate: [authGuard] },
  { path: 'operacion', component: Operacion, canActivate: [authGuard, rolGuard('operador', 'admin')] },
  { path: 'operacion/evento/:id', component: EventoTrabajo, canActivate: [authGuard, rolGuard('operador', 'admin')] },
  { path: 'perfil', component: Perfil, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];