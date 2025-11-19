import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ticket } from '../../models/ticket.interface';
import { TicketDisplayUtil } from '../../utils/ticket-display.util';

@Component({
  selector: 'app-adaptive-form-display',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngIf="ticket && formDisplay" class="min-vh-100 bg-white dark:bg-black p-6">
      <div class="container mx-auto max-w-7xl">
        <!-- Form Fields Section -->
        <div *ngIf="formDisplay.fields.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div *ngFor="let field of formDisplay.fields; trackBy: trackByField">
            <label class="block text-sm font-medium text-black dark:text-white mb-2">
              {{ field.label }}
            </label>
            <div class="bg-white-light dark:bg-dark border border-white-light dark:border-dark rounded-lg px-4 py-3 min-h-[42px] text-black dark:text-white">
              <!-- Date Display -->
              <span *ngIf="field.displayType === 'date'">
                {{ formatDisplayValue(field.value, field.type) }}
              </span>
              
              <!-- Currency Display -->
              <span *ngIf="field.displayType === 'currency'">
                {{ formatDisplayValue(field.value, field.type) }}
              </span>
              
              <!-- Badge Display -->
              <span *ngIf="field.displayType === 'badge'" 
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                    [ngClass]="getBadgeClass(field.value)">
                {{ field.value | titlecase }}
              </span>
              
              <!-- Regular Field Display -->
              <span *ngIf="field.displayType === 'field'">
                {{ field.value || '—' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Tables Section -->
        <div *ngFor="let table of formDisplay.tables; trackBy: trackByTable" class="mb-8">
          <h2 class="text-xl font-semibold mb-4 text-black dark:text-white">{{ table.title }}</h2>
          <div class="bg-white dark:bg-dark border border-white-light dark:border-dark rounded-lg overflow-hidden shadow-sm">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-white-light dark:bg-black border-b border-white-light dark:border-dark">
                  <tr>
                    <th *ngFor="let column of table.columns; trackBy: trackByColumn" 
                        class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-dark dark:text-white-dark"
                        [class.text-right]="column.align === 'right'"
                        [class.text-center]="column.align === 'center'">
                      {{ column.label }}
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white-light dark:divide-dark">
                  <tr *ngFor="let row of table.data; let i = index; trackBy: trackByRow" 
                      class="hover:bg-white-light dark:hover:bg-black transition-colors duration-150">
                    <td *ngFor="let column of table.columns; trackBy: trackByColumn" 
                        class="px-6 py-4 text-sm text-black dark:text-white"
                        [class.text-right]="column.align === 'right'"
                        [class.text-center]="column.align === 'center'">
                    <span *ngIf="column.type === 'currency' && column.align === 'right'">
                      PHP {{ formatCurrencyAmount(row[column.key]) }}
                    </span>
                    <span *ngIf="column.type !== 'currency' || column.align !== 'right'">
                      {{ formatCellValue(row[column.key], column.type) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

        <!-- Summary Section -->
        <div *ngIf="formDisplay.summary.length > 0" class="flex justify-end mb-8">
          <div class="w-full max-w-md bg-white dark:bg-dark border border-white-light dark:border-dark rounded-lg p-6 shadow-sm">
            <div *ngFor="let summaryItem of formDisplay.summary; let last = last; trackBy: trackBySummary"
                 class="flex justify-between items-center py-3"
                 [class.border-b]="!last"
                 [class.border-white-light]="!last"
                 [class.dark:border-dark]="!last">
              <span class="text-sm font-medium text-dark dark:text-white-dark">{{ summaryItem.label }}</span>
              <span class="text-sm font-semibold"
                    [ngClass]="{
                      'text-success': summaryItem.type === 'balance' && isPositive(summaryItem.value),
                      'text-danger': summaryItem.type === 'balance' && isNegative(summaryItem.value) && summaryItem.label.toLowerCase().includes('balance'),
                      'text-black dark:text-white': !(summaryItem.type === 'balance' && (isPositive(summaryItem.value) || (isNegative(summaryItem.value) && summaryItem.label.toLowerCase().includes('balance'))))
                    }">
                PHP {{ formatNumberValue(summaryItem.value) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Actions Section - Removed as per user request -->
        <!-- Form actions are handled by parent approval component -->

        <!-- Debug Info (Development Only) -->
        <div *ngIf="showDebugInfo" class="mt-8 p-6 bg-white-light dark:bg-dark border border-white-light dark:border-dark rounded-lg">
          <h6 class="text-lg font-semibold text-black dark:text-white mb-4">Debug Information</h6>
          <pre class="text-sm text-dark dark:text-white-dark bg-white dark:bg-black p-4 rounded border overflow-x-auto">{{ getDebugInfo() | json }}</pre>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .badge {
      font-size: 0.75rem;
    }
    
    /* Custom scrollbar for tables */
    .overflow-x-auto::-webkit-scrollbar {
      height: 8px;
    }
    
    .overflow-x-auto::-webkit-scrollbar-track {
      background: #f1f1f1;
    }
    
    .overflow-x-auto::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 4px;
    }
    
    .overflow-x-auto::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }
    
    /* Dark mode scrollbar */
    @media (prefers-color-scheme: dark) {
      .overflow-x-auto::-webkit-scrollbar-track {
        background: #3b3f5c;
      }
      
      .overflow-x-auto::-webkit-scrollbar-thumb {
        background: #888ea8;
      }
      
      .overflow-x-auto::-webkit-scrollbar-thumb:hover {
        background: #a0a6b8;
      }
    }
    
    .currency-positive {
      color: #00ab55;
    }
    
    .currency-negative {
      color: #e7515a;
    }
    
    /* Ensure proper spacing for grid layout */
    .grid {
      display: grid;
    }
    
    /* Container max width */
    .max-w-7xl {
      max-width: 80rem;
    }
  `]
})
export class AdaptiveFormDisplayComponent {
  @Input() ticket: Ticket | null = null;
  @Input() showDebugInfo: boolean = false;

  formDisplay: any = null;

  ngOnInit() {
    this.updateFormDisplay();
  }

  ngOnChanges() {
    this.updateFormDisplay();
  }

  private updateFormDisplay() {
    if (this.ticket) {
      this.formDisplay = TicketDisplayUtil.getAdaptiveFormDisplay(this.ticket);
    }
  }

  // TrackBy functions for performance
  trackByField(index: number, field: any): string {
    return field.label;
  }

  trackByTable(index: number, table: any): string {
    return table.title;
  }

  trackByColumn(index: number, column: any): string {
    return column.key;
  }

  trackByRow(index: number, row: any): number {
    return index;
  }

  trackBySummary(index: number, summary: any): string {
    return summary.label;
  }

  // Formatting functions
  formatDisplayValue(value: any, type: string): string {
    return TicketDisplayUtil.formatCellValue(value, type);
  }

  formatCellValue(value: any, type?: string): string {
    return TicketDisplayUtil.formatCellValue(value, type);
  }

  // Style functions
  getBadgeClass(value: string): string {
    const val = value?.toLowerCase() || '';
    if (['urgent', 'high', 'critical'].includes(val)) return 'bg-danger text-white';
    if (['medium', 'normal'].includes(val)) return 'bg-warning text-black';
    if (['low', 'minor'].includes(val)) return 'bg-success text-white';
    if (['approved', 'active', 'completed'].includes(val)) return 'bg-success text-white';
    if (['pending', 'review'].includes(val)) return 'bg-warning text-black';
    if (['rejected', 'cancelled'].includes(val)) return 'bg-danger text-white';
    return 'bg-primary text-white';
  }

  getCellClass(value: any, type?: string): string {
    if (type === 'currency') {
      return this.isPositive(value) ? 'currency-positive' : 'currency-negative';
    }
    return '';
  }

  isPositive(value: any): boolean {
    const numValue = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
    return !isNaN(numValue) && numValue > 0;
  }

  isNegative(value: any): boolean {
    const numValue = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
    return !isNaN(numValue) && numValue < 0;
  }

  formatNumberValue(value: any): string {
    const numValue = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
    if (isNaN(numValue)) return '0.00';
    return numValue.toLocaleString('en-PH', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  }

  formatCurrencyAmount(value: any): string {
    const numValue = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
    if (isNaN(numValue)) return '0.00';
    return numValue.toLocaleString('en-PH', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  }

  // Actions - Removed as per user request
  // Form actions are handled by parent approval component

  // Debug
  getDebugInfo(): any {
    if (!this.ticket) return {};
    
    const structure = (TicketDisplayUtil as any).processCustomFormData(this.ticket.customFormData);
    return {
      ticketId: this.ticket.id,
      formStructure: structure,
      formData: this.ticket.customFormData?.formData,
      generatedDisplay: this.formDisplay
    };
  }
}