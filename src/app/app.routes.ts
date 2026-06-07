import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'simple-list', pathMatch: 'full' },
    {
        path: 'simple-list', loadComponent: () => import('./pages/simple-list/simple-list-page.component').then(m => m.SimpleListPageComponent),
        title: 'Simple list',
    },
    {
        path: 'grouped-list', loadComponent: () => import('./pages/grouped-list/grouped-list-page.component').then(m => m.GroupedListPageComponent),
        title: 'Grouped list',
    },
    {
        path: 'dynamic-list', loadComponent: () => import('./pages/dynamic-list/dynamic-list-page.component').then(m => m.DynamicListPageComponent),
        title: 'Dynamic list',
    },
    {
        path: 'infinite-list', loadComponent: () => import('./pages/infinite-list/infinite-list-page.component').then(m => m.InfiniteListPageComponent),
        title: 'Infinite list',
    },
    {
        path: 'accordion', loadComponent: () => import('./pages/accordion/accordion-page.component').then(m => m.AccordionPageComponent),
        title: 'Dynamic list',
    },
    {
        path: 'split-list', loadComponent: () => import('./pages/split-list/split-list-page.component').then(m => m.SplitListPageComponent),
        title: 'Split list',
    },
    {
        path: 'carousel-list', loadComponent: () => import('./pages/carousel-list/carousel-list.component').then(m => m.CarouselListPageComponent),
        title: 'Carousel list',
    },
    {
        path: 'time-picker-demo', loadComponent: () => import('./pages/time-picker/time-picker-page.component').then(m => m.TimePickerPageComponent),
        title: 'Time Picker Demo',
    },
    {
        path: 'color-picker-demo', loadComponent: () => import('./pages/color-picker/color-picker-page.component').then(m => m.ColorPickerPageComponent),
        title: 'Color Picker Demo',
    },
    {
        path: 'desktop-demo', loadComponent: () => import('./pages/desktop-demo/desktop-demo-page.component').then(m => m.DesktopDemoPageComponent),
        title: 'Desktop Demo',
    },
    {
        path: 'contacts', loadComponent: () => import('./pages/contacts/contacts-page.component').then(m => m.ContactsPageComponent),
        title: 'Contacts',
    },
];
