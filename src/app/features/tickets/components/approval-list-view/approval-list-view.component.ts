import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ticket } from '../../models/ticket.interface';
import { AdaptiveFormDisplayComponent } from '../adaptive-form-display/adaptive-form-display.component';
import { AssigneeDisplayComponent } from '../../../../shared/components/assignee-display/assignee-display.component';
import { TicketDisplayUtil } from '../../utils/ticket-display.util';

@Component({
  selector: 'app-approval-list-view',
  standalone: true,
  imports: [CommonModule, AdaptiveFormDisplayComponent, AssigneeDisplayComponent],
  template: `
    <!-- Ticket List View -->
    <div *ngIf="!selectedTicket" class="panel">
      <div class="table-responsive">
        <table class="table-striped">
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Type</th>
              <th>Priority</th>
              <th>Assignee</th>
              <th>Due Date</th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let ticket of tickets" 
                class="group hover:bg-white-light/50 cursor-pointer">
              <td (click)="onSelectTicket(ticket)">
                <div class="flex items-center">
                  <div class="flex-1">
                    <p class="font-semibold text-dark">{{ ticket.title }}</p>
                    <p class="text-sm text-gray-600 line-clamp-1">{{ getFormDataSummary(ticket) }}</p>
                    <p class="text-xs text-blue-600" *ngIf="getReferenceId(ticket) !== ticket.id">
                      Ref: {{ getReferenceId(ticket) }}
                    </p>
                  </div>
                </div>
              </td>
              <td (click)="onSelectTicket(ticket)">
                <span [class]="getTypeBadgeClass(ticket.type)" class="px-2.5 py-0.5 rounded-full text-xs font-medium">
                  {{ ticket.type | titlecase }}
                </span>
              </td>
              <td (click)="onSelectTicket(ticket)">
                <span [class]="getPriorityBadgeClass(ticket.priority)" class="px-2.5 py-0.5 rounded-full text-xs font-medium">
                  {{ ticket.priority | titlecase }}
                </span>
              </td>
              <td (click)="onSelectTicket(ticket)">
                <app-assignee-display 
                  [assigneeDetails]="ticket.assigneeDetails || []"
                  displayMode="compact">
                </app-assignee-display>
              </td>
              <td (click)="onSelectTicket(ticket)">
                {{ formatDate(ticket.dueDate || ticket.createdAt) }}
              </td>
              <td>
                <div class="flex items-center justify-center gap-2">
                  <button
                    class="btn btn-sm btn-outline-danger"
                    (click)="onReject(ticket.id); $event.stopPropagation()"
                    title="Reject"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                  <button
                    class="btn btn-sm btn-outline-success"
                    (click)="onApprove(ticket.id); $event.stopPropagation()"
                    title="Approve"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Selected Ticket Detail View -->
    <div *ngIf="selectedTicket" class="panel">
      <div class="flex flex-wrap items-center justify-between p-4">
        <div class="flex items-center">
          <button type="button" class="hover:text-primary ltr:mr-2 rtl:ml-2" (click)="onDeselectTicket()">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <h4 class="text-base font-medium ltr:mr-2 rtl:ml-2 md:text-lg">{{ selectedTicket.title }}</h4>
          <span [class]="getTypeBadgeClass(selectedTicket.type)" class="px-2.5 py-0.5 rounded-full text-xs font-medium">
            {{ selectedTicket.type | titlecase }}
          </span>
        </div>
        <div class="flex space-x-2">
          <button
            class="btn btn-outline-danger"
            (click)="onReject(selectedTicket.id)"
          >
            <svg class="w-4 h-4 ltr:mr-1 rtl:ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            Reject
          </button>
          <button
            class="btn btn-success"
            (click)="onApprove(selectedTicket.id)"
          >
            <svg class="w-4 h-4 ltr:mr-1 rtl:ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Approve
          </button>
        </div>
      </div>
      
      <div class="h-px border-b border-[#e0e6ed] dark:border-[#1b2e4b]"></div>
      
      <div class="p-6">
        <!-- Badges -->
        <div class="flex flex-wrap gap-2 mb-6">
          <span [class]="getTypeBadgeClass(selectedTicket.type)" class="px-2.5 py-1 rounded-full text-xs font-medium">
            {{ selectedTicket.type | titlecase }}
          </span>
          <span [class]="getPriorityBadgeClass(selectedTicket.priority)" class="px-2.5 py-1 rounded-full text-xs font-medium">
            {{ selectedTicket.priority | titlecase }} priority
          </span>
        </div>

        <!-- Details Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="text-sm font-medium text-gray-500 mb-2">Description</h3>
            <p class="text-gray-900">{{ selectedTicket.description }}</p>
            
            <!-- Custom Form Data Section -->
            <div *ngIf="selectedTicket.customFormData" class="mt-4">
              <h3 class="text-sm font-medium text-gray-500 mb-2">Summary</h3>
              <div class="bg-gray-50 p-3 rounded text-sm">
                <p><strong>Reference:</strong> {{ selectedTicket.customFormData.referenceId }}</p>
                <p class="mt-1">{{ getFormDataSummary(selectedTicket) }}</p>
              </div>
            </div>
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-500 mb-2">Details</h3>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Assigned to:</span>
                <app-assignee-display 
                  [assigneeDetails]="selectedTicket.assigneeDetails || []"
                  displayMode="compact">
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

        <!-- Form Data Display -->
        <div class="mb-4">
          <h3 class="text-sm font-medium text-gray-500 mb-2">Details</h3>
        </div>

        <!-- Adaptive Form Display -->
        <app-adaptive-form-display 
          [ticket]="selectedTicket">
        </app-adaptive-form-display>

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
    </div>

    <!-- Empty State -->
    <div *ngIf="tickets.length === 0 && !selectedTicket" class="text-center py-8">
      <h3 class="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
      <p class="text-gray-500">There are no tickets to review.</p>
    </div>
  `
})
export class ApprovalListViewComponent {
  @Input() tickets: Ticket[] = [];
  @Input() selectedTicket: Ticket | null = null;
  
  @Output() selectTicket = new EventEmitter<Ticket>();
  @Output() deselectTicket = new EventEmitter<void>();
  @Output() approve = new EventEmitter<string>();
  @Output() reject = new EventEmitter<string>();

  onSelectTicket(ticket: Ticket): void {
    this.selectTicket.emit(ticket);
  }

  onDeselectTicket(): void {
    this.deselectTicket.emit();
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

  // Helper method to display form data using adaptive summary
  getFormDataSummary(ticket: Ticket): string {
    return TicketDisplayUtil.getAdaptiveFormDataSummary(ticket);
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