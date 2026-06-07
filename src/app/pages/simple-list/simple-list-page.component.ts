import { Component, inject, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  NgVirtualListModule, NgVirtualListComponent, IVirtualListCollection, IVirtualListItemConfigMap, IRenderVirtualListItem, ISize, Id,
  IScrollingSettings,
} from 'ng-virtual-list';
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

const ITEMS: IVirtualListCollection<ICollectionItem> = [];
for (let i = 0, l = MAX_ITEMS; i < l; i++) {
  const id = i + 1;
  ITEMS.push({ id, name: `Item: ${id}` });
}

const ITEMS_RTL: IVirtualListCollection<ICollectionItem> = [];
for (let i = 0, l = MAX_ITEMS; i < l; i++) {
  const id = i + 1;
  ITEMS_RTL.push({ id, name: `פָּרִיט: ${id}` });
}

const HORIZONTAL_ITEMS: IVirtualListCollection<ICollectionItem> = [];
for (let i = 0, l = MAX_ITEMS; i < l; i++) {
  const id = i + 1;
  HORIZONTAL_ITEMS.push({ id, name: `${id}` });
}

const GROUP_ITEMS: IVirtualListCollection<IGroupCollectionItem> = [],
  GROUP_ITEMS_ITEM_CONFIG_MAP: IVirtualListItemConfigMap = {};

let groupIndex = 0;
for (let i = 0, l = MAX_ITEMS; i < l; i++) {
  const id = i + 1, type = i === 0 || Math.random() > .895 ? 'group-header' : 'item';
  if (type === 'group-header') {
    groupIndex++;
  }
  GROUP_ITEMS.push({ id, type, name: type === 'group-header' ? `Group ${groupIndex}` : `Item: ${id}` });
  GROUP_ITEMS_ITEM_CONFIG_MAP[id] = {
    sticky: type === 'group-header' ? 1 : 0,
    selectable: type !== 'group-header',
  };
}

const generateItems = (len: number) => {
  const result: IVirtualListCollection<ICollectionItem> = [];
  for (let i = 0, l = len; i < l; i++) {
    const id = i + 1;
    result.push({ id, name: `Item: ${id}` });
  }
  return result;
};

@Component({
  selector: 'simple-list-page',
  imports: [CommonModule, FormsModule, NgVirtualListModule, CustomScrollbarModule],
  templateUrl: './simple-list-page.component.html',
  styleUrl: './simple-list-page.component.scss'
})
export class SimpleListPageComponent {

  scrollingSettings: IScrollingSettings = {
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

  items = ITEMS;

  items1 = generateItems(1000);

  itemsRtl = ITEMS_RTL;

  horizontalItems = HORIZONTAL_ITEMS;

  private _minId: Id = this.items.length > 0 ? this.items[0].id : 0;
  get minId() { return this._minId; };

  private _maxId: Id = this.items.length > 0 ? this.items[this.items.length - 1].id : 0;
  get maxId() { return this._maxId; };

  itemId: Id = this._minId;

  itemsLength: number = 0;

  motionBlurEnabled = false;

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
  }

  onButtonScrollToIdClickHandler = (e: Event) => {
    const list = this._listContainerRef(), id = this.itemId;
    if (list && id !== null) {
      list.scrollTo(id, () => {
        list.focus(id);
        console.info(`scrollTo finished. id: ${id}`);
      }, {
        behavior: 'smooth',
      });
    }
  }

  onItemClick(item: IRenderVirtualListItem<ICollectionItem> | null) {
    if (item) {
      console.info(`Click: (ID: ${item.id}) Item ${item.data.name}`);
    }
  }

  onButtonChangeItemsLengthHandler() {
    const len = this.itemsLength;
    this.items1 = generateItems(len);
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
