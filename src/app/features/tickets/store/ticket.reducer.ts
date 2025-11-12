import { createReducer, on } from '@ngrx/store';
import { TicketState, initialTicketState } from './ticket.state';
import * as TicketActions from './ticket.actions';

export const ticketReducer = createReducer(
  initialTicketState,

  // Load Tickets
  on(TicketActions.loadTickets, (state, { filter }) => ({
    ...state,
    loading: true,
    error: null,
    filter: filter || state.filter
  })),

  on(TicketActions.loadTicketsSuccess, (state, { tickets }) => ({
    ...state,
    loading: false,
    tickets,
    error: null,
    lastLoaded: new Date(),
    totalCount: tickets.length
  })),

  on(TicketActions.loadTicketsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Load Single Ticket
  on(TicketActions.loadTicket, (state) => ({
    ...state,
    loadingTicket: true,
    loadTicketError: null
  })),

  on(TicketActions.loadTicketSuccess, (state, { ticket }) => {
    const existingIndex = state.tickets.findIndex(t => t.id === ticket.id);
    const updatedTickets = existingIndex >= 0
      ? state.tickets.map((t, index) => index === existingIndex ? ticket : t)
      : [...state.tickets, ticket];

    return {
      ...state,
      loadingTicket: false,
      selectedTicket: ticket,
      tickets: updatedTickets,
      loadTicketError: null
    };
  }),

  on(TicketActions.loadTicketFailure, (state, { error }) => ({
    ...state,
    loadingTicket: false,
    loadTicketError: error
  })),

  // Create Ticket
  on(TicketActions.createTicket, (state) => ({
    ...state,
    creating: true,
    createError: null
  })),

  on(TicketActions.createTicketSuccess, (state, { ticket }) => ({
    ...state,
    creating: false,
    tickets: [ticket, ...state.tickets],
    createError: null,
    totalCount: state.totalCount + 1
  })),

  on(TicketActions.createTicketFailure, (state, { error }) => ({
    ...state,
    creating: false,
    createError: error
  })),

  // Update Ticket
  on(TicketActions.updateTicket, (state) => ({
    ...state,
    updating: true,
    updateError: null
  })),

  on(TicketActions.updateTicketSuccess, (state, { ticket }) => {
    const updatedTickets = state.tickets.map(t => 
      t.id === ticket.id ? ticket : t
    );

    return {
      ...state,
      updating: false,
      tickets: updatedTickets,
      selectedTicket: state.selectedTicket?.id === ticket.id ? ticket : state.selectedTicket,
      updateError: null
    };
  }),

  on(TicketActions.updateTicketFailure, (state, { error }) => ({
    ...state,
    updating: false,
    updateError: error
  })),

  // Delete Ticket
  on(TicketActions.deleteTicket, (state) => ({
    ...state,
    deleting: true,
    deleteError: null
  })),

  on(TicketActions.deleteTicketSuccess, (state, { id }) => {
    const filteredTickets = state.tickets.filter(t => t.id !== id);

    return {
      ...state,
      deleting: false,
      tickets: filteredTickets,
      selectedTicket: state.selectedTicket?.id === id ? null : state.selectedTicket,
      deleteError: null,
      totalCount: state.totalCount - 1
    };
  }),

  on(TicketActions.deleteTicketFailure, (state, { error }) => ({
    ...state,
    deleting: false,
    deleteError: error
  })),

  // Filter Actions
  on(TicketActions.setTicketFilter, (state, { filter }) => ({
    ...state,
    filter: { ...state.filter, ...filter }
  })),

  on(TicketActions.clearTicketFilter, (state) => ({
    ...state,
    filter: {}
  })),

  // Selection Actions
  on(TicketActions.selectTicket, (state, { id }) => {
    const selectedTicket = state.tickets.find(t => t.id === id) || null;
    return {
      ...state,
      selectedTicket
    };
  }),

  on(TicketActions.clearSelectedTicket, (state) => ({
    ...state,
    selectedTicket: null
  })),

  // Search Actions
  on(TicketActions.searchTickets, (state, { searchTerm }) => ({
    ...state,
    searching: true,
    searchTerm,
    searchError: null
  })),

  on(TicketActions.searchTicketsSuccess, (state, { tickets }) => ({
    ...state,
    searching: false,
    tickets,
    searchError: null
  })),

  on(TicketActions.searchTicketsFailure, (state, { error }) => ({
    ...state,
    searching: false,
    searchError: error
  })),

  // UI Actions
  on(TicketActions.setLoading, (state, { loading }) => ({
    ...state,
    loading
  })),

  on(TicketActions.clearError, (state) => ({
    ...state,
    error: null,
    loadTicketError: null,
    createError: null,
    updateError: null,
    deleteError: null,
    searchError: null
  }))
);