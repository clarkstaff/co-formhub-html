import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ticket } from '../../models/ticket.interface';
import { TicketDisplayUtil } from '../../utils/ticket-display.util';

@Component({
  selector: 'app-form-data-table',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
        <div *ngIf="ticket && hasArrayData()" class="mt-4">
      <div *ngFor="let arrayData of getArrayData()" class="mb-6">
        <h6 class="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
          {{ arrayData.label }}
        </h6>
        
        <div class="table-responsive">
          <table class="table-hover">
            <thead>
              <tr class="bg-gray-100 dark:bg-gray-800">
                <th *ngFor="let column of arrayData.columns" 
                    [class]="getHeaderClass(column.type)"
                    class="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                  {{ column.label }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of arrayData.data; let i = index; trackBy: trackByIndex" 
                  [class]="i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'"
                  class="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <td *ngFor="let column of arrayData.columns; trackBy: trackByColumn" 
                    [class]="getCellClass(column.type)"
                    class="px-4 py-3 text-sm border-b border-gray-200 dark:border-gray-600">
                  <span [class]="getValueClass(item[column.key], column.type)">
                    {{ formatCellValue(item[column.key], column.type) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Summary row for currency columns -->
        <div *ngIf="hasSummaryColumns(arrayData.columns)" 
             class="mt-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-b-lg">
          <div class="flex justify-end space-x-6 text-sm font-medium">
            <div *ngFor="let column of arrayData.columns">
              <span *ngIf="shouldShowColumnTotal(column)" class="text-gray-700 dark:text-gray-300">
                Total {{ column.label }}: 
                <span class="text-gray-900 dark:text-white font-semibold">
                  {{ calculateColumnSum(arrayData.data, column.key) }}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No table data message -->
    <div *ngIf="ticket && !hasArrayData()" class="mt-4 text-center py-6 text-gray-500 dark:text-gray-400">
      <i class="fa fa-table text-2xl mb-2 opacity-50"></i>
      <p class="text-sm">No tabular data available for this form</p>
    </div>
  `,
  styles: [`
    .table-responsive {
      @apply shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden;
    }
    
    .table-hover tbody tr:hover {
      @apply bg-blue-50 dark:bg-blue-900/20;
    }
    
    .currency-cell {
      @apply text-gray-900 dark:text-white font-medium;
    }
    
    .date-cell {
      @apply text-gray-700 dark:text-gray-300;
    }
    
    .number-cell {
      @apply text-blue-600 dark:text-blue-400;
    }
    
    .boolean-true {
      @apply text-green-600 dark:text-green-400;
    }
    
    .boolean-false {
      @apply text-red-600 dark:text-red-400;
    }
    
    .email-cell {
      @apply text-blue-600 dark:text-blue-400 hover:underline cursor-pointer;
    }
    
    .url-cell {
      @apply text-blue-600 dark:text-blue-400 hover:underline cursor-pointer;
    }
  `]
})
export class FormDataTableComponent {
  @Input() ticket: Ticket | null = null;

  // TrackBy functions for performance optimization
  trackByIndex(index: number, item: any): number {
    return index;
  }

  trackByColumn(index: number, column: { key: string; label: string; type?: string }): string {
    return column.key;
  }

  hasArrayData(): boolean {
    return this.getArrayData().length > 0;
  }

  getArrayData() {
    if (!this.ticket) return [];
    return TicketDisplayUtil.getFormDataArrays(this.ticket);
  }

  getHeaderClass(type?: string): string {
    switch (type) {
      case 'currency':
      case 'number':
        return 'text-right';
      case 'date':
        return 'text-center';
      default:
        return 'text-left';
    }
  }

  getCellClass(type?: string): string {
    switch (type) {
      case 'currency':
      case 'number':
        return 'text-right';
      case 'date':
        return 'text-center whitespace-nowrap';
      default:
        return 'text-left';
    }
  }

  getValueClass(value: any, type?: string): string {
    const classes: string[] = [];
    
    switch (type) {
      case 'currency':
        classes.push('currency-cell');
        break;
      case 'date':
        classes.push('date-cell');
        break;
      case 'number':
        classes.push('number-cell');
        break;
      case 'boolean':
        classes.push(value ? 'boolean-true' : 'boolean-false');
        break;
      case 'email':
        classes.push('email-cell');
        break;
      case 'url':
        classes.push('url-cell');
        break;
    }
    
    return classes.join(' ');
  }

  formatCellValue(value: any, type?: string): string {
    return TicketDisplayUtil.formatCellValue(value, type);
  }

  hasSummaryColumns(columns: Array<{ key: string; label: string; type?: string }>): boolean {
    return columns.some(col => this.shouldShowColumnTotal(col));
  }

  shouldShowColumnTotal(column: { key: string; label: string; type?: string }): boolean {
    // Only show totals for currency fields
    if (column.type !== 'currency') {
      return false;
    }

    // Use the optimized excluded fields check from TicketDisplayUtil
    const fieldName = column.key.toLowerCase();
    const fieldLabel = column.label.toLowerCase();

    return !TicketDisplayUtil['EXCLUDED_TOTAL_FIELDS'].some((excluded: string) => 
      fieldName.includes(excluded.toLowerCase()) || 
      fieldLabel.includes(excluded.toLowerCase())
    );
  }

  hasCurrencyColumns(columns: Array<{ key: string; label: string; type?: string }>): boolean {
    return columns.some(col => col.type === 'currency');
  }

  calculateColumnSum(data: any[], columnKey: string): string {
    const sum = data.reduce((total, item) => {
      const value = parseFloat(String(item[columnKey]).replace(/[^0-9.-]/g, '')) || 0;
      return total + value;
    }, 0);
    
    // Format with PHP currency as default
    return `₱${sum.toLocaleString('en-PH', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  }

  onEmailClick(email: string) {
    window.location.href = `mailto:${email}`;
  }

  onUrlClick(url: string) {
    window.open(url, '_blank');
  }
}