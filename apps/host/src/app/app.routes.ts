import { Route } from '@angular/router';
// Todo: fix types
// @ts-expect-error
import { loadRemote } from '@module-federation/runtime';

export const appRoutes: Route[] = [
  {
    path: 'mfe1',
    loadComponent: () => loadRemote('mfe1/app').then((m: any) => m.AppComponent),
  },
  {
    path: 'mfe2',
    loadComponent: () => loadRemote('mfe2/app').then((m: any) => m.AppComponent),
  },
  {
    path: 'mfe3',
    loadComponent: () => loadRemote('mfe3/app').then((m: any) => m.AppComponent),
  },
];
