import { Injectable } from '@angular/core';

export interface IconDefinition {
  name: string;
  component: any;
  defaultClass?: string;
}

@Injectable({
  providedIn: 'root'
})
export class IconRegistryService {
  private iconRegistry = new Map<string, IconDefinition>();

  constructor() {
    // Auto-register common icons
    this.initializeDefaultIcons();
  }

  private initializeDefaultIcons() {
    // You can programmatically register icons here if needed
    // This is useful for dynamic icon loading or lazy loading
  }

  registerIcon(iconDef: IconDefinition) {
    this.iconRegistry.set(iconDef.name, iconDef);
  }

  getIcon(name: string): IconDefinition | undefined {
    return this.iconRegistry.get(name);
  }

  getAllIcons(): IconDefinition[] {
    return Array.from(this.iconRegistry.values());
  }

  isIconRegistered(name: string): boolean {
    return this.iconRegistry.has(name);
  }
}