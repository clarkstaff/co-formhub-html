import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ticket } from '../../models/ticket.interface';
import { WorkflowTask } from '../../services/workflow-task.service';
import { TicketDetailContentComponent } from '../ticket-detail-content/ticket-detail-content.component';
import { AssigneeDisplayComponent } from '../../../../shared/components/assignee-display/assignee-display.component';
import { LazyPaginationComponent } from '../../../../shared/components/lazy-pagination/lazy-pagination.component';
import { ListSkeletonComponent } from './list-skeleton.component';
import { TicketDisplayUtil } from '../../utils/ticket-display.util';

@Component({
  selector: 'app-approval-list-view',
  standalone: true,
  imports: [CommonModule, TicketDetailContentComponent, AssigneeDisplayComponent, LazyPaginationComponent, ListSkeletonComponent],
  template: `
    <!-- Bulk Actions Bar -->
    <div *ngIf="hasSelectedTasks && !selectedTask" class="bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-400 dark:border-blue-500 p-4 mb-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-blue-400 dark:text-blue-300 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span class="text-sm font-medium text-blue-800 dark:text-blue-200">
            {{ selectedTasksCount }} {{ selectedTasksCount === 1 ? 'task' : 'tasks' }} selected
          </span>
        </div>
        <div class="flex gap-2">
          <button
            class="btn btn-outline-danger btn-sm"
            (click)="onBulkReject()"
          >
            <svg class="w-4 h-4 ltr:mr-2 rtl:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            Reject Selected
          </button>
          <button
            class="btn btn-success btn-sm"
            (click)="onBulkApprove()"
          >
            <svg class="w-4 h-4 ltr:mr-2 rtl:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Approve Selected
          </button>
        </div>
      </div>
    </div>

    <!-- Task List View -->
    <div *ngIf="!selectedTask">
      <!-- Show skeleton loading when loading and no tasks -->
      <app-list-skeleton *ngIf="loading && tasks.length === 0"></app-list-skeleton>
      
      <!-- Show actual content when not loading or when we have tasks -->
      <div *ngIf="!loading || tasks.length > 0">
        <div class="panel">
          <div class="table-responsive">
            <table class="table-striped">
              <thead>
                <tr>
                  <th class="w-12">
                    <input 
                      type="checkbox" 
                      class="form-checkbox"
                      [checked]="isAllSelected"
                      [indeterminate]="isIndeterminate"
                      (change)="toggleAllTasks($event)"
                    >
                  </th>
                  <th>Task</th>
                  <th>Request Type</th>
                  <th>Requestor</th>
                  <th>Requested At</th>
                  <th>Assignee</th>
                  <th class="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let task of tasks" 
                    class="group hover:bg-white-light/50 dark:hover:bg-gray-700/50 cursor-pointer"
                    [class.bg-blue-50]="isTaskSelected(task.id)"
                    [class.dark:bg-blue-900]="isTaskSelected(task.id)">
                  <td (click)="$event.stopPropagation()">
                    <input 
                      type="checkbox" 
                      class="form-checkbox"
                      [checked]="isTaskSelected(task.id)"
                      (change)="toggleTaskSelection(task.id, $event)"
                    >
                  </td>
                  <td (click)="onSelectTask(task)">
                    <div class="flex items-center">
                      <div class="flex-1">
                        <p class="font-semibold text-dark dark:text-gray-100">{{ task.title }}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">{{ getFormDataSummary(task) }}</p>
                        <p class="text-xs text-blue-600 dark:text-blue-400" *ngIf="task.reference_id">
                          Ref: {{ task.reference_id }}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td (click)="onSelectTask(task)">
                    <span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                      {{ task.form_name || task.form_type || 'Custom Form' }}
                    </span>
                  </td>
                  <td (click)="onSelectTask(task)">
                    <span class="text-sm text-gray-900 dark:text-gray-100 font-medium">
                      {{ task.requestor || 'Unknown' }}
                    </span>
                  </td>
                  <td (click)="onSelectTask(task)">
                    <span class="text-sm text-gray-600 dark:text-gray-300">
                      {{ formatDate(task.created_at) }}
                    </span>
                  </td>
                  <td (click)="onSelectTask(task)">
                    <app-assignee-display 
                      [assigneeDetails]="getAssigneeDetails(task)"
                      displayMode="compact">
                    </app-assignee-display>
                  </td>
                  <td>
                    <div class="flex items-center justify-center gap-2">
                      <button
                        class="btn btn-sm btn-outline-danger"
                        (click)="onReject(task.id); $event.stopPropagation()"
                        title="Reject"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                      <button
                        class="btn btn-sm btn-outline-success"
                        (click)="onApprove(task.id); $event.stopPropagation()"
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
        
        <!-- Pagination -->
        <app-lazy-pagination
          *ngIf="totalItems > 0"
          [currentPage]="currentPage"
          [totalPages]="totalPages"
          [totalItems]="totalItems"
          [itemsPerPage]="itemsPerPage"
          [loading]="loading"
          [hasNextPage]="hasNextPage"
          (pageChange)="pageChange.emit($event)">
        </app-lazy-pagination>
      </div>
    </div>

    <!-- Selected Task Detail View -->
    <div *ngIf="selectedTask" class="panel">
      <div class="flex flex-wrap items-center justify-between p-4">
        <div class="flex items-center">
          <button type="button" class="hover:text-primary ltr:mr-2 rtl:ml-2" (click)="onDeselectTask()">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <h4 class="text-base font-medium ltr:mr-2 rtl:ml-2 md:text-lg text-gray-900 dark:text-gray-100">{{ selectedTask.title }}</h4>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200" *ngIf="selectedTask.reference_id">
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
      
      <div class="border-t">
        <app-ticket-detail-content [ticket]="getTicketCompatibleTask(selectedTask)"></app-ticket-detail-content>
      </div>
    </div>

    <!-- Empty State -->
    <div *ngIf="tasks.length === 0 && !selectedTask && !loading" class="text-center py-8">
      <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No tasks found</h3>
      <p class="text-gray-500 dark:text-gray-400">There are no tasks to review.</p>
    </div>
  `
})
export class ApprovalListViewComponent {
  @Input() tasks: WorkflowTask[] = [];
  @Input() selectedTask: WorkflowTask | null = null;
  @Input() loading: boolean = false;
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Input() totalItems: number = 0;
  @Input() itemsPerPage: number = 10;
  @Input() hasNextPage: boolean = false;
  
