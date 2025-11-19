import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, take, first } from 'rxjs/operators';

import { 
  Ticket, 
  TicketStatus,
  TicketPriority,
  TicketType,
  UpdateTicketRequest
} from '../../models/ticket.interface';
import { WorkflowTask } from '../../services/workflow-task.service';
import { ToastService } from 'src/app/shared/toast/services/toast.service';
import { IconModule } from 'src/app/shared/icon/icon.module';
import { ApprovalListViewComponent } from '../../components/approval-list-view/approval-list-view.component';
import { ApprovalGridViewComponent } from '../../components/approval-grid-view/approval-grid-view.component';
import { ConfirmationDialogComponent, ConfirmationDialogData, ConfirmationResult } from '../../components/confirmation-dialog/confirmation-dialog.component';
import * as ApprovalBoardActions from '../../store/approval-board.actions';
import * as ApprovalBoardSelectors from '../../store/approval-board.selectors';
import { ApprovalBoardStoreModule } from '../../store/approval-board-store.module';


@Component({
  selector: 'app-approval-board',
  standalone: true,
  imports: [CommonModule, FormsModule, IconModule, ApprovalListViewComponent, ApprovalGridViewComponent, ConfirmationDialogComponent, ApprovalBoardStoreModule],
  templateUrl: './approval-board.component.html',
  styleUrl: './approval-board.component.css'
})
export class ApprovalBoardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // NgRx Selectors (Observable streams)
  tasks$ = this.store.select(ApprovalBoardSelectors.selectFilteredTasks);
  selectedTask$ = this.store.select(ApprovalBoardSelectors.selectSelectedTask);
  processTypes$ = this.store.select(ApprovalBoardSelectors.selectProcessTypes);
  loading$ = this.store.select(ApprovalBoardSelectors.selectLoading);
  processing$ = this.store.select(ApprovalBoardSelectors.selectProcessing);
  error$ = this.store.select(ApprovalBoardSelectors.selectError);
  
  // Pagination
  currentPage$ = this.store.select(ApprovalBoardSelectors.selectCurrentPage);
  totalPages$ = this.store.select(ApprovalBoardSelectors.selectTotalPages);
  totalItems$ = this.store.select(ApprovalBoardSelectors.selectTotalItems);
  itemsPerPage$ = this.store.select(ApprovalBoardSelectors.selectItemsPerPage);
  hasNextPage$ = this.store.select(ApprovalBoardSelectors.selectHasNextPage);
  
  // Filters
  processTypeFilter$ = this.store.select(ApprovalBoardSelectors.selectProcessTypeFilter);
  searchText$ = this.store.select(ApprovalBoardSelectors.selectSearchText);
  displayType$ = this.store.select(ApprovalBoardSelectors.selectDisplayType);
  
  // UI State
  showConfirmationDialog$ = this.store.select(ApprovalBoardSelectors.selectShowConfirmationDialog);
  confirmationDialogData$ = this.store.select(ApprovalBoardSelectors.selectConfirmationDialogData);
  
  // Preferences
  skipApprovalConfirmation$ = this.store.select(ApprovalBoardSelectors.selectSkipApprovalConfirmation);
  skipRejectConfirmation$ = this.store.select(ApprovalBoardSelectors.selectSkipRejectConfirmation);
  hasSkipPreferences$ = this.store.select(ApprovalBoardSelectors.selectHasSkipPreferences);

  // Local reactive properties for template (synchronized with store)
  selectedTask: WorkflowTask | null = null;
  processTypeFilter = 'all';
  searchText = '';
  displayType: 'list' | 'grid' = 'list';
  showApprovalDialog = false;
  confirmationDialogData: ConfirmationDialogData = {
    title: '',
    message: '',
    confirmText: '',
    cancelText: 'Cancel',
    type: 'approve'
  };

  // Keep track of pending task action for confirmation
  private pendingTaskId: string | null = null;
  private pendingAction: 'approved' | 'rejected' | null = null;

  // Enum references for template
  TicketStatus = TicketStatus;
  TicketPriority = TicketPriority;
  TicketType = TicketType;

  constructor(
    private store: Store,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    // Subscribe to store state for local reactive properties
    this.selectedTask$.pipe(takeUntil(this.destroy$))
      .subscribe(task => this.selectedTask = task);
    
    this.processTypeFilter$.pipe(takeUntil(this.destroy$))
      .subscribe(filter => this.processTypeFilter = filter);
    
    this.searchText$.pipe(takeUntil(this.destroy$))
      .subscribe(text => this.searchText = text);
    
    this.displayType$.pipe(takeUntil(this.destroy$))
      .subscribe(type => this.displayType = type);
    
    this.confirmationDialogData$.pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (data) {
          this.confirmationDialogData = data;
        }
      });
    
    this.showConfirmationDialog$.pipe(takeUntil(this.destroy$))
      .subscribe(show => {
        this.showApprovalDialog = show;
        // If dialog is being hidden, clear pending task data
        if (!show) {
          this.pendingTaskId = null;
          this.pendingAction = null;
        }
      });
      
    // Load initial data
    this.loadPendingTasks();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Data Loading
  loadPendingTasks(page: number = 1): void {
    const filters = {
      stage_type: 'approval',
      page: page,
      ...(this.processTypeFilter !== 'all' && { form_type: this.processTypeFilter }),
      ...(this.searchText.trim() && { search: this.searchText.trim() })
    };
    this.store.dispatch(ApprovalBoardActions.loadTasks({ filters, resetData: page === 1 }));
  }

  // Filtering and Search
  onProcessTypeFilterChange(filterType: string): void {
    this.store.dispatch(ApprovalBoardActions.setProcessTypeFilter({ processType: filterType }));
  }

  searchTickets(): void {
    this.store.dispatch(ApprovalBoardActions.setSearchText({ searchText: this.searchText }));
  }

  onSearchTextChange(searchText: string): void {
    this.store.dispatch(ApprovalBoardActions.setSearchText({ searchText }));
  }

  // Display Type
  setDisplayType(type: 'list' | 'grid'): void {
    this.store.dispatch(ApprovalBoardActions.setDisplayType({ displayType: type }));
  }

  toggleDisplayType(): void {
    const newType = this.displayType === 'list' ? 'grid' : 'list';
    this.store.dispatch(ApprovalBoardActions.setDisplayType({ displayType: newType }));
  }

  // Task Selection
  selectTask(task: WorkflowTask): void {
    this.store.dispatch(ApprovalBoardActions.selectTask({ task }));
  }

  selectTicket(ticket: any): void {
    this.selectTask(ticket);
  }

  onTaskSelected(task: WorkflowTask): void {
    this.store.dispatch(ApprovalBoardActions.selectTask({ task }));
  }

  clearSelection(): void {
    this.store.dispatch(ApprovalBoardActions.clearTaskSelection());
  }

  // Pagination
  onPageChange(page: number): void {
    this.store.dispatch(ApprovalBoardActions.changePage({ page }));
    this.loadPendingTasks(page);
  }

  // Task Processing
  handleApprove(taskId: string): void {
    this.pendingTaskId = taskId;
    this.pendingAction = 'approved';
    
    // Check current skip confirmation state (use first() to get current value)
    this.skipApprovalConfirmation$.pipe(first()).subscribe(skip => {
      if (skip) {
        this.store.dispatch(ApprovalBoardActions.processTask({ taskId, action: 'approved' }));
        this.pendingTaskId = null;
        this.pendingAction = null;
      } else {
        // Find task for dialog display
        this.tasks$.pipe(first()).subscribe(tasks => {
          const task = tasks?.find(t => t.id === taskId);
          this.store.dispatch(ApprovalBoardActions.showConfirmationDialog({
            data: {
              title: 'Approve Task',
              message: 'Are you sure you want to approve this task? It will proceed to the next stage.',
              confirmText: 'Approve',
              cancelText: 'Cancel',
              type: 'approve',
              ticketTitle: task?.title
            }
          }));
        });
      }
    });
  }

  handleReject(taskId: string): void {
    this.pendingTaskId = taskId;
    this.pendingAction = 'rejected';
    
    // Check current skip confirmation state (use first() to get current value)
    this.skipRejectConfirmation$.pipe(first()).subscribe(skip => {
      if (skip) {
        this.store.dispatch(ApprovalBoardActions.processTask({ taskId, action: 'rejected' }));
        this.pendingTaskId = null;
        this.pendingAction = null;
      } else {
        // Find task for dialog display
        this.tasks$.pipe(first()).subscribe(tasks => {
          const task = tasks?.find(t => t.id === taskId);
          this.store.dispatch(ApprovalBoardActions.showConfirmationDialog({
            data: {
              title: 'Reject Task',
              message: 'Are you sure you want to reject this task? Please provide a reason.',
              confirmText: 'Reject',
              cancelText: 'Cancel',
              type: 'reject',
              ticketTitle: task?.title
            }
          }));
        });
      }
    });
  }

  handleBulkApprove(taskIds: string[]): void {
    this.store.dispatch(ApprovalBoardActions.processBulkTasks({ 
      taskIds, 
      action: 'approved' 
    }));
  }

  handleBulkReject(taskIds: string[]): void {
    this.store.dispatch(ApprovalBoardActions.processBulkTasks({ 
      taskIds, 
      action: 'rejected' 
    }));
  }

  // Confirmation Dialog
  onConfirmationResult(result: ConfirmationResult): void {
    if (result.confirmed && this.pendingTaskId && this.pendingAction) {
      // Store skip confirmation preferences if requested
      if (result.skipNextTime) {
        if (this.pendingAction === 'approved') {
          this.store.dispatch(ApprovalBoardActions.setSkipApprovalConfirmation({ skip: true }));
        } else {
          this.store.dispatch(ApprovalBoardActions.setSkipRejectConfirmation({ skip: true }));
        }
      }

      // Process the task
      this.store.dispatch(ApprovalBoardActions.processTask({
        taskId: this.pendingTaskId,
        action: this.pendingAction,
        notes: result.notes || ''
      }));
    } else {
      // User cancelled - hide dialog
      this.store.dispatch(ApprovalBoardActions.hideConfirmationDialog());
    }
    
    // Clear pending task data
    this.pendingTaskId = null;
    this.pendingAction = null;
  }

  closeApprovalDialog(): void {
    this.pendingTaskId = null;
    this.pendingAction = null;
    this.store.dispatch(ApprovalBoardActions.hideConfirmationDialog());
  }

  // Preferences
  resetConfirmationPreferences(): void {
    this.store.dispatch(ApprovalBoardActions.resetConfirmationPreferences());
  }

  // Utility methods for template
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