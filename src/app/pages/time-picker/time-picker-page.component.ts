import { Component, DestroyRef, ElementRef, inject, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, delay, filter, Subject, switchMap, tap } from 'rxjs';
import {
  NgVirtualListModule, NgVirtualListComponent, IVirtualListCollection, Id, IScrollingSettings,
  ItemTransformations, VirtualClickModule,
} from 'ng-virtual-list';
import { CustomScrollbarModule } from '../../components/custom-scrollbar/custom-scrollbar.module';

interface ICollectionItem {
  id: Id;
  name: string;
}

const HOURS_ITEMS: IVirtualListCollection<ICollectionItem> = [];
for (let i = 0, l = 24; i < l; i++) {
  HOURS_ITEMS.push({ id: i, name: `${i}` });
}

const MINUTES_ITEMS: IVirtualListCollection<ICollectionItem> = [];
for (let i = 0, l = 60; i < l; i++) {
  MINUTES_ITEMS.push({ id: i, name: `${i}` });
}

@Component({
  selector: 'time-picker-page',
  imports: [CommonModule, FormsModule, NgVirtualListModule, CustomScrollbarModule, VirtualClickModule],
  templateUrl: './time-picker-page.component.html',
  styleUrl: './time-picker-page.component.scss'
})
export class TimePickerPageComponent {
  protected _audioSnapRef = viewChild<ElementRef<HTMLAudioElement>>('audioSnap');

  listHours = viewChild('listHours', { read: NgVirtualListComponent });

  listMinutes = viewChild('listMinutes', { read: NgVirtualListComponent });

  scrollingSettings: IScrollingSettings = {
    frictionalForce: 0.1,
    mass: 0.01,
    maxDistance: 1000,
    maxDuration: 2000,
    speedScale: 5,
    optimization: false,
  };

  hoursItems = HOURS_ITEMS;

  minutesItems = MINUTES_ITEMS;

  listHoursSelectedIds: Id | null = HOURS_ITEMS[(new Date()).getHours()].id;

  listMinutesSelectedIds: Id | null = MINUTES_ITEMS[(new Date()).getMinutes()].id;

  dateTime: Date = this.formatDateTime();

  time3D = ItemTransformations.DECK_OF_CARDS_3D({ dof: 0, fogColor: '#504963', fogWeight: 1.5, spacingBetweenItems: 0.8, scaleY: 0.05, depthPow: 8 });

  private _$snapItemHours = new Subject<Id>();
  readonly $snapItemHours = this._$snapItemHours.asObservable();

  private _$snapItemMinutes = new Subject<Id>();
  readonly $snapItemMinutes = this._$snapItemMinutes.asObservable();

  private _destroyRef = inject(DestroyRef);

  constructor() {
    const $listHours = toObservable(this.listHours);
    $listHours.pipe(
      takeUntilDestroyed(),
      filter(v => !!v),
      switchMap(list => {
        return list.$initialized.pipe(
          takeUntilDestroyed(this._destroyRef),
          tap(() => {
            if (this.listHoursSelectedIds !== null) {
              list.scrollTo(this.listHoursSelectedIds, null, { focused: false });
            }
          }),
        )
      })
    ).subscribe();

    const $listMinutes = toObservable(this.listMinutes);
    $listMinutes.pipe(
      takeUntilDestroyed(),
      filter(v => !!v),
      switchMap(list => {
        return list.$initialized.pipe(
          takeUntilDestroyed(this._destroyRef),
          tap(() => {
            if (this.listMinutesSelectedIds !== null) {
              list.scrollTo(this.listMinutesSelectedIds, null, { focused: false });
            }
          }),
        )
      })
    ).subscribe();

    this.$snapItemHours.pipe(
      takeUntilDestroyed(),
      debounceTime(50),
      tap(id => {
        this.listHoursSelectedIds = id;
        this.dateTime = this.formatDateTime();
        this.playSound();
      }),
    ).subscribe();

    this.$snapItemMinutes.pipe(
      takeUntilDestroyed(),
      debounceTime(50),
      tap(id => {
        this.listMinutesSelectedIds = id;
        this.dateTime = this.formatDateTime();
        this.playSound();
      }),
    ).subscribe();
  }

  private formatDateTime() {
    const h = this.hoursItems.find(({ id }) => id === this.listHoursSelectedIds),
      hours = !!h ? Number(h.name) : 0,
      m = this.minutesItems.find(({ id }) => id === this.listMinutesSelectedIds),
      minutes = !!m ? Number(m.name) : 0;
    const date = new Date(0, 0, 0, hours, minutes);
    return date;
  }

  onSnapItemHoursHandler(id: Id | null) {
    if (id !== null) {
      this._$snapItemHours.next(id);
    }
  }

  onSnapItemMinutesHandler(id: Id | null) {
    if (id !== null) {
      this._$snapItemMinutes.next(id);
    }
  }

  onClickHoursHandler(id: Id | null) {
    if (id !== null) {
      this.listHours()?.scrollTo(id, null, { delay: 100 });
    }
  }

  onClickMinutesHandler(id: Id | null) {
    if (id !== null) {
      this.listMinutes()?.scrollTo(id, null, { delay: 100 });
    }
  }

  private playSound() {
    const el = this._audioSnapRef()?.nativeElement;
    if (!!el) {
      el.currentTime = 0;
      el.play();
    }
  }
}
