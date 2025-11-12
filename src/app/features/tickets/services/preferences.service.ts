import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UserPreferences {
  skipApprovalConfirmation: boolean;
  skipRejectionConfirmation: boolean;
  theme: 'light' | 'dark' | 'auto';
  autoRefresh: boolean;
  autoRefreshInterval: number; // in seconds
}

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {
  private readonly STORAGE_KEY = 'ticket_user_preferences';
  
  private defaultPreferences: UserPreferences = {
    skipApprovalConfirmation: false,
    skipRejectionConfirmation: false,
    theme: 'light',
    autoRefresh: false,
    autoRefreshInterval: 30
  };

  private preferencesSubject = new BehaviorSubject<UserPreferences>(
    this.loadPreferences()
  );

  public preferences$: Observable<UserPreferences> = 
    this.preferencesSubject.asObservable();

  constructor() {
    // Load preferences on service initialization
    this.preferencesSubject.next(this.loadPreferences());
  }

  private loadPreferences(): UserPreferences {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to handle new preference keys
        return { ...this.defaultPreferences, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load user preferences:', error);
    }
    return { ...this.defaultPreferences };
  }

  private savePreferences(preferences: UserPreferences): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(preferences));
      this.preferencesSubject.next(preferences);
    } catch (error) {
      console.error('Failed to save user preferences:', error);
    }
  }

  getCurrentPreferences(): UserPreferences {
    return this.preferencesSubject.value;
  }

  updatePreferences(updates: Partial<UserPreferences>): void {
    const currentPrefs = this.getCurrentPreferences();
    const newPrefs = { ...currentPrefs, ...updates };
    this.savePreferences(newPrefs);
  }

  // Specific getters for commonly used preferences
  shouldSkipApprovalConfirmation(): boolean {
    return this.getCurrentPreferences().skipApprovalConfirmation;
  }

  shouldSkipRejectionConfirmation(): boolean {
    return this.getCurrentPreferences().skipRejectionConfirmation;
  }

  // Specific setters for commonly used preferences
  setSkipApprovalConfirmation(skip: boolean): void {
    this.updatePreferences({ skipApprovalConfirmation: skip });
  }

  setSkipRejectionConfirmation(skip: boolean): void {
    this.updatePreferences({ skipRejectionConfirmation: skip });
  }

  // Reset to defaults
  resetToDefaults(): void {
    this.savePreferences({ ...this.defaultPreferences });
  }

  // Export/Import preferences (for backup/restore)
  exportPreferences(): string {
    return JSON.stringify(this.getCurrentPreferences(), null, 2);
  }

  importPreferences(preferencesJson: string): boolean {
    try {
      const preferences = JSON.parse(preferencesJson);
      // Validate that it has the expected structure
      if (typeof preferences.skipApprovalConfirmation === 'boolean') {
        this.savePreferences({ ...this.defaultPreferences, ...preferences });
        return true;
      }
    } catch (error) {
      console.error('Failed to import preferences:', error);
    }
    return false;
  }
}