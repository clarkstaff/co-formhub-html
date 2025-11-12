import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TicketState } from './ticket.state';
import { TicketStatus, TicketPriority, TicketType } from '../models/ticket.interface';

// Feature selector
export const selectTicketState = createFeatureSelector<TicketState>('tickets');

// Basic selectors
export const selectAllTickets = createSelector(
  selectTicketState,
  (state: TicketState) => state.tickets
);

export const selectSelectedTicket = createSelector(
  selectTicketState,
  (state: TicketState) => state.selectedTicket
);

export const selectTicketFilter = createSelector(
  selectTicketState,
  (state: TicketState) => state.filter
);

export const selectSearchTerm = createSelector(
  selectTicketState,
  (state: TicketState) => state.searchTerm
);

// Loading selectors
export const selectTicketsLoading = createSelector(
  selectTicketState,
  (state: TicketState) => state.loading
);

export const selectTicketLoading = createSelector(
  selectTicketState,
  (state: TicketState) => state.loadingTicket
);

export const selectTicketCreating = createSelector(
  selectTicketState,
  (state: TicketState) => state.creating
);

export const selectTicketUpdating = createSelector(
  selectTicketState,
  (state: TicketState) => state.updating
);

export const selectTicketDeleting = createSelector(
  selectTicketState,
  (state: TicketState) => state.deleting
);

export const selectTicketSearching = createSelector(
  selectTicketState,
  (state: TicketState) => state.searching
);

export const selectAnyLoading = createSelector(
  selectTicketsLoading,
  selectTicketLoading,
  selectTicketCreating,
  selectTicketUpdating,
  selectTicketDeleting,
  selectTicketSearching,
  (loading, loadingTicket, creating, updating, deleting, searching) =>
    loading || loadingTicket || creating || updating || deleting || searching
);

// Error selectors
export const selectTicketsError = createSelector(
  selectTicketState,
  (state: TicketState) => state.error
);

export const selectLoadTicketError = createSelector(
  selectTicketState,
  (state: TicketState) => state.loadTicketError
);

export const selectCreateTicketError = createSelector(
  selectTicketState,
  (state: TicketState) => state.createError
);

export const selectUpdateTicketError = createSelector(
  selectTicketState,
  (state: TicketState) => state.updateError
);

export const selectDeleteTicketError = createSelector(
  selectTicketState,
  (state: TicketState) => state.deleteError
);

export const selectSearchTicketError = createSelector(
  selectTicketState,
  (state: TicketState) => state.searchError
);

export const selectAnyError = createSelector(
  selectTicketsError,
  selectLoadTicketError,
  selectCreateTicketError,
  selectUpdateTicketError,
  selectDeleteTicketError,
  selectSearchTicketError,
  (error, loadError, createError, updateError, deleteError, searchError) =>
    error || loadError || createError || updateError || deleteError || searchError
);

// Pagination selectors
export const selectCurrentPage = createSelector(
  selectTicketState,
  (state: TicketState) => state.currentPage
);

export const selectPageSize = createSelector(
  selectTicketState,
  (state: TicketState) => state.pageSize
);

export const selectTotalCount = createSelector(
  selectTicketState,
  (state: TicketState) => state.totalCount
);

export const selectTotalPages = createSelector(
  selectTotalCount,
  selectPageSize,
  (totalCount, pageSize) => Math.ceil(totalCount / pageSize)
);

