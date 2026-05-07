import { Routes } from '@angular/router';

export const routes: Routes = [
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
        path: 'accordion', loadComponent: () => import('./pages/accordion/accordion-page.component').then(m => m.AccordionPageComponent),
        title: 'Dynamic list',
    },
    {
        path: 'split-list', loadComponent: () => import('./pages/split-list/split-list-page.component').then(m => m.SplitListPageComponent),
        title: 'Split list',
    },
    {
        path: 'swipe-list', loadComponent: () => import('./pages/swipe-list/swipe-list-page.component').then(m => m.SwipeListPageComponent),
        title: 'Swipe list',
    },
    {
        path: 'carousel-list', loadComponent: () => import('./pages/carousel-list/carousel-list.component').then(m => m.CarouselListPageComponent),
        title: 'Carousel list',
    },
    {
        path: 'contacts', loadComponent: () => import('./pages/contacts/contacts-page.component').then(m => m.ContactsPageComponent),
        title: 'Contacts',
    },
];
