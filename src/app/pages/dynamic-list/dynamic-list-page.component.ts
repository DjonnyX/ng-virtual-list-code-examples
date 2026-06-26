import { Component, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { delay, interval, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgVirtualListModule, NgVirtualListComponent, IVirtualListCollection, IVirtualListItemConfigMap, IRenderVirtualListItem, ISize, Id, IScrollingSettings, VirtualClickModule } from 'ng-virtual-list';
import { GradientColor, RoundedCorner } from '../../components/interfaces';
import { CustomScrollBarTheme } from '../../components/custom-scrollbar/interfaces/custom-scrollbar-theme';
import { CustomScrollbarModule } from '../../components/custom-scrollbar/custom-scrollbar.module';

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

const MAX_ITEMS = 10000;

interface ICollectionItem {
  id: Id;
  name: string;
}

interface IGroupCollectionItem extends ICollectionItem {
  id: Id;
  type: 'group-header' | 'item';
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

const generateText = (len: number = 10) => {
  const length = 2 + Math.floor(Math.random() * len), result = [];
  while (result.length < length) {
    result.push(generateWord());
  }
  let firstWord = '';
  for (let i = 0, l = result[0].length; i < l; i++) {
    const letter = result[0].charAt(i);
    firstWord += i === 0 ? letter.toUpperCase() : letter;
  }
  result[0] = firstWord;
  return `${result.join(' ')}.`;
};

const GROUP_DYNAMIC_ITEMS: IVirtualListCollection<IGroupCollectionItem> = [],
  GROUP_DYNAMIC_ITEMS_ITEM_CONFIG_MAP: IVirtualListItemConfigMap = {};

let groupDynamicIndex = 0;
for (let i = 0, l = MAX_ITEMS; i < l; i++) {
  const id = i + 1, type = i === 0 || Math.random() > .895 ? 'group-header' : 'item',
    isGroup = type === 'group-header',
    sticky = 1;
  if (isGroup) {
    groupDynamicIndex++;
  }
  GROUP_DYNAMIC_ITEMS.push({ id, type, name: isGroup ? `Group ${id}. ${generateText()}` : `${id}. ${generateText()}` });
  GROUP_DYNAMIC_ITEMS_ITEM_CONFIG_MAP[id] = {
    sticky: isGroup ? sticky : 0,
    selectable: !isGroup,
    collapsable: isGroup,
  };
}

const generateDynamicItems = (len: number, startWith: number = 0) => {
  const result: IVirtualListCollection<ICollectionItem> = [];
  for (let i = 0, l = len; i < l; i++) {
    const id = startWith + i;
    result.push({ id, name: `${id} ${generateText(8)}` });
  }
  return result;
};

@Component({
  selector: 'dynamic-list-page',
  imports: [CommonModule, FormsModule, NgVirtualListModule, CustomScrollbarModule, VirtualClickModule],
  templateUrl: './dynamic-list-page.component.html',
  styleUrl: './dynamic-list-page.component.scss'
})
export class DynamicListPageComponent {
  readonly scrollingSettings: IScrollingSettings = {
    frictionalForce: 0.05,
    mass: 0.005,
    maxDistance: 100000,
    maxDuration: 10000,
    speedScale: 10,
    optimization: false,
  }

  protected _listContainerRef = viewChild('virtualList', { read: NgVirtualListComponent });

  protected _dynamicItemsListContainerRef = viewChild('dynamicItemsList', { read: NgVirtualListComponent });

  protected _dl2ListContainerRef = viewChild('dl2List', { read: NgVirtualListComponent });

  protected _dynamicListContainerRef = viewChild('dynamicList', { read: NgVirtualListComponent });

  customScrollBarThumbParams = CUSTOM_SCROLLBAR_THEME;

  dynamicItems = generateDynamicItems(20, 0);

  groupDynamicItems = GROUP_DYNAMIC_ITEMS;
  groupDynamicItemsStickyMap = GROUP_DYNAMIC_ITEMS_ITEM_CONFIG_MAP;

  private _minDlId: Id = this.groupDynamicItems.length > 0 ? this.groupDynamicItems[0].id : 0;
  get minDlId() { return this._minDlId; };

  private _maxDlId: Id = this.groupDynamicItems.length > 0 ? this.groupDynamicItems[this.groupDynamicItems.length - 1].id : 0;
  get maxDlId() { return this._maxDlId; };

  dlItemId: Id = this._minDlId;

  itemsLength: number = 0;

  dynamicItemsLength: number = 0;

  motionBlurEnabled = false;

  constructor() {
    interval(1000).pipe(
      takeUntilDestroyed(),
      delay(250),
      tap(() => {
        const collection = [...this.dynamicItems];
        collection.unshift(...generateDynamicItems(1, this.dynamicItems.length));
        this.dynamicItems = collection;
      }),
      delay(450),
      tap(() => {
        const collection = [...this.dynamicItems], len = collection.length, insertIndex = Math.floor(len * .5),
          insertedItems = generateDynamicItems(1, this.dynamicItems.length);
        collection.splice(insertIndex, 0, ...insertedItems);
        this.dynamicItems = collection;
      }),
      delay(650),
      tap(() => {
        const collection = [...this.dynamicItems];
        collection.push(...generateDynamicItems(1, this.dynamicItems.length));
        this.dynamicItems = collection;
      }),
    ).subscribe();

    const bp: Promise<EventTarget & { level: number, charging: boolean; }> | null = (navigator as any).getBattery?.() ?? null;
    if (!!bp) {
      bp.then(battery => {
        battery.addEventListener('levelchange', () => {
          this.motionBlurEnabled = battery.level >= 0.10 || battery.charging;
        });
        this.motionBlurEnabled = battery.level >= 0.10 || battery.charging;
      });
    }
  }

  onButtonScrollDLToIdClickHandler = (e: Event) => {
    const list = this._dynamicListContainerRef(), id = this.dlItemId;
    if (list && id !== null) {
      list.scrollTo(id, () => {
        list.focus(id);
        console.info(`scrollTo finished. id: ${id}`);
      }, {
        behavior: 'instant',
      });
    }
  }

  onItemClick(item: IRenderVirtualListItem<ICollectionItem> | null) {
    if (item) {
      console.info(`Click: (ID: ${item.id}) Item ${item.data.name}`);
    }
  }

  onButtonChangeDynamicItemsLengthHandler() {
    const len = this.dynamicItemsLength;
    this.dynamicItems = generateDynamicItems(len);
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