// Filtered tickets selectors
export const selectFilteredTickets = createSelector(
  selectAllTickets,
  selectTicketFilter,
  selectSearchTerm,
  (tickets, filter, searchTerm) => {
    let filteredTickets = [...tickets];

    // Apply search term
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filteredTickets = filteredTickets.filter(ticket =>
        ticket.title.toLowerCase().includes(lowerSearchTerm) ||
        ticket.description.toLowerCase().includes(lowerSearchTerm) ||
        ticket.assigneeName?.toLowerCase().includes(lowerSearchTerm) ||
        ticket.reporterName.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Apply status filter
    if (filter.status && filter.status.length > 0) {
      filteredTickets = filteredTickets.filter(ticket =>
        filter.status!.includes(ticket.status)
      );
    }

    // Apply priority filter
    if (filter.priority && filter.priority.length > 0) {
      filteredTickets = filteredTickets.filter(ticket =>
        filter.priority!.includes(ticket.priority)
      );
    }

    // Apply type filter
    if (filter.type && filter.type.length > 0) {
      filteredTickets = filteredTickets.filter(ticket =>
        filter.type!.includes(ticket.type)
      );
    }

    // Apply assignee filter
    if (filter.assigneeId) {
      filteredTickets = filteredTickets.filter(ticket =>
        ticket.assigneeId === filter.assigneeId
      );
    }

    // Apply reporter filter
    if (filter.reporterId) {
      filteredTickets = filteredTickets.filter(ticket =>
        ticket.reporterId === filter.reporterId
      );
    }

    // Apply date range filter
    if (filter.dateFrom || filter.dateTo) {
      filteredTickets = filteredTickets.filter(ticket => {
        const ticketDate = new Date(ticket.createdAt);
        const isAfterFrom = !filter.dateFrom || ticketDate >= filter.dateFrom;
        const isBeforeTo = !filter.dateTo || ticketDate <= filter.dateTo;
        return isAfterFrom && isBeforeTo;
      });
    }

    return filteredTickets;
  }
);

// Statistics selectors
export const selectTicketsByStatus = createSelector(
  selectAllTickets,
  (tickets) => {
    return tickets.reduce((acc, ticket) => {
      acc[ticket.status] = (acc[ticket.status] || 0) + 1;
      return acc;
    }, {} as Record<TicketStatus, number>);
  }
);

export const selectTicketsByPriority = createSelector(
  selectAllTickets,
  (tickets) => {
    return tickets.reduce((acc, ticket) => {
      acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
      return acc;
    }, {} as Record<TicketPriority, number>);
  }
);

export const selectTicketsByType = createSelector(
  selectAllTickets,
  (tickets) => {
    return tickets.reduce((acc, ticket) => {
      acc[ticket.type] = (acc[ticket.type] || 0) + 1;
      return acc;
    }, {} as Record<TicketType, number>);
  }
);

export const selectOpenTicketsCount = createSelector(
  selectAllTickets,
  (tickets) => tickets.filter(t => 
    t.status === TicketStatus.OPEN || t.status === TicketStatus.IN_PROGRESS
  ).length
);

export const selectClosedTicketsCount = createSelector(
  selectAllTickets,
  (tickets) => tickets.filter(t => 
    t.status === TicketStatus.RESOLVED || t.status === TicketStatus.CLOSED
  ).length
);

export const selectHighPriorityTicketsCount = createSelector(
  selectAllTickets,
  (tickets) => tickets.filter(t => 
    t.priority === TicketPriority.HIGH || t.priority === TicketPriority.CRITICAL
  ).length
);

// Specific ticket selectors
export const selectTicketById = (id: string) =>
  createSelector(
    selectAllTickets,
    (tickets) => tickets.find(ticket => ticket.id === id) || null
  );

export const selectTicketsByAssignee = (assigneeId: string) =>
  createSelector(
    selectAllTickets,
    (tickets) => tickets.filter(ticket => ticket.assigneeId === assigneeId)
  );

export const selectTicketsByReporter = (reporterId: string) =>
  createSelector(
    selectAllTickets,
    (tickets) => tickets.filter(ticket => ticket.reporterId === reporterId)
  );

// Cache selectors
export const selectLastLoaded = createSelector(
  selectTicketState,
  (state: TicketState) => state.lastLoaded
);

export const selectIsStale = createSelector(
  selectLastLoaded,
  (lastLoaded) => {
    if (!lastLoaded) return true;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return lastLoaded < fiveMinutesAgo;
  }
);