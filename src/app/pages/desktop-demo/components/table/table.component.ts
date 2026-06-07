import { Component, computed, input, Signal } from '@angular/core';
import { Id } from 'ng-virtual-list';

interface ITool {
  id: Id;
  name: string;
}

interface ICollectionItem {
  id: Id;
  name: string;
  items: Array<ITool>;
}

const ITEMS: Array<ICollectionItem> = [];
let count = 0;
for (let i = 0, l = 5; i < l; i++) {
  const items: Array<ITool> = [];
  for (let j = 0, l1 = 16; j < l1; j++) {
    count++;
    items.push({
      id: j,
      name: `${count}`,
    });
  }
  ITEMS.push({ id: i, name: `${i}`, items });
}


@Component({
  selector: 'table-demo',
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  standalone: false,
})
export class TableComponent {

  id = input<Id>(0);

  data: Signal<ICollectionItem>;

  constructor() {
    this.data = computed(() => {
      const id = this.id();
      return ITEMS[Number(id)];
    });
  }
}
