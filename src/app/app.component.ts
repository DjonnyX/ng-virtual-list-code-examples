import { CommonModule } from '@angular/common';
import {
  Component, computed, CUSTOM_ELEMENTS_SCHEMA, DestroyRef, effect, ElementRef, inject, OnDestroy, Signal,
  signal, viewChild, ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { BehaviorSubject, filter, fromEvent, map, tap, } from 'rxjs';
import { MenuButtonComponent } from './components/header';
import { ISize, IVirtualListItemConfigMap, NgVirtualListComponent, NgVirtualListModule } from 'ng-virtual-list';
import { DrawerComponent, DockMode } from "./components/drawer/drawer.component";
import { ClickOutsideService } from './directives';
import { IMediaParams, MediaService } from './directives/media';
import { ThemeNames, ThemeService } from './theming';
import { XNavigationMenuComponent } from './components/navigation-menu/navigation-menu.component';
import { LOGO } from './const';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { GradientColor, RoundedCorner } from './types';
import { CustomScrollBarTheme } from './components/custom-scrollbar/interfaces/custom-scrollbar-theme';

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

const DEFAULT_MENU_SIZE = 320,
  COLLAPSIBLE_MENU_SIZES = ['xxs', 'xs', 's', 'sm', 'm', 'xm', 'xxm', 'l', 'xl'],
  MOBILE_SIZES = ['xxs', 'xs', 's', 'sm', 'm'],
  MENU_SIZES: IMediaParams = {
    'xxs': 'col-12',
    'xs': 'col-12',
    's': 'col-12',
    'sm': 'col-12',
    'm': 'col-12',
    'xm': 'col-12',
    'xxm': DEFAULT_MENU_SIZE,
    'l': DEFAULT_MENU_SIZE,
    'xl': DEFAULT_MENU_SIZE,
    'xxl': DEFAULT_MENU_SIZE,
    undefined: DEFAULT_MENU_SIZE,
  };

/**
 * @author Evgenii Alexandrovich Grebennikov
 * @email djonnyx@gmail.com
 * @license Copyright (c) 2026 Evgenii Alexandrovich Grebennikov (djonnyx@gmail.com tg: http://t.me/djonnyx).
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MenuButtonComponent, DrawerComponent, NgVirtualListModule, XNavigationMenuComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    ClickOutsideService,
  ],
  encapsulation: ViewEncapsulation.Emulated,
})
export class AppComponent implements OnDestroy {
  protected _toolbar = viewChild<ElementRef<HTMLDivElement>>('toolbar');

  protected _messageCreator = viewChild<ElementRef<HTMLDivElement>>('messageCreator');

  protected _header = viewChild<ElementRef<HTMLDivElement>>('header');

  protected _list = viewChild('list', { read: NgVirtualListComponent });

  readonly logo = LOGO;

  private _$version = new BehaviorSubject<number>(0);
  readonly $version = this._$version.asObservable();

  isCreating = signal<boolean>(false);

  menuOpened = signal<boolean>(false);

  menuSize = signal<number>(DEFAULT_MENU_SIZE);

  dockMode: Signal<DockMode.LEFT | DockMode.NONE>;

  dockLeftCollapsible = signal<boolean>(true);

  show = signal(true);

  private _mediaService = inject(MediaService);

  private _toolbarResizeObserver: ResizeObserver;

  private _themeService = inject(ThemeService);

  private _elementRef = inject(ElementRef);

  motionBlurEnabled = signal<boolean>(true);

  customScrollBarThumbParams = CUSTOM_SCROLLBAR_THEME;

  items = [
    {
      id: 1,
      type: 'logo',
    },
    {
      id: 2,
      type: 'content',
    },
    {
      id: 3,
      type: 'footer',
    },
  ];

  itemConfigMap: IVirtualListItemConfigMap = {
    1: { selectable: false, collapsable: false, sticky: 0 },
    2: { selectable: false, collapsable: false, sticky: 0 },
    3: { selectable: false, collapsable: false, sticky: 2 },
  };

  toolbarBounds = signal<ISize>({
    width: this._toolbar()?.nativeElement?.offsetWidth || 0,
    height: this._toolbar()?.nativeElement?.offsetHeight || 0,
  });

  private _onToolbarResizeHandler = () => {
    const el = this._toolbar()?.nativeElement as HTMLDivElement;
    if (el && el.offsetWidth && el.offsetHeight) {
      this.toolbarBounds.set({ width: el.offsetWidth || 0, height: el.offsetHeight || 0 });
    }
  }

  private _destroyRef = inject(DestroyRef);

  protected title = inject(Title);

  protected isMobile = signal<boolean>(true);

  private _router = inject(Router);

  constructor() {
    this._toolbarResizeObserver = new ResizeObserver(this._onToolbarResizeHandler);

    const bp: Promise<EventTarget & { level: number, charging: boolean; }> | null = (navigator as any).getBattery?.() ?? null;
    if (!!bp) {
      bp.then(battery => {
        battery.addEventListener('levelchange', () => {
          this.motionBlurEnabled.set(battery.level >= 0.10 || battery.charging);
        });
        this.motionBlurEnabled.set(battery.level >= 0.10 || battery.charging);
      });
    }

    this._router.events.pipe(
      takeUntilDestroyed(),
      filter(e => e instanceof NavigationEnd),
      tap(() => {
        this._list()?.scrollToStart();
      }),
    ).subscribe();

    this._mediaService.$changes.pipe(
      takeUntilDestroyed(),
      tap(({ size }) => {
        const val = this._mediaService.getMediaSize(MENU_SIZES) as number,
          isMobile = MOBILE_SIZES.includes(size as string);
        this.isMobile.set(isMobile);
        this.menuSize.set(val !== undefined ? val : DEFAULT_MENU_SIZE);
        this.dockLeftCollapsible.set(size !== undefined && COLLAPSIBLE_MENU_SIZES.includes(size));
      }),
    ).subscribe();

    const $toolbar = toObservable(this._toolbar).pipe(
      takeUntilDestroyed(),
      filter(v => !!v),
      map(v => v.nativeElement),
    );

    $toolbar.pipe(
      takeUntilDestroyed(),
      tap(toolbar => {
        this._toolbarResizeObserver.observe(toolbar);
      }),
    ).subscribe();

    effect(() => {
      const dockLeftCollapsible = this.dockLeftCollapsible();
      if (dockLeftCollapsible) {
        this.menuOpened.set(false);
      }
    });

    this.dockMode = computed(() => {
      const menuOpened = this.menuOpened();
      return menuOpened ? DockMode.LEFT : DockMode.NONE;
    });

    const appResizeHandler = (bounds: ISize) => document.body.style.height = `${bounds.height}px`,
      winResizeHandler = () => appResizeHandler({ width: window.innerWidth, height: window.innerHeight });

    this._mediaService.$bounds.pipe(
      takeUntilDestroyed(),
      tap(bounds => {
        appResizeHandler(bounds);
      }),
    ).subscribe();

    window.addEventListener('resize', winResizeHandler);
    window.addEventListener('scroll', winResizeHandler);

    this._themeService.name = ThemeNames[0];

    const el = this._elementRef.nativeElement;
    fromEvent<KeyboardEvent>(el, 'keydown', { passive: false, capture: false }).pipe(
      takeUntilDestroyed(),
      tap(e => {
        if (e.ctrlKey && e.code == 'KeyA') {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      })
    ).subscribe();
  }

  onDockClose() {
    this.menuOpened.set(false);
  }

  onGroupsCloseHandler() {
    this.menuOpened.set(false);
  }

  onOpenMenuHandler(e: Event) {
    e.stopImmediatePropagation();

    this.menuOpened.update(v => !v);
  }

  ngOnDestroy(): void {
    if (this._toolbarResizeObserver) {
      this._toolbarResizeObserver.disconnect();
    }
  }
}
