import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  NgVirtualListModule, IVirtualListCollection, IVirtualListItemConfigMap, IRenderVirtualListItem, ISize, Id,
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

const GROUP_NAMES = ['A', 'B', 'C', 'D', 'E'];

const getGroupName = () => {
  return GROUP_NAMES[Math.floor(Math.random() * GROUP_NAMES.length)];
};

const HORIZONTAL_GROUP_ITEMS: IVirtualListCollection<IGroupCollectionItem> = [],
  HORIZONTAL_GROUP_ITEMS_ITEM_CONFIG_MAP: IVirtualListItemConfigMap = {};

for (let i = 0, l = MAX_ITEMS; i < l; i++) {
  const id = i + 1, type = i === 0 || Math.random() > .895 ? 'group-header' : 'item';
  HORIZONTAL_GROUP_ITEMS.push({ id, type, name: type === 'group-header' ? getGroupName() : `${id}` });
  HORIZONTAL_GROUP_ITEMS_ITEM_CONFIG_MAP[id] = {
    sticky: type === 'group-header' ? Math.round(Math.random() * 2) === 1 ? 1 : 2 : 0,
    selectable: type !== 'group-header',
  }
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

@Component({
  selector: 'grouped-list-page',
  imports: [CommonModule, FormsModule, NgVirtualListModule, CustomScrollbarModule],
  templateUrl: './grouped-list-page.component.html',
  styleUrl: './grouped-list-page.component.scss'
})
export class GroupedListPageComponent {
  readonly scrollingSettings: IScrollingSettings = {
    frictionalForce: 0.05,
    mass: 0.005,
    maxDistance: 100000,
    maxDuration: 10000,
    speedScale: 10,
    optimization: false,
  }

  customScrollBarThumbParams = CUSTOM_SCROLLBAR_THEME;

  groupItems = GROUP_ITEMS;
  groupItemsStickyMap = GROUP_ITEMS_ITEM_CONFIG_MAP;

  horizontalGroupItems = HORIZONTAL_GROUP_ITEMS;
  horizontalGroupItemsStickyMap = HORIZONTAL_GROUP_ITEMS_ITEM_CONFIG_MAP;

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
