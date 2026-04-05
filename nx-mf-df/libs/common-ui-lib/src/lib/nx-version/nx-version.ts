import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { NgStyle } from '@angular/common';
import { FAKE_NX_VERSION } from './nx-version.constant';

@Component({
  selector: 'nxmfdf-nx-version',
  imports: [NgStyle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './nx-version.html',
  styleUrl: './nx-version.css',
})
export class NxVersion {
  protected readonly nxVersion = signal(FAKE_NX_VERSION);
  textStyle = input<{ [key: string]: string }>({});
}

