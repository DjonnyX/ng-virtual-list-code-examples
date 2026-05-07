import { Id } from "../../../../../projects/ng-virtual-list/src/public-api";

export interface INavItem {
    id: Id;
    type: 'group' | 'item';
    name: string;
    route: string;
}