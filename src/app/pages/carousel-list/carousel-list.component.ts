import { Component, DestroyRef, ElementRef, inject, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  NgVirtualListModule, NgVirtualListComponent, IVirtualListCollection, IRenderVirtualListItem, ISize, Id,
  IScrollingSettings, ItemTransformations,
} from 'ng-virtual-list';
import { GradientColor, RoundedCorner } from '../../components/interfaces';
import { CustomScrollBarTheme } from '../../components/custom-scrollbar/interfaces/custom-scrollbar-theme';
import { CustomScrollbarModule } from '../../components/custom-scrollbar/custom-scrollbar.module';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { delay, filter, switchMap, tap } from 'rxjs';

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

interface ICollectionItem {
  id: Id;
  name: string;
}

const ITEMS: IVirtualListCollection<ICollectionItem> = [];
for (let i = 0, l = MAX_ITEMS; i < l; i++) {
  const id = i + 1;
  ITEMS.push({ id, name: `Item: ${id}` });
}

const HORIZONTAL_ITEMS: IVirtualListCollection<ICollectionItem> = [];
for (let i = 0, l = MAX_ITEMS; i < l; i++) {
  const id = i + 1;
  HORIZONTAL_ITEMS.push({ id, name: `${id}` });
}

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
  const length = 1 + Math.floor(Math.random() * len), result = [];
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

const generateDynamicItems = (len: number, startWith: number = 0) => {
  const result: IVirtualListCollection<ICollectionItem> = [];
  for (let i = 0, l = len; i < l; i++) {
    const id = startWith + i;
    result.push({ id, name: `${id} ${generateText((Math.floor(Math.random()) === 0 ? 0 : 8), 15)}` });
  }
  return result;
};

@Component({
  selector: 'carousel-list',
  imports: [CommonModule, FormsModule, NgVirtualListModule, CustomScrollbarModule],
  templateUrl: './carousel-list.component.html',
  styleUrl: './carousel-list.component.scss'
})
export class CarouselListPageComponent {
  readonly scrollingSettings: IScrollingSettings = {
    frictionalForce: 0.05,
    mass: 0.005,
    maxDistance: 100000,
    maxDuration: 10000,
    speedScale: 10,
    optimization: false,
  }

  protected _gallery1Ref = viewChild('gallery1', { read: NgVirtualListComponent });

  protected _gallery2Ref = viewChild('gallery2', { read: NgVirtualListComponent });

  protected _gallery3Ref = viewChild('gallery3', { read: NgVirtualListComponent });

  protected _gallery4Ref = viewChild('gallery4', { read: NgVirtualListComponent });

  protected _gallery5Ref = viewChild('gallery5', { read: NgVirtualListComponent });

  protected _audioSnapRef = viewChild<ElementRef<HTMLAudioElement>>('audioSnap');

  readonly customScrollBarThumbParams = CUSTOM_SCROLLBAR_THEME;

  dynamicItems = generateDynamicItems(100, 0);

  horizontalItems = HORIZONTAL_ITEMS;

  motionBlurEnabled = false;

  gallery1Classes = { visible: false };

  gallery2Classes = { visible: false };

  gallery3Classes = { visible: false };

  gallery4Classes = { visible: false };

  gallery5Classes = { visible: false };

  eventHorizon = ItemTransformations.EVENT_HORIZON();

  linear = ItemTransformations.LINEAR();

  deckOfCards = ItemTransformations.DECK_OF_CARDS({ sineWave: true, scale: .05 });

  deckOfCards3D = ItemTransformations.DECK_OF_CARDS_3D({ dof: 8, fogColor: '#170e26', fogWeight: 4, angle: 1.35, spacingBetweenItems: 0.25 });

  deckOfCards3DDynamic = ItemTransformations.DECK_OF_CARDS_3D({ dof: 12, fogColor: '#170e26', fogWeight: 7, spacingBetweenItems: 0.35, sineWave: true });

  private _destroyRef = inject(DestroyRef);

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

    const $gallery1 = toObservable(this._gallery1Ref),
      $gallery2 = toObservable(this._gallery2Ref),
      $gallery3 = toObservable(this._gallery3Ref),
      $gallery4 = toObservable(this._gallery4Ref),
      $gallery5 = toObservable(this._gallery5Ref);

    $gallery1.pipe(
      takeUntilDestroyed(),
      filter(v => !!v),
      switchMap(v => {
        return v.$show.pipe(
          takeUntilDestroyed(this._destroyRef),
          filter(v => !!v),
          delay(100),
          tap(g => {
            v.scrollTo(10);
            this.gallery1Classes = { visible: true };
          }),
        );
      }),
    ).subscribe();

    $gallery2.pipe(
      takeUntilDestroyed(),
      filter(v => !!v),
      switchMap(v => {
        return v.$show.pipe(
          takeUntilDestroyed(this._destroyRef),
          filter(v => !!v),
          delay(100),
          tap(g => {
            v.scrollTo(10);
            this.gallery2Classes = { visible: true };
          }),
        );
      }),
    ).subscribe();

    $gallery3.pipe(
      takeUntilDestroyed(),
      filter(v => !!v),
      switchMap(v => {
        return v.$show.pipe(
          takeUntilDestroyed(this._destroyRef),
          filter(v => !!v),
          delay(500),
          tap(g => {
            v.scrollTo(10);
            this.gallery3Classes = { visible: true };
          }),
        );
      }),
    ).subscribe();

    $gallery4.pipe(
      takeUntilDestroyed(),
      filter(v => !!v),
      switchMap(v => {
        return v.$show.pipe(
          takeUntilDestroyed(this._destroyRef),
          filter(v => !!v),
          delay(100),
          tap(g => {
            v.scrollTo(10);
            this.gallery4Classes = { visible: true };
          }),
        );
      }),
    ).subscribe();

    $gallery5.pipe(
      takeUntilDestroyed(),
      filter(v => !!v),
      switchMap(v => {
        return v.$show.pipe(
          takeUntilDestroyed(this._destroyRef),
          filter(v => !!v),
          delay(100),
          tap(g => {
            v.scrollTo(10);
            this.gallery5Classes = { visible: true };
          }),
        );
      }),
    ).subscribe();
  }

  onSnapItemHandler() {
    const el = this._audioSnapRef()?.nativeElement;
    if (!!el) {
      el.currentTime = 0;
      try {
        el.play();
      } catch (err) { }
    }
  }

  onItemClick(item: IRenderVirtualListItem<ICollectionItem> | null) {
    if (item) {
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
}
