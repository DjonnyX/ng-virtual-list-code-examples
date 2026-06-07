import { Id } from 'ng-virtual-list';

export interface INavItem {
    id: Id;
    type: 'group' | 'item';
    name: string;
    route: string;
}