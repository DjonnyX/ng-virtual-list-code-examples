import { Component, signal, viewChild } from '@angular/core';
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

const MAX_ITEMS = 1000;

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
  const length = 10 + Math.floor(Math.random() * len), result = [];
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

const GROUP_DYNAMIC_ITEMS_WITH_SNAP: IVirtualListCollection<IGroupCollectionItem> = [],
  GROUP_DYNAMIC_ITEMS_ITEM_CONFIG_MAP_WITH_SNAP: IVirtualListItemConfigMap = {},
  GROUP_DYNAMIC_ITEMS_ITEM_COLLAPSED_IDS: Array<Id> = [];

let groupDynamicIndex = 0;
for (let i = 0, l = MAX_ITEMS; i < l; i++) {
  const id = i + 1, type = i % 2 === 0 ? 'group-header' : 'item',
    isGroup = type === 'group-header',
    sticky = 1;
  if (isGroup) {
    GROUP_DYNAMIC_ITEMS_ITEM_COLLAPSED_IDS.push(id);
    groupDynamicIndex++;
  }
  GROUP_DYNAMIC_ITEMS_WITH_SNAP.push({ id, type, name: isGroup ? `Group ${id}` : `${id}. ${generateText()}` });
  GROUP_DYNAMIC_ITEMS_ITEM_CONFIG_MAP_WITH_SNAP[id] = {
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
  selector: 'accordion-page',
  imports: [CommonModule, FormsModule, NgVirtualListModule, CustomScrollbarModule],
  templateUrl: './accordion-page.component.html',
  styleUrl: './accordion-page.component.scss'
})
export class AccordionPageComponent {

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

  dynamicItems = generateDynamicItems(20, 0);

  groupDynamicItemsWithSnap = GROUP_DYNAMIC_ITEMS_WITH_SNAP;
  groupDynamicItemsStickyMapWithSnap = GROUP_DYNAMIC_ITEMS_ITEM_CONFIG_MAP_WITH_SNAP;

  dynamicShortItemsLength: number = 0;

  motionBlurEnabled = false;

  collapsedIds = signal<Array<Id>>([...GROUP_DYNAMIC_ITEMS_ITEM_COLLAPSED_IDS]);

  collapsedId: Id | null = null;

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

  onCollapseHandler(data: Array<Id> | Id | null) {
    // if (data === null) {
    //   return;
    // }
    // const ids = [data].flat(), result: Array<Id> = [];
    // if (ids !== null) {
    //   const currentIds = this.collapsedIds();
    //   for (let i = 0, l = currentIds.length; i < l; i++) {
    //     const id = currentIds[i];
    //     if (ids.indexOf(id) > -1) {
    //       continue;
    //     }
    //     this.collapsedId = id;
    //     break;
    //   }
    //   for (let i = 0, l = GROUP_DYNAMIC_ITEMS_ITEM_COLLAPSED_IDS.length; i < l; i++) {
    //     const id = GROUP_DYNAMIC_ITEMS_ITEM_COLLAPSED_IDS[i];
    //     if (id !== this.collapsedId) {
    //       result.push(id);
    //     }
    //   }
    // }
    // if (JSON.stringify(this.collapsedIds()) !== JSON.stringify(result)) {
    //   this.collapsedIds.set(result);
    // }
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
