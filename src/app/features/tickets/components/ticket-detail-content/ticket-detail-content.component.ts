import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ticket } from '../../models/ticket.interface';
import { AdaptiveFormDisplayComponent } from '../adaptive-form-display/adaptive-form-display.component';
import { AssigneeDisplayComponent } from '../../../../shared/components/assignee-display/assignee-display.component';
import { TicketDisplayUtil } from '../../utils/ticket-display.util';

@Component({
  selector: 'app-ticket-detail-content',
  standalone: true,
  imports: [CommonModule, AdaptiveFormDisplayComponent, AssigneeDisplayComponent],
  template: `
    <div class="ticket-detail-content mt-4">
      <!-- Badges -->
      <div class="flex flex-wrap gap-2 mb-6">
        <span class="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {{ ticket.workflow_stage_name || ticket.title }}
        </span>
        <span class="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800" *ngIf="ticket.reference_id">
          Ref: {{ ticket.reference_id }}
        </span>
        <span class="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800" *ngIf="ticket.form_type">
          {{ ticket.form_name || (ticket.form_type | titlecase) }}
        </span>
      </div>

      <!-- Details Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 class="text-sm font-medium text-gray-500 mb-2">Description</h3>
          <p class="text-gray-900">{{ ticket.description }}</p>
          
          <!-- Custom Form Data Summary -->
          <div *ngIf="ticket.customFormData" class="mt-4">
            <h3 class="text-sm font-medium text-gray-500 mb-2">Details</h3>
            <div class="bg-gray-50 p-3 rounded text-sm">
              <p><strong>Reference:</strong> {{ ticket.customFormData.referenceId }}</p>
              <p class="mt-1">{{ getFormDataSummary() }}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 class="text-sm font-medium text-gray-500 mb-2">Details</h3>
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Assigned to:</span>
              <app-assignee-display 
                [assigneeDetails]="ticket.assigneeDetails || []"
                [displayMode]="assigneeDisplayMode"
                cssClass="text-sm">
              </app-assignee-display>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Requestor:</span>
              <span class="text-sm font-medium">{{ ticket.requestor || 'Unknown' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Status:</span>
              <span class="text-sm font-medium">{{ ticket.workflow_stage_name || 'Approval' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Requested At:</span>
              <span class="text-sm font-medium">{{ formatDate(ticket.form_created_at || ticket.createdAt) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Task Created:</span>
              <span class="text-sm font-medium">{{ formatDate(ticket.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Adaptive Form Display -->
      <div class="mb-6">
        <hr>
        <app-adaptive-form-display [ticket]="ticket"></app-adaptive-form-display>
      </div>

      <!-- Tags -->
      <div *ngIf="ticket.tags && ticket.tags.length > 0" class="mt-6">
        <h3 class="text-sm font-medium text-gray-500 mb-2">Tags</h3>
        <div class="bg-gray-50 p-4 rounded-md">
          <div class="flex flex-wrap gap-2">
            <span *ngFor="let tag of ticket.tags" class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TicketDetailContentComponent {
  @Input() ticket!: Ticket;
  @Input() showActions = true;
  @Input() assigneeDisplayMode: 'compact' | 'detailed' | 'avatar' | 'list' = 'detailed';
  
  @Output() approve = new EventEmitter<void>();
  @Output() reject = new EventEmitter<void>();

  onApprove(): void {
    this.approve.emit();
  }

  onReject(): void {
    this.reject.emit();
  }

  formatDate(date: string | Date): string {
    return TicketDisplayUtil.formatDate(date);
  }

  getFormDataSummary(): string {
    return TicketDisplayUtil.getAdaptiveFormDataSummary(this.ticket);
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