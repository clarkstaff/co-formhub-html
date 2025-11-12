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
import { TicketService } from '../../services/ticket.service';
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
  selectedTicket: Ticket | null = null;
  showApprovalDialog = false;
  approvalAction: 'approve' | 'reject' | null = null;
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
  pendingTickets: Ticket[] = [];
  allTickets: Ticket[] = [];
  filteredTickets: Ticket[] = [];
  processTypes: string[] = [];
  
  // Loading states
  loading = false;
  error: string | null = null;

  // Enum references for template
  TicketStatus = TicketStatus;
  TicketPriority = TicketPriority;
  TicketType = TicketType;

  constructor(
    private ticketService: TicketService
  ) {}

  ngOnInit() {
    this.loadPendingTickets();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPendingTickets() {
    this.loading = true;
    this.error = null;

    // Load tickets that are in review/pending status for approval
    this.ticketService.getTickets({ 
      status: [TicketStatus.PENDING] 
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (tickets: Ticket[]) => {
        this.pendingTickets = tickets;
        this.allTickets = tickets;
        this.filteredTickets = tickets;
        this.extractProcessTypes(tickets);
        this.loading = false;
      },
      error: (error: any) => {
        this.error = 'Failed to load pending tickets';
        this.loading = false;
        console.error('Error loading tickets:', error);
      }
    });
  }

  private extractProcessTypes(tickets: Ticket[]) {
    const types = ['all', ...new Set(tickets.map(ticket => ticket.type))];
    this.processTypes = types;
  }

  selectTicket(ticket: Ticket) {
    this.selectedTicket = ticket;
  }

  onProcessTypeFilterChange() {
    this.applyFilters();
  }

  searchTickets() {
    this.applyFilters();
  }

  private applyFilters() {
    let filtered = this.pendingTickets;

    // Filter by process type
    if (this.processTypeFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.type === this.processTypeFilter);
    }

    // Filter by search text
    if (this.searchText.trim()) {
      const searchLower = this.searchText.toLowerCase().trim();
      filtered = filtered.filter(ticket => 
        ticket.title.toLowerCase().includes(searchLower) ||
        ticket.description.toLowerCase().includes(searchLower) ||
        ticket.reporterName.toLowerCase().includes(searchLower) ||
        (ticket.assigneeName && ticket.assigneeName.toLowerCase().includes(searchLower))
      );
    }

    this.filteredTickets = filtered;
    this.allTickets = filtered;

    // Clear selection if filtered ticket is no longer visible
    if (this.selectedTicket && !this.filteredTickets.includes(this.selectedTicket)) {
      this.selectedTicket = null;
    }
  }

  setDisplayType(type: 'list' | 'grid'): void {
    this.displayType = type;
  }

  handleApprove(ticketId: string) {
    const ticket = this.allTickets.find(t => t.id === ticketId);
    if (!ticket) return;

    this.approvalAction = 'approve';
    this.selectedTicket = ticket;
    this.confirmationDialogData = {
      title: 'Approve Ticket',
      message: 'Are you sure you want to approve this ticket? It will be marked as resolved.',
      confirmText: 'Approve',
      cancelText: 'Cancel',
      type: 'approve',
      ticketTitle: ticket.title
    };
    this.showApprovalDialog = true;
  }

  handleReject(ticketId: string) {
    const ticket = this.allTickets.find(t => t.id === ticketId);
    if (!ticket) return;

    this.approvalAction = 'reject';
    this.selectedTicket = ticket;
    this.confirmationDialogData = {
      title: 'Reject Ticket',
      message: 'Are you sure you want to reject this ticket? It will be closed.',
      confirmText: 'Reject',
      cancelText: 'Cancel',
      type: 'reject',
      ticketTitle: ticket.title
    };
    this.showApprovalDialog = true;
  }

  onConfirmationResult(result: ConfirmationResult) {
    if (result.confirmed && this.selectedTicket && this.approvalAction) {
      const newStatus = this.approvalAction === 'approve' ? TicketStatus.RESOLVED : TicketStatus.CLOSED;
      this.updateTicketStatus(this.selectedTicket.id, newStatus);
    } else {
      // User cancelled - just close dialog but keep selectedTicket
      this.closeApprovalDialog();
    }
  }

  closeApprovalDialog() {
    this.showApprovalDialog = false;
    this.approvalAction = null;
    // Don't clear selectedTicket here - it should only be cleared when ticket is actually updated
  }

  private updateTicketStatus(ticketId: string, newStatus: TicketStatus, comment?: string) {
    const updateRequest: UpdateTicketRequest = {
      id: ticketId,
      status: newStatus,
      ...(comment && { description: comment }) // Add comment if provided
    };

    this.loading = true;
    this.ticketService.updateTicket(updateRequest).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        // Remove the ticket from the list since it's no longer pending
        this.allTickets = this.allTickets.filter(t => t.id !== ticketId);
        this.pendingTickets = this.pendingTickets.filter(t => t.id !== ticketId);
        
        // Clear selection if it was the updated ticket
        if (this.selectedTicket && this.selectedTicket.id === ticketId) {
          this.selectedTicket = null;
        }
        
        // Close the approval dialog after successful update
        this.closeApprovalDialog();
        
        this.loading = false;
      },
      error: (error: any) => {
        this.error = `Failed to update ticket status`;
        this.loading = false;
        console.error('Error updating ticket:', error);
        
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