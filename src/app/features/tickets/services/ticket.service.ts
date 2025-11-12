import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Ticket, 
  CreateTicketRequest, 
  UpdateTicketRequest, 
  TicketFilter 
} from '../models/ticket.interface';
import { MockTicketService } from './mock-ticket.service';
import { CustomFormTaskService } from './custom-form-task.service';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private readonly baseUrl = '/api/tickets';
  private readonly useMockData = false; // Switch to real API for custom form tasks

  constructor(
    private http: HttpClient,
    private mockService: MockTicketService,
    private customFormTaskService: CustomFormTaskService
  ) { }

  // Get all tickets with optional filtering
  getTickets(filter?: TicketFilter): Observable<Ticket[]> {
    if (this.useMockData) {
      return this.mockService.getMockTickets(filter);
    }

    // For pending status, use custom form tasks
    if (filter?.status && filter.status.includes('pending' as any)) {
      console.log('TicketService: Fetching pending custom form tasks');
      return this.customFormTaskService.getPendingTasks();
    }

    console.log('TicketService: Using regular ticket endpoint');
    let params = new HttpParams();
    
    if (filter) {
      if (filter.status && filter.status.length > 0) {
        filter.status.forEach(status => {
          params = params.append('status', status);
        });
      }
      
      if (filter.priority && filter.priority.length > 0) {
        filter.priority.forEach(priority => {
          params = params.append('priority', priority);
        });
      }
      
      if (filter.type && filter.type.length > 0) {
        filter.type.forEach(type => {
          params = params.append('type', type);
        });
      }
      
      if (filter.assigneeId) {
        params = params.set('assigneeId', filter.assigneeId);
      }
      
      if (filter.reporterId) {
        params = params.set('reporterId', filter.reporterId);
      }
      
      if (filter.search) {
        params = params.set('search', filter.search);
      }
      
      if (filter.dateFrom) {
        params = params.set('dateFrom', filter.dateFrom.toISOString());
      }
      
      if (filter.dateTo) {
        params = params.set('dateTo', filter.dateTo.toISOString());
      }
    }

    return this.http.get<Ticket[]>(this.baseUrl, { params });
  }

  // Get a single ticket by ID
  getTicket(id: string): Observable<Ticket> {
    if (this.useMockData) {
      return this.mockService.getMockTicket(id);
    }

    return this.http.get<Ticket>(`${this.baseUrl}/${id}`);
  }

  // Create a new ticket
  createTicket(ticketData: CreateTicketRequest): Observable<Ticket> {
    return this.http.post<Ticket>(this.baseUrl, ticketData);
  }

  // Update an existing ticket
  updateTicket(ticketData: UpdateTicketRequest): Observable<Ticket> {
    if (this.useMockData) {
      return this.mockService.updateMockTicket(ticketData.id, ticketData);
    }

    // Handle custom form task approval/rejection
    if (ticketData.status === 'resolved' || ticketData.status === 'closed') {
      // Find the original ticket to get custom form data
      const taskId = parseInt(ticketData.id);
      if (ticketData.status === 'resolved') {
        return this.customFormTaskService.approveTask(taskId, ticketData.description);
      } else {
        return this.customFormTaskService.rejectTask(taskId, ticketData.description);
      }
    }

    return this.http.put<Ticket>(`${this.baseUrl}/${ticketData.id}`, ticketData);
  }

  // Delete a ticket
  deleteTicket(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Search tickets
  searchTickets(searchTerm: string): Observable<Ticket[]> {
    const params = new HttpParams().set('q', searchTerm);
    return this.http.get<Ticket[]>(`${this.baseUrl}/search`, { params });
  }

  // Get tickets by assignee
  getTicketsByAssignee(assigneeId: string): Observable<Ticket[]> {
    const params = new HttpParams().set('assigneeId', assigneeId);
    return this.http.get<Ticket[]>(`${this.baseUrl}/by-assignee`, { params });
  }

  // Get tickets by reporter
  getTicketsByReporter(reporterId: string): Observable<Ticket[]> {
    const params = new HttpParams().set('reporterId', reporterId);
    return this.http.get<Ticket[]>(`${this.baseUrl}/by-reporter`, { params });
  }

  // Upload attachment for a ticket
  uploadAttachment(ticketId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}/${ticketId}/attachments`, formData);
  }

  // Delete attachment
  deleteAttachment(ticketId: string, attachmentId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${ticketId}/attachments/${attachmentId}`);
  }
}
