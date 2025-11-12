import { Ticket, TicketFilter } from '../models/ticket.interface';

export interface TicketState {
  // Data
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  
  // Loading states
  loading: boolean;
  loadingTicket: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  searching: boolean;
  
  // Error states
  error: string | null;
  loadTicketError: string | null;
  createError: string | null;
  updateError: string | null;
  deleteError: string | null;
  searchError: string | null;
  
  // UI state
  filter: TicketFilter;
  searchTerm: string;
  
  // Pagination
  currentPage: number;
  pageSize: number;
  totalCount: number;
  
  // Cache
  lastLoaded: Date | null;
}

export const initialTicketState: TicketState = {
  // Data
  tickets: [],
  selectedTicket: null,
  
  // Loading states
  loading: false,
  loadingTicket: false,
  creating: false,
  updating: false,
  deleting: false,
  searching: false,
  
  // Error states
  error: null,
  loadTicketError: null,
  createError: null,
  updateError: null,
  deleteError: null,
  searchError: null,
  
  // UI state
  filter: {},
  searchTerm: '',
  
  // Pagination
  currentPage: 1,
  pageSize: 10,
  totalCount: 0,
  
  // Cache
  lastLoaded: null
};