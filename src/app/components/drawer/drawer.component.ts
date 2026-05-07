import { Component, computed, ElementRef, inject, input, OnDestroy, output, Signal, signal, viewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { StaticClickDirective } from '../../directives';

const DEFAULT_DOCK_SIZE = 140,
  DEFAULT_MAX_DISTANCE = 40;

/**
 * @author Evgenii Alexandrovich Grebennikov
 * @email djonnyx@gmail.com
 * @license Copyright (c) 2026 Evgenii Alexandrovich Grebennikov (djonnyx@gmail.com tg: http://t.me/djonnyx).
 */
export enum DockMode {
  LEFT = 'left',
  RIGHT = 'right',
  NONE = 'none',
}

/**
 * @author Evgenii Alexandrovich Grebennikov
 * @email djonnyx@gmail.com
 * @license Copyright (c) 2026 Evgenii Alexandrovich Grebennikov (djonnyx@gmail.com tg: http://t.me/djonnyx).
 */
export type TDockMode = DockMode.LEFT | DockMode.RIGHT | DockMode.NONE | 'left' | 'right' | 'none';

/**
 * @author Evgenii Alexandrovich Grebennikov
 * @email djonnyx@gmail.com
 * @license Copyright (c) 2026 Evgenii Alexandrovich Grebennikov (djonnyx@gmail.com tg: http://t.me/djonnyx).
 */
@Component({
  selector: 'x-drawer',
  imports: [CommonModule, StaticClickDirective],
  templateUrl: './drawer.component.html',
  styleUrl: './drawer.component.scss',
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class DrawerComponent implements OnDestroy {
  private _elementRef = inject(ElementRef<HTMLDivElement>);

  container = viewChild<ElementRef<HTMLDivElement>>('container');

  dock = input<TDockMode>(DockMode.NONE);

  close = output<void>();

  dockLeftSize = input<number>(DEFAULT_DOCK_SIZE);

  dockLeftCollapsible = input<boolean>(true);

  dockRightSize = input<number>(DEFAULT_DOCK_SIZE);

  styles: Signal<any>;

  protected _bounds = signal<DOMRect | null>(null);

  readonly maxStaticClickDistance = DEFAULT_MAX_DISTANCE;

  private _resizeObserver: ResizeObserver | undefined = undefined;

  private _onResizeHandler = () => {
    this._bounds.set(this._elementRef?.nativeElement?.getBoundingClientRect() ?? null);
  }

  constructor() {
    this.styles = computed(() => {
      const dockLeftCollapsible = this.dockLeftCollapsible(),
        dockMode = this.dock(), dockLeftSize = this.dockLeftSize(),
        width = (this._bounds()?.width ?? 0) - (dockLeftCollapsible ? 0 : dockLeftSize),
        dockRightSize = this.dockRightSize(),
        result = {
          'grid-template-columns': `${dockLeftSize}px ${width}px ${dockRightSize}px`,
          'transform': (dockMode === 'left' || !dockLeftCollapsible ? `translate3d(0, 0, 0)` : dockMode === 'right'
            ? `translate3d(${-(dockLeftSize + dockRightSize)}px, 0, 0)` : `translate3d(${-dockLeftSize}px, 0, 0)`),
        };
      return result;
    });
  }

  ngAfterViewInit(): void {
    const containerEl = this._elementRef;
    if (containerEl) {
      this._resizeObserver = new ResizeObserver(this._onResizeHandler);
      this._resizeObserver.observe(containerEl.nativeElement);

      this._onResizeHandler();

      const container = this.container();
      if (container) {
        container.nativeElement.style.transition = 'transform 100ms ease-in-out 150ms';
      }
    }
  }

  onOverlayClick(e: Event) {
    this.close.emit();
  }

  ngOnDestroy(): void {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = undefined;
    }
  }
}
