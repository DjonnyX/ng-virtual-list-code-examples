import { Component, DestroyRef, ElementRef, inject, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  NgVirtualListModule, NgVirtualListComponent, IVirtualListCollection, IRenderVirtualListItem, ISize, Id, IScrollingSettings,
  ItemTransformations, VirtualClickModule,
} from 'ng-virtual-list';
import { GradientColor, RoundedCorner } from '../../components/interfaces';
import { CustomScrollBarTheme } from '../../components/custom-scrollbar/interfaces/custom-scrollbar-theme';
import { CustomScrollbarModule } from '../../components/custom-scrollbar/custom-scrollbar.module';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, filter, Subject, switchMap, tap } from 'rxjs';

const X_LITE_BLUE_PLASMA_GRADIENT: GradientColor = ["rgba(133, 142, 255, 0)", "rgb(0, 133, 160)"],
  ROUND_CORNER: RoundedCorner = [3, 3, 3, 3],
  CUSTOM_SCROLLBAR_THEME: CustomScrollBarTheme = {
    fill: ["rgba(101, 50, 147, 1)", "rgba(123, 50, 147, 1)"],
    hoverFill: ["rgba(73, 6, 133, 1)", "rgba(73, 6, 133, 1)"],
    pressedFill: ["rgba(73, 6, 150, 1)", "rgba(95, 0, 150, 1)"],
    strokeGradientColor: X_LITE_BLUE_PLASMA_GRADIENT,
    strokeAnimationDuration: 1000,
    roundCorner: ROUND_CORNER,
    rippleColor: 'rgba(255,255,255,0.5)',
    rippleEnabled: true,
  };

const MAX_ITEMS = 100;

const CHARS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

const generateLetter = () => {
  return CHARS[Math.round(Math.random() * CHARS.length)];
}

const generateWord = (len: number = 50) => {
  const length = 5 + Math.floor(Math.random() * len), result = [];
  while (result.length < length) {
    result.push(generateLetter());
  }
  return `${result.join('')}`;
};

const generateText = (len: number = 10, wordLen = 50) => {
  const length = 2 + Math.floor(Math.random() * len), result = [];
  while (result.length < length) {
    result.push(generateWord(wordLen));
  }
  let firstWord = '';
  for (let i = 0, l = result[0].length; i < l; i++) {
    const letter = result[0].charAt(i);
    firstWord += i === 0 ? letter.toUpperCase() : letter;
  }
  result[0] = firstWord;
  return `${result.join(' ')}.`;
};

interface ICollectionItem {
  id: Id;
  name: string;
}

const ITEMS: IVirtualListCollection<ICollectionItem> = [];
for (let i = 0, l = MAX_ITEMS; i < l; i++) {
  const id = i + 1;
  ITEMS.push({ id, name: `${id}` });
}

const ITEMS2: IVirtualListCollection<ICollectionItem> = [];
for (let i = 0, l = MAX_ITEMS; i < l; i++) {
  const id = i + 1;
  ITEMS2.push({ id, name: `${id} ${generateText(4)}` });
}

const ITEMS3: IVirtualListCollection<ICollectionItem> = [];
for (let i = 0, l = MAX_ITEMS; i < l; i++) {
  const id = i + 1;
  ITEMS3.push({ id, name: `${id} ${generateText(1, 5)}` });
}

const INIT_SELECTED_ID: Id = 10;

@Component({
  selector: 'infinite-list-page',
  imports: [CommonModule, FormsModule, NgVirtualListModule, CustomScrollbarModule, VirtualClickModule],
  templateUrl: './infinite-list-page.component.html',
  styleUrl: './infinite-list-page.component.scss'
})
export class InfiniteListPageComponent {
  protected _audioSnapRef = viewChild<ElementRef<HTMLAudioElement>>('audioSnap');

  list = viewChild('list', { read: NgVirtualListComponent });

  list1 = viewChild('list1', { read: NgVirtualListComponent });

  list2 = viewChild('list2', { read: NgVirtualListComponent });

  scrollingSettings: IScrollingSettings = {
    frictionalForce: 0.05,
    mass: 0.005,
    maxDistance: 100000,
    maxDuration: 10000,
    speedScale: 10,
    optimization: false,
  };

  customScrollBarThumbParams = CUSTOM_SCROLLBAR_THEME;

  items = ITEMS;

  items1 = ITEMS2;

  itemsDynamic = ITEMS3;

  motionBlurEnabled = false;

