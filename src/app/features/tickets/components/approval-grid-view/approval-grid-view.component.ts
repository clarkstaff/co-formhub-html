import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ticket } from '../../models/ticket.interface';
import { WorkflowTask } from '../../services/workflow-task.service';
import { TicketDetailContentComponent } from '../ticket-detail-content/ticket-detail-content.component';
import { AssigneeDisplayComponent } from '../../../../shared/components/assignee-display/assignee-display.component';
import { TicketDisplayUtil } from '../../utils/ticket-display.util';

@Component({
  selector: 'app-approval-grid-view',
  standalone: true,
  imports: [CommonModule, TicketDetailContentComponent, AssigneeDisplayComponent],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      
      <!-- Approval List (Left Side) -->
      <div class="lg:col-span-1 bg-white rounded-lg shadow overflow-hidden">
        
        <!-- Header with Bulk Actions -->
        <div class="p-4 border-b border-gray-200">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-lg font-medium text-gray-800">Pending Approvals</h2>
            <input 
              type="checkbox" 
              class="form-checkbox"
              [checked]="isAllSelected"
              [indeterminate]="isIndeterminate"
              (change)="toggleAllTasks($event)"
              title="Select All"
            >
          </div>
          
          <p class="text-sm text-gray-500 mb-3">
            {{ tickets.length }} {{ tickets.length === 1 ? 'item' : 'items' }} waiting for approval
          </p>

          <!-- Bulk Action Buttons -->
          <div *ngIf="hasSelectedTasks" class="flex gap-2">
            <button
              class="flex-1 btn btn-outline-danger btn-sm text-xs"
              (click)="onBulkReject()"
            >
              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              Reject ({{ selectedTasksCount }})
            </button>
            <button
              class="flex-1 btn btn-success btn-sm text-xs"
              (click)="onBulkApprove()"
            >
              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Approve ({{ selectedTasksCount }})
            </button>
          </div>
        </div>
        
        <div class="divide-y divide-gray-200 max-h-[calc(100vh-20rem)] overflow-y-auto">
          <div *ngIf="tickets.length === 0" class="p-4 text-center text-gray-500">
            No items waiting for approval
          </div>
          
          <div
            *ngFor="let task of tasks"
            class="p-4 cursor-pointer hover:bg-gray-50 transition-colors relative"
            [class.bg-blue-50]="selectedTask?.id === task.id"
            [class.bg-green-50]="isTaskSelected(task.id)"
            (click)="onSelectTask(task)"
          >
            <!-- Checkbox overlay -->
            <div class="absolute top-2 right-2" (click)="$event.stopPropagation()">
              <input 
                type="checkbox" 
                class="form-checkbox"
                [checked]="isTaskSelected(task.id)"
                (change)="toggleTaskSelection(task.id, $event)"
              >
            </div>
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-medium text-gray-900">{{ task.title }}</h3>
                <div class="mt-1">
                  <app-assignee-display 
                    [assigneeDetails]="getAssigneeDetails(task)"
                    displayMode="compact"
                    cssClass="text-sm text-gray-500">
                  </app-assignee-display>
                </div>
                <p class="text-xs text-blue-600 mt-1" *ngIf="task.reference_id">
                  Ref: {{ task.reference_id }}
                </p>
              </div>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 me-5">
                {{ task.form_name }}
              </span>
            </div>
            <p class="text-sm text-gray-600 mt-2 line-clamp-2">{{ getFormDataSummary(task) }}</p>
            <div class="text-xs text-gray-500 mt-2 space-y-1">
              <p><strong>Requestor:</strong> {{ task.requestor || 'Unknown' }}</p>
              <p><strong>Created At:</strong> {{ formatDate(task.created_at) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Task Details (Right Side) -->
      <div class="lg:col-span-2 bg-white rounded-lg shadow">
        <div *ngIf="selectedTask; else noSelection">
          
          <!-- Header with Actions -->
          <div class="flex flex-wrap items-center justify-between p-4 border-b border-gray-200">
            <div class="flex items-center">
              <h4 class="text-lg font-medium text-gray-900 mr-2">{{ selectedTask.title }}</h4>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800" *ngIf="selectedTask.reference_id">
                {{ selectedTask.reference_id }}
              </span>
            </div>
            
            <div class="flex gap-2">
              <button
                class="btn btn-outline-danger btn-sm"
                (click)="onReject(selectedTask.id)"
                title="Reject Task"
              >
                <svg class="w-4 h-4 ltr:mr-2 rtl:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                Reject
              </button>
              <button
                class="btn btn-success btn-sm"
                (click)="onApprove(selectedTask.id)"
                title="Approve Task"
              >
                <svg class="w-4 h-4 ltr:mr-2 rtl:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Approve
              </button>
            </div>
          </div>

          <!-- Task Details Content -->
          <div class="p-6">
            <!-- Use shared ticket detail content component without actions -->
            <app-ticket-detail-content 
              [ticket]="getTicketCompatibleTask(selectedTask)"
              [showActions]="false"
              [assigneeDisplayMode]="'detailed'">
            </app-ticket-detail-content>
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
  @Input() tasks: WorkflowTask[] = [];
  @Input() selectedTask: WorkflowTask | null = null;
  
  @Output() selectTask = new EventEmitter<WorkflowTask>();
  @Output() approve = new EventEmitter<string>();
  @Output() reject = new EventEmitter<string>();
  @Output() bulkApprove = new EventEmitter<string[]>();
  @Output() bulkReject = new EventEmitter<string[]>();

  // Bulk selection state
  selectedTaskIds: Set<string> = new Set();

  get hasSelectedTasks(): boolean {
    return this.selectedTaskIds.size > 0;
  }

  get selectedTasksCount(): number {
    return this.selectedTaskIds.size;
  }

  get isAllSelected(): boolean {
    return this.tasks.length > 0 && this.selectedTaskIds.size === this.tasks.length;
  }

  get isIndeterminate(): boolean {
    return this.selectedTaskIds.size > 0 && this.selectedTaskIds.size < this.tasks.length;
  }

  // Backward compatibility with ticket interface
  @Input() 
  set tickets(value: WorkflowTask[] | Ticket[]) {
    this.tasks = value as WorkflowTask[];
  }
  get tickets(): WorkflowTask[] {
    return this.tasks;
  }

  @Input() 
  set selectedTicket(value: WorkflowTask | Ticket | null) {
    this.selectedTask = value as WorkflowTask;
  }
  get selectedTicket(): WorkflowTask | null {
    return this.selectedTask;
  }

  @Output() selectTicket = new EventEmitter<WorkflowTask>();

  onSelectTask(task: WorkflowTask): void {
    this.selectTask.emit(task);
    this.selectTicket.emit(task);  // Backward compatibility
  }

  // Backward compatibility methods
  onSelectTicket(task: WorkflowTask): void {
    this.onSelectTask(task);
  }

  onApprove(taskId: string): void {
    this.approve.emit(taskId);
  }

  onReject(taskId: string): void {
    this.reject.emit(taskId);
  }

  // Bulk selection methods
  toggleTaskSelection(taskId: string, event: Event): void {
    event.stopPropagation();
    if (this.selectedTaskIds.has(taskId)) {
      this.selectedTaskIds.delete(taskId);
    } else {
      this.selectedTaskIds.add(taskId);
    }
  }

  toggleAllTasks(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      this.tasks.forEach(task => this.selectedTaskIds.add(task.id));
    } else {
      this.selectedTaskIds.clear();
    }
  }

  isTaskSelected(taskId: string): boolean {
    return this.selectedTaskIds.has(taskId);
  }

  onBulkApprove(): void {
    if (this.selectedTaskIds.size > 0) {
      this.bulkApprove.emit(Array.from(this.selectedTaskIds));
      this.selectedTaskIds.clear();
    }
  }

  onBulkReject(): void {
    if (this.selectedTaskIds.size > 0) {
      this.bulkReject.emit(Array.from(this.selectedTaskIds));
      this.selectedTaskIds.clear();
    }
  }

  formatDate(date: string | Date): string {
    return TicketDisplayUtil.formatDate(date);
  }

  // Helper method to display form data
  getFormDataSummary(task: WorkflowTask): string {
    // Convert WorkflowTask to Ticket-like interface for compatibility
    const ticketLike = {
      ...task,
      createdAt: new Date(task.created_at),
      updatedAt: new Date(task.updated_at),
      reporterId: task.requestor,
      reporterName: task.requestor
    } as unknown as Ticket;
    return TicketDisplayUtil.getAdaptiveFormDataSummary(ticketLike);
  }

  // Convert WorkflowTask to Ticket for ticket-detail-content component
  getTicketCompatibleTask(task: WorkflowTask): Ticket {
    const assigneeDetails = this.getAssigneeDetails(task);
    const primaryAssignee = assigneeDetails.length > 0 ? assigneeDetails[0] : null;
    
    return {
      ...task,
      createdAt: new Date(task.created_at),
      updatedAt: new Date(task.updated_at),
      reporterId: task.requestor,
      reporterName: task.requestor,
      // Set primary assignee properties for simple display
      assigneeId: primaryAssignee?.assignee_id?.toString(),
      assigneeName: primaryAssignee ? primaryAssignee.assignee_name : 'Unassigned',
      // Set multiple assignees for complex display
      assigneeIds: assigneeDetails.map(a => a.assignee_id.toString()),
      assigneeNames: assigneeDetails.map(a => a.assignee_name),
      assigneeDetails: assigneeDetails,
      customFormData: {
        formData: task.form_data, // Direct from API
        formType: task.form_type,
        referenceId: task.reference_id
      }
    } as unknown as Ticket;
  }

  // Convert WorkflowTask assignees to TicketAssignee format
  getAssigneeDetails(task: WorkflowTask): any[] {
    return (task.assignees || []).map(assignee => ({
      id: assignee.id,
      assignee_id: assignee.id,
      assignee_name: assignee.name || 'Unknown Assignee',
      assignee_type: this.mapAssigneeTypeForDisplay(assignee.type),
      assignee_details: assignee
    }));
  }

  // Map assignee type for display in the component
  private mapAssigneeTypeForDisplay(type: string): string {
    switch (type) {
      case 'user':
        return 'user';
      case 'group':
        return 'group';
      default:
        return 'user';
    }
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
}