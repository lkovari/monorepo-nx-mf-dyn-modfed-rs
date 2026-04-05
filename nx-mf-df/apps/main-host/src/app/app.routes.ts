import { Route } from '@angular/router';
import { loadRemote } from '@module-federation/enhanced/runtime';
import { Home } from './features/home/home';

function remoteChildRoutes<T extends { remoteRoutes: Route[] }>(
  loaded: T | null | undefined,
  remoteId: string,
): Route[] {
  if (loaded == null) {
    throw new Error(`Failed to load ${remoteId}`);
  }
  return loaded.remoteRoutes;
}

export const appRoutes: Route[] = [
  {
    path: '',
    component: Home,
  },
  {
    path: 'mf_remote_a',
    loadChildren: () =>
      loadRemote<typeof import('mf_remote_a/Routes')>('mf_remote_a/Routes').then((m) =>
        remoteChildRoutes(m, 'mf_remote_a/Routes'),
      ),
  },
  {
    path: 'mf_remote_b',
    loadChildren: () =>
      loadRemote<typeof import('mf_remote_b/Routes')>('mf_remote_b/Routes').then((m) =>
        remoteChildRoutes(m, 'mf_remote_b/Routes'),
      ),
  },
  {
    path: 'mf_remote_c',
    loadChildren: () =>
      loadRemote<typeof import('mf_remote_c/Routes')>('mf_remote_c/Routes').then((m) =>
        remoteChildRoutes(m, 'mf_remote_c/Routes'),
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
