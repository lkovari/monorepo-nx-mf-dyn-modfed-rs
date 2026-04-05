import { Component } from '@angular/core';
import { NxWelcome } from './nx-welcome';

@Component({
  imports: [NxWelcome],
  selector: 'nxmfdf-mf-remote-b-entry',
  template: `<nxmfdf-nx-welcome></nxmfdf-nx-welcome>`,
})
export class RemoteEntry {}
