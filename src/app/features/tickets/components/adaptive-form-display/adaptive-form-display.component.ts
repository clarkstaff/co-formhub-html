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
    <div *ngIf="ticket && formDisplay" class="min-vh-100 bg-light p-4">
      <div class="container">
        <!-- Header Section -->
        <div class="d-flex align-items-center gap-3 mb-5" *ngIf="formDisplay.header">
          <h1 class="h3 fw-semibold mb-0">{{ formDisplay.header.title }}</h1>
          <span class="badge ms-auto" 
                [ngClass]="{
                  'bg-success': formDisplay.header.status === 'approved',
                  'bg-warning text-dark': formDisplay.header.status === 'pending',
                  'bg-danger': formDisplay.header.status === 'rejected',
                  'bg-primary': formDisplay.header.status === 'open',
                  'bg-info': formDisplay.header.status === 'in_progress'
                }">
            {{ formDisplay.header.status | titlecase }}
          </span>
        </div>

        <!-- Form Fields Section -->
        <div *ngIf="formDisplay.fields.length > 0" class="row g-4 mb-4">
          <div *ngFor="let field of formDisplay.fields; trackBy: trackByField" 
               class="col-md-6">
            <label class="form-label fw-medium small">
              {{ field.label }}
            </label>
            <div class="form-control bg-light">
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
                    class="badge"
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
        <div *ngFor="let table of formDisplay.tables; trackBy: trackByTable" class="mb-4">
          <h2 class="h5 fw-medium mb-3">{{ table.title }}</h2>
          <div class="table-responsive border rounded">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th *ngFor="let column of table.columns; trackBy: trackByColumn" 
                      class="text-uppercase small fw-semibold"
                      [class.text-end]="column.align === 'right'"
                      [class.text-center]="column.align === 'center'">
                    {{ column.label }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let row of table.data; let i = index; trackBy: trackByRow">
                  <td *ngFor="let column of table.columns; trackBy: trackByColumn" 
                      class="small"
                      [class.text-end]="column.align === 'right'"
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

        <!-- Summary Section -->
        <div *ngIf="formDisplay.summary.length > 0" class="d-flex justify-content-end mb-4">
          <div style="width: 400px;">
            <div *ngFor="let summaryItem of formDisplay.summary; let last = last; trackBy: trackBySummary"
                 class="d-flex justify-content-between align-items-center mb-3"
                 [class.pb-3]="!last"
                 [class.border-bottom]="!last">
              <span class="small fw-medium">{{ summaryItem.label }}</span>
              <span class="small fw-semibold"
                    [ngClass]="{
                      'text-success': summaryItem.type === 'balance' && isPositive(summaryItem.value),
                      'text-danger': summaryItem.type === 'balance' && isNegative(summaryItem.value) && summaryItem.label.toLowerCase().includes('balance')
                    }">
                PHP {{ formatNumberValue(summaryItem.value) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Actions Section - Removed as per user request -->
        <!-- Form actions are handled by parent approval component -->

        <!-- Debug Info (Development Only) -->
        <div *ngIf="showDebugInfo" class="mt-5 p-3 bg-light border rounded">
          <h6>Debug Information</h6>
          <pre>{{ getDebugInfo() | json }}</pre>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .badge {
      font-size: 0.75rem;
    }
    
    .table th {
      background-color: var(--bs-gray-100) !important;
      border-bottom: 2px solid var(--bs-border-color);
    }
    
    .form-control.bg-light {
      border: 1px solid var(--bs-border-color);
      background-color: var(--bs-gray-100) !important;
    }
    
    .currency-positive {
      color: var(--bs-success);
    }
    
    .currency-negative {
      color: var(--bs-danger);
    }

    .debug-info {
      font-size: 0.75rem;
      max-height: 200px;
      overflow-y: auto;
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
    if (['urgent', 'high', 'critical'].includes(val)) return 'bg-danger';
    if (['medium', 'normal'].includes(val)) return 'bg-warning text-dark';
    if (['low', 'minor'].includes(val)) return 'bg-success';
    if (['approved', 'active', 'completed'].includes(val)) return 'bg-success';
    if (['pending', 'review'].includes(val)) return 'bg-warning text-dark';
    if (['rejected', 'cancelled'].includes(val)) return 'bg-danger';
    return 'bg-primary';
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