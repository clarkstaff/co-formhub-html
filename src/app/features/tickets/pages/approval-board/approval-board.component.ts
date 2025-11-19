import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';

import { 
  Ticket, 
  TicketStatus,
  TicketPriority,
  TicketType,
  UpdateTicketRequest
} from '../../models/ticket.interface';
import { WorkflowTask, WorkflowTaskService, ProcessTaskRequest } from '../../services/workflow-task.service';
import { ToastService } from 'src/app/shared/toast/services/toast.service';
import { IconModule } from 'src/app/shared/icon/icon.module';
import { ApprovalListViewComponent } from '../../components/approval-list-view/approval-list-view.component';
import { ApprovalGridViewComponent } from '../../components/approval-grid-view/approval-grid-view.component';
import { ConfirmationDialogComponent, ConfirmationDialogData, ConfirmationResult } from '../../components/confirmation-dialog/confirmation-dialog.component';


@Component({
  selector: 'app-approval-board',
  standalone: true,
  imports: [CommonModule, FormsModule, IconModule, ApprovalListViewComponent, ApprovalGridViewComponent, ConfirmationDialogComponent],
  templateUrl: './approval-board.component.html',
  styleUrl: './approval-board.component.css'
})
export class ApprovalBoardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // View state
  selectedTask: WorkflowTask | null = null;
  showApprovalDialog = false;
  approvalAction: 'approved' | 'rejected' | null = null;
  confirmationDialogData: ConfirmationDialogData = {
    title: '',
    message: '',
    confirmText: '',
    cancelText: 'Cancel',
    type: 'approve'
  };
  processTypeFilter: string = 'all';
  displayType: 'list' | 'grid' = 'list';
  searchText = '';

  // Data
  pendingTasks: WorkflowTask[] = [];
  allTasks: WorkflowTask[] = [];
  filteredTasks: WorkflowTask[] = [];
  processTypes: string[] = [];
  
  // Loading states
  loading = false;
  error: string | null = null;
  processing = false;

  // Pagination
  currentPage: number = 1;
  totalPages: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 20;
  hasNextPage: boolean = false;
  
  // Pagination meta from API
  paginationMeta: any = null;

  // Enum references for template (keeping for backward compatibility)
  TicketStatus = TicketStatus;
  TicketPriority = TicketPriority;
  TicketType = TicketType;

  constructor(
    private workflowTaskService: WorkflowTaskService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadPendingTasks();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPendingTasks(page: number = 1, resetData: boolean = true) {
    // Only show main spinner for initial load, use component loading for pagination
    if (resetData) {
      this.loading = true;
    }
    
    this.error = null;

    // Reset data if it's a new search or filter change
    if (resetData) {
      this.currentPage = 1;
      this.pendingTasks = [];
      this.allTasks = [];
      this.filteredTasks = [];
      page = 1;
    }

    const filters = {
      stage_type: 'approval',  // Only get approval stage tasks
      page: page,
      per_page: this.itemsPerPage,
      ...(this.processTypeFilter !== 'all' && { form_type: this.processTypeFilter }),
      ...(this.searchText.trim() && { search: this.searchText.trim() })
    };

    this.workflowTaskService.getTasks(filters).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        // Handle different response structures
        let tasks = [];
        if (Array.isArray(response.data)) {
          tasks = response.data;
        } else if (Array.isArray(response)) {
          tasks = response;
        } else if (response.data && typeof response.data === 'object') {
          // If data is an object, try to extract array from common properties
          const dataObj = response.data as any;
          tasks = dataObj.items || dataObj.data || Object.values(dataObj) || [];
        } else {
          tasks = [];
        }
        
        // Ensure tasks is always an array
        if (!Array.isArray(tasks)) {
          tasks = [];
        }
        
        // Update pagination meta
        this.paginationMeta = response.meta;
        this.currentPage = response.meta?.current_page || page;
        this.totalPages = response.meta?.last_page || 1;
        this.totalItems = response.meta?.total || 0;
        this.itemsPerPage = response.meta?.per_page || this.itemsPerPage;
        this.hasNextPage = this.currentPage < this.totalPages;

        if (resetData) {
          // Replace all data for new searches/filters
          this.pendingTasks = tasks;
          this.allTasks = tasks;
          this.filteredTasks = tasks;
        } else {
          // Append data for pagination
          this.pendingTasks = [...this.pendingTasks, ...tasks];
          this.allTasks = [...this.allTasks, ...tasks];
          this.filteredTasks = [...this.filteredTasks, ...tasks];
        }
        
        this.extractProcessTypes(this.pendingTasks);
        
        // Always reset loading states after successful API call
        this.loading = false;
      },
      error: (error: any) => {
        this.error = 'Failed to load pending tasks';
        // Always reset loading states on error
        this.loading = false;
        console.error('Error loading tasks:', error);
      }
    });
  }

  private extractProcessTypes(tasks: WorkflowTask[]) {
    // Ensure tasks is an array before processing
    if (!Array.isArray(tasks)) {
      this.processTypes = ['all'];
      return;
    }
    
    try {
      const types = ['all', ...new Set(tasks.map(task => task.form_type || task.type).filter(Boolean))];
      this.processTypes = types;
    } catch (error) {
      this.processTypes = ['all'];
    }
  }

  selectTask(task: WorkflowTask) {
    this.selectedTask = task;
  }

  // Backward compatibility method
  selectTicket(ticket: any) {
    this.selectTask(ticket);
  }

  onPageChange(page: number): void {
    if (page !== this.currentPage && !this.loading) {
      this.loadPendingTasks(page, false);
    }
  }

  onProcessTypeFilterChange() {
    this.loadPendingTasks(1, true);
  }

  searchTickets() {
    this.loadPendingTasks(1, true);
  }

  setDisplayType(type: 'list' | 'grid'): void {
    this.displayType = type;
  }

  handleApprove(taskId: string) {
    const task = this.allTasks.find((t: WorkflowTask) => t.id === taskId);
    if (!task) return;

    this.approvalAction = 'approved';
    this.selectedTask = task;
    this.confirmationDialogData = {
      title: 'Approve Task',
      message: 'Are you sure you want to approve this task? It will proceed to the next stage.',
      confirmText: 'Approve',
      cancelText: 'Cancel',
      type: 'approve',
      ticketTitle: task.title
    };
    this.showApprovalDialog = true;
  }

  handleReject(taskId: string) {
    const task = this.allTasks.find((t: WorkflowTask) => t.id === taskId);
    if (!task) return;

    this.approvalAction = 'rejected';
    this.selectedTask = task;
    this.confirmationDialogData = {
      title: 'Reject Task',
      message: 'Are you sure you want to reject this task? Please provide a reason.',
      confirmText: 'Reject',
      cancelText: 'Cancel',
      type: 'reject',
      ticketTitle: task.title
    };
    this.showApprovalDialog = true;
  }

  handleBulkApprove(taskIds: string[]) {
    if (taskIds.length === 0) return;
    
    this.processBulkTasks(taskIds, 'approved');
  }

  handleBulkReject(taskIds: string[]) {
    if (taskIds.length === 0) return;
    
    this.processBulkTasks(taskIds, 'rejected');
  }

  private processBulkTasks(taskIds: string[], action: 'approved' | 'rejected') {
    const tasks = this.allTasks.filter(t => taskIds.includes(t.id));
    if (tasks.length === 0) return;

    this.processing = true;
    let completed = 0;
    let failed = 0;

    tasks.forEach(task => {
      const processRequest: ProcessTaskRequest = {
        action: action,
        notes: `Bulk ${action}`
      };

      this.workflowTaskService.processTask(task.custom_form_response_id.toString(), processRequest).subscribe({
        next: (response) => {
          completed++;
          if (response.success) {
            // Remove successful task from lists
            this.allTasks = this.allTasks.filter(t => t.id !== task.id);
            this.pendingTasks = this.pendingTasks.filter(t => t.id !== task.id);
            this.filteredTasks = this.filteredTasks.filter(t => t.id !== task.id);
            this.totalItems = Math.max(0, this.totalItems - 1);
          } else {
            failed++;
          }

          // Check if this was the last task
          if (completed + failed === tasks.length) {
            this.processing = false;
            this.showBulkProcessingResults(completed - failed, failed, action, tasks.length);
          }
        },
        error: (error) => {
          failed++;
          console.error('Error processing bulk task:', error);
          
          // Check if this was the last task
          if (completed + failed === tasks.length) {
            this.processing = false;
            this.showBulkProcessingResults(completed - failed, failed, action, tasks.length);
          }
        }
      });
    });
  }

  private showBulkProcessingResults(successful: number, failed: number, action: 'approved' | 'rejected', total: number) {
    const actionText = action === 'approved' ? 'approved' : 'rejected';
    
    if (failed === 0) {
      // All successful
      this.toastService.success(
        `All ${total} task(s) have been ${actionText} successfully!`,
        `Bulk ${action.charAt(0).toUpperCase() + action.slice(1)} Completed`,
        5000
      );
    } else if (successful === 0) {
      // All failed
      this.toastService.error(
        `Failed to ${action} ${total} task(s)`,
        `Bulk ${action.charAt(0).toUpperCase() + action.slice(1)} Failed`
      );
    } else {
      // Mixed results
      this.toastService.warning(
        `${successful} task(s) ${actionText}, ${failed} failed`,
        `Bulk ${action.charAt(0).toUpperCase() + action.slice(1)} Partial Success`
      );
    }

    // Clear selection if it was processed
    if (this.selectedTask && !this.allTasks.find(t => t.id === this.selectedTask!.id)) {
      this.selectedTask = null;
    }
  }

  onConfirmationResult(result: ConfirmationResult) {
    if (result.confirmed && this.selectedTask && this.approvalAction) {
      this.processTask(this.selectedTask.id, this.approvalAction, result.notes);
    } else {
      // User cancelled - just close dialog but keep selectedTask
      this.closeApprovalDialog();
    }
  }

  closeApprovalDialog() {
    this.showApprovalDialog = false;
    this.approvalAction = null;
    // Don't clear selectedTask here - it should only be cleared when task is actually updated
  }

  private processTask(taskId: string, action: 'approved' | 'rejected', notes?: string) {
    // Find the task to get the custom_form_response_id
    const task = this.allTasks.find((t: WorkflowTask) => t.id === taskId);
    if (!task) {
      this.error = 'Task not found';
      this.closeApprovalDialog();
      return;
    }

    const processRequest: ProcessTaskRequest = {
      action: action,
      ...(notes && { notes: notes })
    };

    this.processing = true;
    // Use custom_form_response_id instead of task id
    this.workflowTaskService.processTask(task.custom_form_response_id.toString(), processRequest).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        if (response.success) {
          // Show success toast
          const actionText = action === 'approved' ? 'approved' : 'rejected';
          this.toastService.success(
            `Task "${task.title}" has been ${actionText} successfully!`,
            `Task ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`,
            4000
          );
          
          // Remove the task from the list since it's no longer pending approval
          this.allTasks = this.allTasks.filter((t: WorkflowTask) => t.id !== taskId);
          this.pendingTasks = this.pendingTasks.filter((t: WorkflowTask) => t.id !== taskId);
          this.filteredTasks = this.filteredTasks.filter((t: WorkflowTask) => t.id !== taskId);
          
          // Update total items count
          this.totalItems = Math.max(0, this.totalItems - 1);
          
          // Clear selection if it was the updated task
          if (this.selectedTask && this.selectedTask.id === taskId) {
            this.selectedTask = null;
          }
          
          // Close the approval dialog after successful update
          this.closeApprovalDialog();
          this.processing = false;
        } else {
          this.error = response.message || 'Failed to process task';
          this.toastService.error(
            response.message || 'Failed to process task',
            'Processing Failed'
          );
          this.processing = false;
          this.closeApprovalDialog();
        }
      },
      error: (error: any) => {
        this.error = 'Failed to process task';
        this.toastService.error(
          'An unexpected error occurred while processing the task',
          'Processing Failed'
        );
        this.processing = false;
        console.error('Error processing task:', error);
        
        // Close dialog even on error
        this.closeApprovalDialog();
      }
    });
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString();
  }

  getStatusBadgeClass(status: TicketStatus): string {
    switch (status) {
      case TicketStatus.PENDING:
        return 'badge-outline-warning';
      case TicketStatus.RESOLVED:
        return 'badge-outline-success';
      case TicketStatus.CLOSED:
        return 'badge-outline-danger';
      case TicketStatus.IN_PROGRESS:
        return 'badge-outline-info';
      case TicketStatus.OPEN:
        return 'badge-outline-secondary';
      default:
        return 'badge-outline-dark';
    }
  }

  getPriorityBadgeClass(priority: TicketPriority): string {
    switch (priority) {
      case TicketPriority.CRITICAL:
        return 'badge-outline-danger';
      case TicketPriority.HIGH:
        return 'badge-outline-warning';
      case TicketPriority.MEDIUM:
        return 'badge-outline-info';
      case TicketPriority.LOW:
        return 'badge-outline-success';
      default:
        return 'badge-outline-secondary';
    }
  }

  getTypeBadgeClass(type: TicketType): string {
    switch (type) {
      case TicketType.BUG:
        return 'badge-outline-danger';
      case TicketType.FEATURE:
        return 'badge-outline-primary';
      case TicketType.SUPPORT:
        return 'badge-outline-info';
      case TicketType.TASK:
        return 'badge-outline-secondary';
      default:
        return 'badge-outline-dark';
    }
  }
}