  @Output() selectTask = new EventEmitter<WorkflowTask>();
  @Output() deselectTask = new EventEmitter<void>();
  @Output() approve = new EventEmitter<string>();
  @Output() reject = new EventEmitter<string>();
  @Output() bulkApprove = new EventEmitter<string[]>();
  @Output() bulkReject = new EventEmitter<string[]>();
  @Output() pageChange = new EventEmitter<number>();

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
  @Output() deselectTicket = new EventEmitter<void>();

  onSelectTask(task: WorkflowTask): void {
    this.selectTask.emit(task);
    this.selectTicket.emit(task);  // Backward compatibility
  }

  onDeselectTask(): void {
    this.deselectTask.emit();
    this.deselectTicket.emit();  // Backward compatibility
  }

  // Backward compatibility methods
  onSelectTicket(task: WorkflowTask): void {
    this.onSelectTask(task);
  }

  onDeselectTicket(): void {
    this.onDeselectTask();
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

  // Helper method to display form data using adaptive summary  
  getFormDataSummary(task: WorkflowTask): string {
    // Simple conversion - API now provides clean data
    const ticketLike = {
      ...task,
      createdAt: new Date(task.created_at),
      updatedAt: new Date(task.updated_at),
      reporterId: task.requestor,
      reporterName: task.requestor,
      customFormData: {
        formData: task.form_data, // Direct from API
        formType: task.form_type,
        referenceId: task.reference_id
      }
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