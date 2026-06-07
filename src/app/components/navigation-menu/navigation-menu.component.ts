import { CommonModule } from '@angular/common';
import { Component, computed, effect, ElementRef, inject, input, output, Signal, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { filter, tap } from 'rxjs';
import { NgVirtualListModule, NgVirtualListComponent, Id, IVirtualListCollection, IVirtualListItem, IVirtualListItemConfigMap } from 'ng-virtual-list';
import { ClickOutsideDirective, StaticClickDirective } from '../../directives';
import { ITheme, ThemeService } from '../../theming';
import { XNavItemComponent } from './nav-item/nav-item.component';
import { CustomScrollbarModule } from '../../components/custom-scrollbar/custom-scrollbar.module';
import { CustomScrollBarTheme } from '../../components/custom-scrollbar/interfaces/custom-scrollbar-theme';
import { NavigationEnd, Router } from '@angular/router';

const DEFAULT_MAX_DISTANCE = 40,
  MENU_BUTTON_NAME = 'menu-button',
  SCROLLBAR_PRESET = 'x-scrollbar-secondary';

/**
 * @author Evgenii Alexandrovich Grebennikov
 * @email djonnyx@gmail.com
 * @license Copyright (c) 2026 Evgenii Alexandrovich Grebennikov (djonnyx@gmail.com tg: http://t.me/djonnyx).
 */
@Component({
  selector: 'x-navigation-menu',
  imports: [
    CommonModule, NgVirtualListModule, ClickOutsideDirective, StaticClickDirective, XNavItemComponent,
    CustomScrollbarModule,
  ],
  standalone: true,
  templateUrl: './navigation-menu.component.html',
  styleUrl: './navigation-menu.component.scss'
})
export class XNavigationMenuComponent {
  protected _list = viewChild('list', { read: NgVirtualListComponent });

  scrollStartOffset = input<number>(72);

  select = output<IVirtualListItem>();

  close = output<void>();

  collection = signal<IVirtualListCollection<any>>([
    {
      id: 10,
      name: 'Examples',
      type: 'group',
      route: '/simple-list/',
    },
    {
      id: 11,
      name: 'Simple list',
      type: 'item',
      route: '/simple-list',
    },
    {
      id: 12,
      name: 'Grouped list',
      type: 'item',
      route: '/grouped-list',
    },
    {
      id: 13,
      name: 'Dynamic list',
      type: 'item',
      route: '/dynamic-list',
    },
    {
      id: 14,
      name: 'Accordion',
      type: 'item',
      route: '/accordion',
    },
    {
      id: 15,
      name: 'Split list',
      type: 'item',
      route: '/split-list',
    },
    {
      id: 16,
      name: 'Swipe list',
      type: 'item',
      route: '/swipe-list',
    },
    {
      id: 17,
      name: 'Carousel list',
      type: 'item',
      route: '/carousel-list',
    },
    {
      id: 18,
      name: 'Infinite list',
      type: 'item',
      route: '/infinite-list',
    },
    {
      id: 46,
      name: 'Color Picker Demo',
      type: 'item',
      route: '/color-picker-demo',
    },
    {
      id: 47,
      name: 'Time Picker Demo',
      type: 'item',
      route: '/time-picker-demo',
    },
    {
      id: 48,
      name: 'Desktop Demo',
      type: 'item',
      route: '/desktop-demo',
    },
    {
      id: 100,
      name: 'Contacts',
      type: 'group',
      route: '/contacts',
    },
  ]);

  itemConfigMap = signal<IVirtualListItemConfigMap>({
    [1]: {
      selectable: true,
    },
    [2]: {
      selectable: true,
    },
    [3]: {
      selectable: true,
    },
    [4]: {
      selectable: true,
    },
    [10]: {
      sticky: 1,
      selectable: false,
      collapsable: false,
    },
    [11]: {
      selectable: true,
    },
    [12]: {
      selectable: true,
    },
    [13]: {
      selectable: true,
    },
    [14]: {
      selectable: true,
    },
    [15]: {
      selectable: true,
    },
    [16]: {
      selectable: true,
    },
    [17]: {
      selectable: true,
    },
    [18]: {
      selectable: true,
    },
    [40]: {
      sticky: 1,
      selectable: false,
      collapsable: false,
    },
    [46]: {
      selectable: true,
    },
    [47]: {
      selectable: true,
    },
    [48]: {
      selectable: true,
    },
    [49]: {
      selectable: true,
    },
    [50]: {
      selectable: true,
    },
    [51]: {
      selectable: true,
    },
    [52]: {
      selectable: true,
    },
    [53]: {
      selectable: true,
    },
    [100]: {
      sticky: 1,
      selectable: true,
      collapsable: false,
    },
  });

  selectedId = signal<Id | null>(null);

  readonly maxStaticClickDistance = DEFAULT_MAX_DISTANCE;

  focused = signal<boolean>(false);

  scrollbarTheme: Signal<CustomScrollBarTheme>;

  theme: Signal<ITheme | undefined>;

  private _themeService = inject(ThemeService);

  private _router = inject(Router);

  private _elementRef = inject(ElementRef);

  constructor() {
    this.theme = toSignal(this._themeService.$theme);

    this._router.events.pipe(
      takeUntilDestroyed(),
      filter(e => e instanceof NavigationEnd),
      tap(e => {
        this.selectedId.set(this.collection().find(v => v.route === e.url)?.id || null);
      }),
    ).subscribe();

    this.scrollbarTheme = computed(() => {
      const theme = this.theme();
      if (theme) {
        const preset = this._themeService.getPreset(SCROLLBAR_PRESET);
        if (preset) {
          return preset;
        }
      }
      return undefined;
    });

    effect(() => {
      const theme = this.theme();
      if (theme) {
        const preset = this._themeService.getPreset(theme.app.main.navItem);
        if (preset) {
          const host = this._elementRef?.nativeElement;
          if (host) {
            host.style.backgroundColor = preset.background;
          }
        }
      }
    });
  }

  onItemClickHandler(item: IVirtualListItem<any>) {
    if (!!item) {
      this.select.emit(item);
    }
    this.close.emit();
  }

  onClickOutside(e: Event) {
    if ((e.target as HTMLElement).getAttribute('name') === MENU_BUTTON_NAME) {
      return;
    }
    this.close.emit();
  }

  onClickHandler(e: Event) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
}
