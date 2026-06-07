import { Component, computed, input, Signal } from '@angular/core';

interface IItem {
  id: number;
  active: boolean;
}

@Component({
  selector: 'paginator',
  templateUrl: './paginator.component.html',
  styleUrl: './paginator.component.scss',
  standalone: false,
})
export class PagginatorComponent {

  page = input<number>(0);

  total = input<number>(0);

  items: Signal<Array<IItem>>;

  constructor() {
    this.items = computed(() => {
      const result: Array<IItem> = [], total = this.total(), page = this.page();
      for (let i = 0, l = total; i < l; i++) {
        result.push({
          id: i,
          active: i === page,
        });
      }
      return result;
    })
  }
}
