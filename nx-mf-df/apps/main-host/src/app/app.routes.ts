import { NxWelcome } from './nx-welcome';
import { Route } from '@angular/router';
import { loadRemote } from '@module-federation/enhanced/runtime';

export const appRoutes: Route[] = [
  {
    path: 'mf_remote_c',
    loadChildren: () =>
      loadRemote<typeof import('mf_remote_c/Routes')>(
        'mf_remote_c/Routes',
      ).then((m) => m!.remoteRoutes),
  },
  {
    path: 'mf_remote_b',
    loadChildren: () =>
      loadRemote<typeof import('mf_remote_b/Routes')>(
        'mf_remote_b/Routes',
      ).then((m) => m!.remoteRoutes),
  },
  {
    path: 'mf_remote_a',
    loadChildren: () =>
      loadRemote<typeof import('mf_remote_a/Routes')>(
        'mf_remote_a/Routes',
      ).then((m) => m!.remoteRoutes),
  },
  {
    path: '',
    component: NxWelcome,
  },
];
