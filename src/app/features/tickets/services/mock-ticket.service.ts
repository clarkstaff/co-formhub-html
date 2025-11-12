import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { 
  Ticket, 
  TicketStatus, 
  TicketPriority, 
  TicketType,
  TicketFilter 
} from '../models/ticket.interface';

@Injectable({
  providedIn: 'root'
})
export class MockTicketService {
  
  private mockTickets: Ticket[] = [
    {
      id: '1',
      title: 'Employee Leave Request - John Doe',
      description: 'Request for 5 days annual leave from December 1-5, 2024 for family vacation.',
      status: TicketStatus.PENDING,
      priority: TicketPriority.MEDIUM,
      type: TicketType.SUPPORT,
      assigneeId: 'mgr-001',
      assigneeName: 'Sarah Johnson',
      reporterId: 'emp-001',
      reporterName: 'John Doe',
      createdAt: new Date('2024-11-01T09:00:00Z'),
      updatedAt: new Date('2024-11-01T09:00:00Z'),
      dueDate: new Date('2024-11-15T17:00:00Z'),
      tags: ['hr', 'leave', 'vacation']
    },
    {
      id: '2',
      title: 'Budget Approval for Q1 Marketing Campaign',
      description: 'Requesting approval for $50,000 budget allocation for Q1 2025 digital marketing campaign targeting new customer acquisition.',
      status: TicketStatus.PENDING,
      priority: TicketPriority.HIGH,
      type: TicketType.TASK,
      assigneeId: 'dir-001',
      assigneeName: 'Michael Chen',
      reporterId: 'mkt-001',
      reporterName: 'Emily Rodriguez',
      createdAt: new Date('2024-11-02T14:30:00Z'),
      updatedAt: new Date('2024-11-02T14:30:00Z'),
      dueDate: new Date('2024-11-20T17:00:00Z'),
      tags: ['budget', 'marketing', 'q1-2025']
    },
    {
      id: '3',
      title: 'IT Equipment Purchase Authorization',
      description: 'Need approval for purchasing 10 new laptops for the development team. Total cost: $25,000. Specifications attached.',
      status: TicketStatus.PENDING,
      priority: TicketPriority.HIGH,
      type: TicketType.FEATURE,
      assigneeId: 'cto-001',
      assigneeName: 'David Kim',
      reporterId: 'it-001',
      reporterName: 'Alex Thompson',
      createdAt: new Date('2024-11-03T11:15:00Z'),
      updatedAt: new Date('2024-11-03T11:15:00Z'),
      dueDate: new Date('2024-11-25T17:00:00Z'),
      tags: ['it', 'equipment', 'laptops'],
      attachments: [
        {
          id: 'att-001',
          fileName: 'laptop-specifications.pdf',
          fileUrl: '/attachments/laptop-specs.pdf',
          fileSize: 2048576,
          uploadedAt: new Date('2024-11-03T11:20:00Z')
        }
      ]
    },
    {
      id: '4',
      title: 'Vendor Contract Renewal - CloudTech Solutions',
      description: 'Annual contract renewal for CloudTech Solutions cloud hosting services. Contract value: $120,000/year.',
      status: TicketStatus.PENDING,
      priority: TicketPriority.CRITICAL,
      type: TicketType.TASK,
      assigneeId: 'cfo-001',
      assigneeName: 'Lisa Wang',
      reporterId: 'proc-001',
      reporterName: 'Robert Davis',
      createdAt: new Date('2024-11-04T16:45:00Z'),
      updatedAt: new Date('2024-11-04T16:45:00Z'),
      dueDate: new Date('2024-11-30T17:00:00Z'),
      tags: ['vendor', 'contract', 'renewal', 'critical']
    },
    {
      id: '5',
      title: 'New Hire Access Provisioning - Jane Smith',
      description: 'Set up system access and accounts for new software engineer Jane Smith starting November 15th.',
      status: TicketStatus.PENDING,
      priority: TicketPriority.MEDIUM,
      type: TicketType.TASK,
      assigneeId: 'it-mgr-001',
      assigneeName: 'Tom Wilson',
      reporterId: 'hr-001',
      reporterName: 'Patricia Brown',
      createdAt: new Date('2024-11-05T13:20:00Z'),
      updatedAt: new Date('2024-11-05T13:20:00Z'),
      dueDate: new Date('2024-11-14T17:00:00Z'),
      tags: ['onboarding', 'access', 'new-hire']
    }
  ];

  getMockTickets(filter?: TicketFilter): Observable<Ticket[]> {
    let filteredTickets = [...this.mockTickets];
    
    if (filter) {
      if (filter.status && filter.status.length > 0) {
        filteredTickets = filteredTickets.filter(ticket => 
          filter.status!.includes(ticket.status)
        );
      }
      
      if (filter.priority && filter.priority.length > 0) {
        filteredTickets = filteredTickets.filter(ticket => 
          filter.priority!.includes(ticket.priority)
        );
      }
      
      if (filter.type && filter.type.length > 0) {
        filteredTickets = filteredTickets.filter(ticket => 
          filter.type!.includes(ticket.type)
        );
      }
      
      if (filter.assigneeId) {
        filteredTickets = filteredTickets.filter(ticket => 
          ticket.assigneeId === filter.assigneeId
        );
      }
      
      if (filter.reporterId) {
        filteredTickets = filteredTickets.filter(ticket => 
          ticket.reporterId === filter.reporterId
        );
      }
    }
    
    return of(filteredTickets).pipe(delay(800)); // Simulate network delay
  }

  getMockTicket(id: string): Observable<Ticket> {
    const ticket = this.mockTickets.find(t => t.id === id);
    if (!ticket) {
      throw new Error(`Ticket with id ${id} not found`);
    }
    return of(ticket).pipe(delay(300));
  }

  updateMockTicket(id: string, updates: Partial<Ticket>): Observable<Ticket> {
    const ticketIndex = this.mockTickets.findIndex(t => t.id === id);
    if (ticketIndex === -1) {
      throw new Error(`Ticket with id ${id} not found`);
    }
    
    this.mockTickets[ticketIndex] = {
      ...this.mockTickets[ticketIndex],
      ...updates,
      updatedAt: new Date()
    };
    
    return of(this.mockTickets[ticketIndex]).pipe(delay(500));
  }
}