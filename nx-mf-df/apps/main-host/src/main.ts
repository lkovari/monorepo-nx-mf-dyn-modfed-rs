import { registerRemotes } from '@module-federation/enhanced/runtime';

fetch('/module-federation.manifest.json')
  .then((res) => {
    if (!res.ok) {
      throw new Error(`Failed to load host manifest: ${res.status} ${res.statusText}`);
    }
    return res.json();
  })
  .then((remotes: Record<string, string>) =>
    Object.entries(remotes).map(([name, entry]) => ({ name, entry })),
  )
  .then((remotes) => registerRemotes(remotes))
  .then(() => import('./bootstrap'))
  .catch((err) => {
    console.error('Dynamic federation startup failed:', err);
  });
