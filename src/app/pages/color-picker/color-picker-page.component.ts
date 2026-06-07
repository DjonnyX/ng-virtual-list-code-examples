import { Component, computed, ElementRef, Signal, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  NgVirtualListModule, NgVirtualListComponent, IVirtualListCollection, Id, IScrollingSettings, VirtualClickModule, IScrollEvent,
} from 'ng-virtual-list';
import { CustomScrollbarModule } from '../../components/custom-scrollbar/custom-scrollbar.module';
import { GradientColor, RoundedCorner } from '../../types';
import { CustomScrollBarTheme } from '../../components/custom-scrollbar/interfaces/custom-scrollbar-theme';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { delay, filter, tap } from 'rxjs';

const X_RED_PLASMA_GRADIENT: GradientColor = ["rgba(255,0,0,0)", "rgba(255,55,55,1)"],
  X_GREEN_PLASMA_GRADIENT: GradientColor = ["rgba(0,255,0,0)", "rgba(55,255,55,1)"],
  X_BLUE_PLASMA_GRADIENT: GradientColor = ["rgba(0,0,255,0)", "rgba(55,55,255,1)"],
  ROUND_CORNER: RoundedCorner = [3, 3, 3, 3],
  RED_THEME: CustomScrollBarTheme = {
    fill: ["rgba(255,0,0,1)", "rgba(125,0,0,1)"],
    hoverFill: ["rgba(255,50,50,1)", "rgba(125,50,50,1)"],
    pressedFill: ["rgba(255,25,25,1)", "rgba(125,25,25,1)"],
    strokeGradientColor: X_RED_PLASMA_GRADIENT,
    strokeAnimationDuration: 10000,
    roundCorner: ROUND_CORNER,
    rippleColor: 'rgba(255,255,255,0.5)',
    rippleEnabled: true,
  },
  GREEN_THEME: CustomScrollBarTheme = {
    fill: ["rgba(0,255,0,1)", "rgba(0,125,0,1)"],
    hoverFill: ["rgba(50,255,50,1)", "rgba(50,125,50,1)"],
    pressedFill: ["rgba(25,255,25,1)", "rgba(25,125,25,1)"],
    strokeGradientColor: X_GREEN_PLASMA_GRADIENT,
    strokeAnimationDuration: 10000,
    roundCorner: ROUND_CORNER,
    rippleColor: 'rgba(255,255,255,0.5)',
    rippleEnabled: true,
  },
  BLUE_THEME: CustomScrollBarTheme = {
    fill: ["rgba(0,0,255,1)", "rgba(0,0,125,1)"],
    hoverFill: ["rgba(50,50,255,1)", "rgba(50,50,125,1)"],
    pressedFill: ["rgba(25,25,255,1)", "rgba(25,25,125,1)"],
    strokeGradientColor: X_BLUE_PLASMA_GRADIENT,
    strokeAnimationDuration: 10000,
    roundCorner: ROUND_CORNER,
    rippleColor: 'rgba(255,255,255,0.5)',
    rippleEnabled: true,
  },
  SLIDER_HEIGHT = 200;

interface ICollectionItem {
  id: Id;
  color: string;
}

const RED_ITEMS: IVirtualListCollection<ICollectionItem> = [];
for (let i = 0, l = 255; i < l; i++) {
  RED_ITEMS.push({ id: i, color: `rgb(${(255 - i) * .5},0,0)` });
}

const GREEN_ITEMS: IVirtualListCollection<ICollectionItem> = [];
for (let i = 0, l = 255; i < l; i++) {
  GREEN_ITEMS.push({ id: i, color: `rgb(0,${(255 - i) * .5},0)` });
}

const BLUE_ITEMS: IVirtualListCollection<ICollectionItem> = [];
for (let i = 0, l = 255; i < l; i++) {
  BLUE_ITEMS.push({ id: i, color: `rgb(0,0,${(255 - i) * .5})` });
}

const getColor = (e: IScrollEvent) => {
  const k = e.scrollSize === 0 ? 0 : ((e.scrollSize + SLIDER_HEIGHT) / e.scrollSize);
  return 255 - (e.scrollSize * k) * .01;
}

const setColor = (value: number) => {
  return 255 - value;
}

@Component({
  selector: 'color-picker-page',
  imports: [CommonModule, FormsModule, NgVirtualListModule, CustomScrollbarModule, VirtualClickModule],
  templateUrl: './color-picker-page.component.html',
  styleUrl: './color-picker-page.component.scss'
})
export class ColorPickerPageComponent {
  protected _audioSnapRef = viewChild<ElementRef<HTMLAudioElement>>('audioSnap');

  listRed = viewChild('listRed', { read: NgVirtualListComponent });

  listGreen = viewChild('listGreen', { read: NgVirtualListComponent });

  listBlue = viewChild('listBlue', { read: NgVirtualListComponent });

  customScrollBarRedThumbParams = RED_THEME;

  customScrollBarGreenThumbParams = GREEN_THEME;

  customScrollBarBlueThumbParams = BLUE_THEME;

  scrollingSettings: IScrollingSettings = {
    frictionalForce: 0.1,
    mass: 0.01,
    maxDistance: 1000,
    maxDuration: 2000,
    speedScale: 5,
    optimization: false,
  };

  redItems = RED_ITEMS;

  greenItems = GREEN_ITEMS;

  blueItems = BLUE_ITEMS;

  listRedSelectedIds: Id | null = RED_ITEMS[setColor(102)].id;

  listGreenSelectedIds: Id | null = GREEN_ITEMS[setColor(49)].id;

  listBlueSelectedIds: Id | null = BLUE_ITEMS[setColor(134)].id;

  color: Signal<string>;

  r = signal<number>(0);

  g = signal<number>(0);

  b = signal<number>(0);

  constructor() {
    const $listRed = toObservable(this.listRed);
    $listRed.pipe(
      takeUntilDestroyed(),
      filter(v => !!v),
      delay(100),
      tap(list => {
        if (this.listRedSelectedIds !== null) {
          list.scrollTo(this.listRedSelectedIds);
        }
      }),
    ).subscribe();

    const $listGreen = toObservable(this.listGreen);
    $listGreen.pipe(
      takeUntilDestroyed(),
      filter(v => !!v),
      delay(100),
      tap(list => {
        if (this.listGreenSelectedIds !== null) {
          list.scrollTo(this.listGreenSelectedIds);
        }
      }),
    ).subscribe();

    const $listBlue = toObservable(this.listBlue);
    $listBlue.pipe(
      takeUntilDestroyed(),
      filter(v => !!v),
      delay(100),
      tap(list => {
        if (this.listBlueSelectedIds !== null) {
          list.scrollTo(this.listBlueSelectedIds);
        }
      }),
    ).subscribe();

    this.color = computed(() => {
      const r = this.r(), g = this.g(), b = this.b();
      return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
    })
  }

  onScrollRed(e: IScrollEvent) {
    this.r.set(getColor(e));
  }

  onScrollGreen(e: IScrollEvent) {
    this.g.set(getColor(e));
  }

  onScrollBlue(e: IScrollEvent) {
    this.b.set(getColor(e));
  }
}
