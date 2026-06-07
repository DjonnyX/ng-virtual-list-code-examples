import { Component, viewChild } from '@angular/core';
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

const HORIZONTAL_ITEMS: IVirtualListCollection<ICollectionItem> = [];
for (let i = 0, l = MAX_ITEMS; i < l; i++) {
  const id = i + 1;
  HORIZONTAL_ITEMS.push({ id, name: `${id}` });
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
  selector: 'swipe-list-page',
  imports: [CommonModule, FormsModule, NgVirtualListModule, CustomScrollbarModule],
  templateUrl: './swipe-list-page.component.html',
  styleUrl: './swipe-list-page.component.scss'
})
export class SwipeListPageComponent {

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

  items1 = generateItems(1000);

  horizontalItems = HORIZONTAL_ITEMS;

  itemsLength: number = 0;

  dynamicItemsLength: number = 0;

  dynamicShortItemsLength: number = 0;

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
