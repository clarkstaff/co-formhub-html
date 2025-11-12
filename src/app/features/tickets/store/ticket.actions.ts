import { createAction, props } from '@ngrx/store';
import { 
  Ticket, 
  CreateTicketRequest, 
  UpdateTicketRequest, 
  TicketFilter 
} from '../models/ticket.interface';

// Load Actions
export const loadTickets = createAction(
  '[Ticket] Load Tickets',
  props<{ filter?: TicketFilter }>()
);

export const loadTicketsSuccess = createAction(
  '[Ticket] Load Tickets Success',
  props<{ tickets: Ticket[] }>()
);

export const loadTicketsFailure = createAction(
  '[Ticket] Load Tickets Failure',
  props<{ error: string }>()
);

// Load Single Ticket
export const loadTicket = createAction(
  '[Ticket] Load Ticket',
  props<{ id: string }>()
);

export const loadTicketSuccess = createAction(
  '[Ticket] Load Ticket Success',
  props<{ ticket: Ticket }>()
);

export const loadTicketFailure = createAction(
  '[Ticket] Load Ticket Failure',
  props<{ error: string }>()
);

// Create Actions
export const createTicket = createAction(
  '[Ticket] Create Ticket',
  props<{ ticketData: CreateTicketRequest }>()
);

export const createTicketSuccess = createAction(
  '[Ticket] Create Ticket Success',
  props<{ ticket: Ticket }>()
);

export const createTicketFailure = createAction(
  '[Ticket] Create Ticket Failure',
  props<{ error: string }>()
);

// Update Actions
export const updateTicket = createAction(
  '[Ticket] Update Ticket',
  props<{ ticketData: UpdateTicketRequest }>()
);

export const updateTicketSuccess = createAction(
  '[Ticket] Update Ticket Success',
  props<{ ticket: Ticket }>()
);

export const updateTicketFailure = createAction(
  '[Ticket] Update Ticket Failure',
  props<{ error: string }>()
);

// Delete Actions
export const deleteTicket = createAction(
  '[Ticket] Delete Ticket',
  props<{ id: string }>()
);

export const deleteTicketSuccess = createAction(
  '[Ticket] Delete Ticket Success',
  props<{ id: string }>()
);

export const deleteTicketFailure = createAction(
  '[Ticket] Delete Ticket Failure',
  props<{ error: string }>()
);

// Filter Actions
export const setTicketFilter = createAction(
  '[Ticket] Set Filter',
  props<{ filter: TicketFilter }>()
);

export const clearTicketFilter = createAction(
  '[Ticket] Clear Filter'
);

// Selection Actions
export const selectTicket = createAction(
  '[Ticket] Select Ticket',
  props<{ id: string }>()
);

export const clearSelectedTicket = createAction(
  '[Ticket] Clear Selected Ticket'
);

// UI Actions
export const setLoading = createAction(
  '[Ticket] Set Loading',
  props<{ loading: boolean }>()
);

export const clearError = createAction(
  '[Ticket] Clear Error'
);

// Search Actions
export const searchTickets = createAction(
  '[Ticket] Search Tickets',
  props<{ searchTerm: string }>()
);

export const searchTicketsSuccess = createAction(
  '[Ticket] Search Tickets Success',
  props<{ tickets: Ticket[] }>()
);

export const searchTicketsFailure = createAction(
  '[Ticket] Search Tickets Failure',
  props<{ error: string }>()
);