  listSelectedIds: Id | null = INIT_SELECTED_ID;

  list1SelectedIds: Id | null = INIT_SELECTED_ID;

  list2SelectedIds: Id | null = INIT_SELECTED_ID;

  private _$snapListItem = new Subject<Id>();
  readonly $snapListItem = this._$snapListItem.asObservable();

  private _$snapList1Item = new Subject<Id>();
  readonly $snapList1Item = this._$snapList1Item.asObservable();

  private _$snapList2Item = new Subject<Id>();
  readonly $snapList2Item = this._$snapList2Item.asObservable();

  private _destroyRef = inject(DestroyRef);

  deckOfCards3D = ItemTransformations.DECK_OF_CARDS_3D({ dof: 8, fogColor: '#170e26', fogWeight: 5, spacingBetweenItems: 0.5 });

  constructor() {
    const bp: Promise<EventTarget & { level: number, charging: boolean; }> | null = (navigator as any).getBattery?.() ?? null;
    if (!!bp) {
      bp.then(battery => {
        battery.addEventListener('levelchange', () => {
          this.motionBlurEnabled = battery.level >= 0.10 || battery.charging;
        });
        this.motionBlurEnabled = battery.level >= 0.10 || battery.charging;
      });
    }

    const $list = toObservable(this.list);

    $list.pipe(
      takeUntilDestroyed(),
      filter(v => !!v),
      switchMap(list => {
        return list.$initialized.pipe(
          takeUntilDestroyed(this._destroyRef),
          tap(() => {
            if (this.listSelectedIds !== null) {
              list.scrollTo(this.listSelectedIds, null, { focused: false });
            }
          }),
        )
      })
    ).subscribe();

    const $list1 = toObservable(this.list1);

    $list1.pipe(
      takeUntilDestroyed(),
      filter(v => !!v),
      switchMap(list => {
        return list.$initialized.pipe(
          takeUntilDestroyed(this._destroyRef),
          tap(() => {
            if (this.list1SelectedIds !== null) {
              list.scrollTo(this.list1SelectedIds, null, { focused: false });
            }
          }),
        )
      })
    ).subscribe();

    const $list2 = toObservable(this.list2);

    $list2.pipe(
      takeUntilDestroyed(),
      filter(v => !!v),
      switchMap(list => {
        return list.$initialized.pipe(
          takeUntilDestroyed(this._destroyRef),
          tap(() => {
            if (this.list2SelectedIds !== null) {
              list.scrollTo(this.list2SelectedIds, null, { focused: false });
            }
          }),
        )
      })
    ).subscribe();

    this.$snapListItem.pipe(
      takeUntilDestroyed(),
      debounceTime(50),
      tap(id => {
        this.listSelectedIds = id;
        this.playSound();
      }),
    ).subscribe();

    this.$snapList1Item.pipe(
      takeUntilDestroyed(),
      debounceTime(50),
      tap(id => {
        this.list1SelectedIds = id;
        this.playSound();
      }),
    ).subscribe();

    this.$snapList2Item.pipe(
      takeUntilDestroyed(),
      debounceTime(50),
      tap(id => {
        this.list2SelectedIds = id;
        this.playSound();
      }),
    ).subscribe();
  }

  onSnapItemHandler(id: Id | null) {
    if (id !== null) {
      this._$snapListItem.next(id);
    }
  }

  onSnapItem1Handler(id: Id | null) {
    if (id !== null) {
      this._$snapList1Item.next(id);
    }
  }

  onSnapItem2Handler(id: Id | null) {
    if (id !== null) {
      this._$snapList2Item.next(id);
    }
  }

  onItemClick(item: IRenderVirtualListItem<ICollectionItem> | null) {
    if (!!item) {
      console.info(`Click: (ID: ${item.id}) Item ${item.data.name}`);
    }
  }

  onSelectHandler(data: Array<Id> | Id | null) {
    console.info(`Select: ${JSON.stringify(data)}`);
  }

  onViewportChangeHandler(size: ISize) {
    console.info(`Viewport changed: ${JSON.stringify(size)}`);
  }

  onScrollReachStartHandler() {
    console.info(`onScrollReachStart`);
  }

  onScrollReachEndHandler() {
    console.info(`onScrollReachEnd`);
  }

  private playSound() {
    const el = this._audioSnapRef()?.nativeElement;
    if (!!el) {
      el.currentTime = 0;
      el.play();
    }
  }
}
