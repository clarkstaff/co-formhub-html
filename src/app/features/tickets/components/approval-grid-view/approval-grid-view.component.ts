import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ticket } from '../../models/ticket.interface';
import { FormDataTableComponent } from '../form-data-table/form-data-table.component';
import { AssigneeDisplayComponent } from '../../../../shared/components/assignee-display/assignee-display.component';

@Component({
  selector: 'app-approval-grid-view',
  standalone: true,
  imports: [CommonModule, FormDataTableComponent, AssigneeDisplayComponent],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      
      <!-- Approval List (Left Side) -->
      <div class="lg:col-span-1 bg-white rounded-lg shadow overflow-hidden">
        <div class="p-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-800">Pending Approvals</h2>
          <p class="text-sm text-gray-500">
            {{ tickets.length }} {{ tickets.length === 1 ? 'item' : 'items' }} waiting for approval
          </p>
        </div>
        
        <div class="divide-y divide-gray-200 max-h-[calc(100vh-16rem)] overflow-y-auto">
          <div *ngIf="tickets.length === 0" class="p-4 text-center text-gray-500">
            No items waiting for approval
          </div>
          
          <div
            *ngFor="let ticket of tickets"
            class="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            [class.bg-blue-50]="selectedTicket?.id === ticket.id"
            (click)="onSelectTicket(ticket)"
          >
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-medium text-gray-900">{{ ticket.title }}</h3>
                <div class="mt-1">
                  <app-assignee-display 
                    [assigneeDetails]="ticket.assigneeDetails || []"
                    displayMode="compact"
                    cssClass="text-sm text-gray-500">
                  </app-assignee-display>
                </div>
                <p class="text-xs text-blue-600 mt-1" *ngIf="getReferenceId(ticket) !== ticket.id">
                  Ref: {{ getReferenceId(ticket) }}
                </p>
              </div>
              <span [class]="getTypeBadgeClass(ticket.type)" class="px-2.5 py-0.5 rounded-full text-xs font-medium">
                {{ ticket.type | titlecase }}
              </span>
            </div>
            <p class="text-sm text-gray-600 mt-2 line-clamp-2">{{ getFormDataSummary(ticket) }}</p>
            <p class="text-xs text-gray-500 mt-2">
              Due: {{ formatDate(ticket.dueDate || ticket.createdAt) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Task Details (Right Side) -->
      <div class="lg:col-span-2 bg-white rounded-lg shadow">
        <div *ngIf="selectedTicket; else noSelection" class="p-6">
          
          <!-- Header with Actions -->
          <div class="flex justify-between items-start">
            <h2 class="text-xl font-semibold text-gray-800">{{ selectedTicket.title }}</h2>
            <div class="flex space-x-2">
              <button
                class="bg-red-100 hover:bg-red-200 text-red-700 py-2 px-4 rounded-md flex items-center text-sm"
                (click)="onReject(selectedTicket.id)"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                Reject
              </button>
              <button
                class="bg-green-100 hover:bg-green-200 text-green-700 py-2 px-4 rounded-md flex items-center text-sm"
                (click)="onApprove(selectedTicket.id)"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Approve
              </button>
            </div>
          </div>

          <!-- Badges -->
          <div class="flex flex-wrap gap-2 mt-4">
            <span [class]="getTypeBadgeClass(selectedTicket.type)" class="px-2.5 py-1 rounded-full text-xs font-medium">
              {{ selectedTicket.type | titlecase }}
            </span>
            <span [class]="getPriorityBadgeClass(selectedTicket.priority)" class="px-2.5 py-1 rounded-full text-xs font-medium">
              {{ selectedTicket.priority | titlecase }} priority
            </span>
          </div>

          <!-- Details Grid -->
          <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 class="text-sm font-medium text-gray-500">Description</h3>
              <p class="mt-1 text-gray-900">{{ selectedTicket.description }}</p>
              
              <!-- Custom Form Data Section -->
              <div *ngIf="selectedTicket.customFormData" class="mt-4">
                <h3 class="text-sm font-medium text-gray-500 mb-2">Form Details</h3>
                <div class="bg-gray-50 p-3 rounded text-sm">
                  <p><strong>Reference:</strong> {{ selectedTicket.customFormData.referenceId }}</p>
                  <p class="mt-1">{{ getFormDataSummary(selectedTicket) }}</p>
                </div>
              </div>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-500">Details</h3>
              <div class="mt-1 space-y-2">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Assigned to:</span>
                  <app-assignee-display 
                    [assigneeDetails]="selectedTicket.assigneeDetails || []"
                    displayMode="detailed"
                    cssClass="text-sm">
                  </app-assignee-display>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Due Date:</span>
                  <span class="text-sm font-medium">{{ formatDate(selectedTicket.dueDate || selectedTicket.createdAt) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Created:</span>
                  <span class="text-sm font-medium">{{ formatDate(selectedTicket.createdAt) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Form Data Tables -->
          <app-form-data-table [ticket]="selectedTicket"></app-form-data-table>

          <!-- Additional Data -->
          <div class="mt-6" *ngIf="selectedTicket.tags && selectedTicket.tags.length > 0">
            <h3 class="text-sm font-medium text-gray-500 mb-2">Tags</h3>
            <div class="bg-gray-50 p-4 rounded-md">
              <div class="flex flex-wrap gap-2">
                <span *ngFor="let tag of selectedTicket.tags" class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- No Selection State -->
        <ng-template #noSelection>
          <div class="flex flex-col items-center justify-center h-full p-6 text-center min-h-[400px]">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900">No task selected</h3>
            <p class="text-gray-500 mt-1">Select a task from the list to view details and take action</p>
          </div>
        </ng-template>
      </div>
    </div>
  `
})
export class ApprovalGridViewComponent {
  @Input() tickets: Ticket[] = [];
  @Input() selectedTicket: Ticket | null = null;
  
  @Output() selectTicket = new EventEmitter<Ticket>();
  @Output() approve = new EventEmitter<string>();
  @Output() reject = new EventEmitter<string>();

  onSelectTicket(ticket: Ticket): void {
    this.selectTicket.emit(ticket);
  }

  onApprove(ticketId: string): void {
    this.approve.emit(ticketId);
  }

  onReject(ticketId: string): void {
    this.reject.emit(ticketId);
  }

  formatDate(date: string | Date): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }

  // Helper method to display form data
  getFormDataSummary(ticket: Ticket): string {
    if (!ticket.customFormData?.formData) return ticket.description;
    
    const formData = ticket.customFormData.formData;
    
    // Handle specific form types based on the data structure
    if (formData.totalPettyCash && formData.pettyCashHolder) {
      return `Petty Cash: ${formData.totalPettyCash} - Holder: ${formData.pettyCashHolder}`;
    }
    
    // Generic fallback - show key fields
    const keys = Object.keys(formData).slice(0, 2);
    const summary = keys.map(key => {
      const value = formData[key];
      if (Array.isArray(value)) {
        return `${key}: ${value.length} items`;
      }
      return `${key}: ${value}`;
    }).join(', ');
    
    return summary || ticket.description;
  }

  // Get reference ID for display
  getReferenceId(ticket: Ticket): string {
    return ticket.customFormData?.referenceId || ticket.id;
  }

  getTypeBadgeClass(type: string): string {
    switch (type) {
      case 'bug': return 'bg-red-100 text-red-800';
      case 'feature': return 'bg-blue-100 text-blue-800';
      case 'task': return 'bg-green-100 text-green-800';
      case 'improvement': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getPriorityBadgeClass(priority: string): string {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}