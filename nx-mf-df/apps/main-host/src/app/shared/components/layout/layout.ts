import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { Main } from '../main/main';

@Component({
  selector: 'nxmfdf-layout',
  imports: [Header, Footer, Main],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Layout { }
