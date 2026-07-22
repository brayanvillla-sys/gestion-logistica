import { Routes } from '@angular/router';
import { Inicio } from './pages/inicio/inicio';
import { Login } from './pages/login/login';
import { Registro } from './pages/registro/registro';
import { Panel } from './pages/panel/panel';
import { Perfil } from './pages/perfil/perfil';
import { SobreNosotros } from './pages/sobre-nosotros/sobre-nosotros';

export const routes: Routes = [
  { path: '', component: Inicio },
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },
  { path: 'panel', component: Panel },
  { path: 'perfil', component: Perfil },
  { path: 'sobre-nosotros', component: SobreNosotros },
  { path: '**', redirectTo: '' },
];