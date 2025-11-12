import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { slideDownUp } from '../shared/animations';
import { MENU_ITEMS, MenuItem } from './menus';
import { environment } from '../../environments/environment';

@Component({
    selector: 'sidebar',
    templateUrl: './sidebar-dynamic.html',
    animations: [slideDownUp],
})
export class SidebarComponent implements OnInit {
    active = false;
    store: any;
    activeDropdown: string[] = [];
    parentDropdown: string = '';
    menuItems = MENU_ITEMS;
    currentEnvironment: 'local' | 'stage' | 'prod';
    private _filteredMenuItems: MenuItem[] | null = null;
    
    constructor(
        public translate: TranslateService,
        public storeData: Store<any>,
        public router: Router,
    ) {
        this.initStore();
        // Determine current environment
        this.currentEnvironment = environment.production ? 'prod' : 'stage';
        // Initialize filtered menu items once
        this.initFilteredMenuItems();
    }
    async initStore() {
        this.storeData
            .select((d) => d.index)
            .subscribe((d) => {
                this.store = d;
            });
    }

    ngOnInit() {
        this.setActiveDropdown();
    }

    setActiveDropdown() {
        const selector = document.querySelector('.sidebar ul a[routerLink="' + window.location.pathname + '"]');
        if (selector) {
            selector.classList.add('active');
            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link') || [];
                if (ele.length) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele.click();
                    });
                }
            }
        }
    }

    toggleMobileMenu() {
        if (window.innerWidth < 1024) {
            this.storeData.dispatch({ type: 'toggleSidebar' });
        }
    }

    toggleAccordion(name: string, parent?: string) {
        if (this.activeDropdown.includes(name)) {
            this.activeDropdown = this.activeDropdown.filter((d) => d !== name);
        } else {
            this.activeDropdown.push(name);
        }
    }

    // Filter menu items based on environment
    isMenuItemVisible(item: MenuItem): boolean {
        return !item.environment || item.environment.includes(this.currentEnvironment);
    }

    // Initialize filtered menu items once
    private initFilteredMenuItems(): void {
        this._filteredMenuItems = this.filterMenuItems(this.menuItems);
    }

    // Helper method to filter menu items recursively
    private filterMenuItems(items: MenuItem[]): MenuItem[] {
        return items.filter(item => this.isMenuItemVisible(item)).map(item => {
            if (item.children) {
                return {
                    ...item,
                    children: this.filterMenuItems(item.children)
                };
            }
            return item;
        });
    }

    // Get cached filtered menu items
    get filteredMenuItems(): MenuItem[] {
        if (this._filteredMenuItems === null) {
            this.initFilteredMenuItems();
        }
        return this._filteredMenuItems || [];
    }
}
