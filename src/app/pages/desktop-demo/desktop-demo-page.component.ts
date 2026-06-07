import { Component, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  NgVirtualListModule, NgVirtualListComponent, IVirtualListCollection, Id, IScrollingSettings, VirtualClickModule,
} from 'ng-virtual-list';
import { CustomScrollbarModule } from '../../components/custom-scrollbar/custom-scrollbar.module';
import { TableModule } from './components/table/table.module';
import { PagginatorModule } from './components/paginator/paginator.module';

interface ICollectionItem {
  id: Id;
  name: string;
}

const TABLES: IVirtualListCollection<ICollectionItem> = [];
for (let i = 0, l = 5; i < l; i++) {
  TABLES.push({ id: i, name: `${i}` });
}

@Component({
  selector: 'desktop-demo-page',
  imports: [CommonModule, FormsModule, NgVirtualListModule, CustomScrollbarModule, VirtualClickModule, TableModule, PagginatorModule],
  templateUrl: './desktop-demo-page.component.html',
  styleUrl: './desktop-demo-page.component.scss'
})
export class DesktopDemoPageComponent {
  list = viewChild('list', { read: NgVirtualListComponent });

  scrollingSettings: IScrollingSettings = {
    frictionalForce: 0.1,
    mass: 0.01,
    maxDistance: 1000,
    maxDuration: 2000,
    speedScale: 5,
    optimization: false,
  };

  tables = TABLES;

  page: number = 0;

  constructor() { }

  onSnapHandler(id: Id | null) {
    if (id !== null) {
      this.page = Number(id);
    }
  }
}
