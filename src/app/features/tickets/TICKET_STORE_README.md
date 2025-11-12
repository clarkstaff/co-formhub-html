# Ticket Store Documentation

This document explains how to use the NgRx-based ticket store system that has been generated for the tickets feature module.

## Overview

The ticket store provides a complete state management solution for handling tickets in your application. It includes:

- **Actions**: For triggering state changes
- **Reducer**: For handling state updates
- **Selectors**: For accessing state data
- **Effects**: For handling side effects (API calls)
- **Models**: TypeScript interfaces for type safety

## Architecture

```
/src/app/features/tickets/
├── models/
│   └── ticket.interface.ts    # Ticket models and enums
├── services/
│   └── ticket.service.ts      # HTTP service for API calls
└── store/
    ├── index.ts               # Barrel exports
    ├── ticket.actions.ts      # NgRx actions
    ├── ticket.effects.ts      # NgRx effects
    ├── ticket.reducer.ts      # NgRx reducer
    ├── ticket.selectors.ts    # NgRx selectors
    └── ticket.state.ts        # State interface
```

## Usage Examples

### 1. Component Setup

```typescript
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import {
  Ticket,
  TicketStatus,
  TicketPriority,
  loadTickets,
  selectAllTickets,
  selectTicketsLoading,
  selectTicketsError
} from '../store';

@Component({
  selector: 'app-ticket-list',
  template: `
    <div *ngIf="loading$ | async">Loading...</div>
    <div *ngIf="error$ | async as error">{{ error }}</div>
    
    <div *ngFor="let ticket of tickets$ | async">
      <h3>{{ ticket.title }}</h3>
      <p>{{ ticket.description }}</p>
      <span [class]="getPriorityClass(ticket.priority)">
        {{ ticket.priority }}
      </span>
    </div>
  `
})
export class TicketListComponent implements OnInit {
  tickets$: Observable<Ticket[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  constructor(private store: Store) {
    this.tickets$ = this.store.select(selectAllTickets);
    this.loading$ = this.store.select(selectTicketsLoading);
    this.error$ = this.store.select(selectTicketsError);
  }

  ngOnInit() {
    // Load all tickets
    this.store.dispatch(loadTickets({}));
  }

  getPriorityClass(priority: TicketPriority): string {
    return `priority-${priority}`;
  }
}
```

### 2. Loading Tickets with Filters

```typescript
import { TicketStatus, TicketPriority, loadTickets } from '../store';

// Load tickets with filters
loadTicketsWithFilter() {
  this.store.dispatch(loadTickets({
    filter: {
      status: [TicketStatus.OPEN, TicketStatus.IN_PROGRESS],
      priority: [TicketPriority.HIGH, TicketPriority.CRITICAL],
      assigneeId: 'user-123'
    }
  }));
}
```

### 3. Creating a New Ticket

```typescript
import { createTicket, TicketPriority, TicketType } from '../store';

createNewTicket() {
  this.store.dispatch(createTicket({
    ticketData: {
      title: 'New Bug Report',
      description: 'Description of the bug',
      priority: TicketPriority.HIGH,
      type: TicketType.BUG,
      assigneeId: 'user-456',
      dueDate: new Date('2024-12-31'),
      tags: ['bug', 'urgent']
    }
  }));
}
```

### 4. Updating a Ticket

```typescript
import { updateTicket, TicketStatus } from '../store';

updateTicketStatus(ticketId: string, newStatus: TicketStatus) {
  this.store.dispatch(updateTicket({
    ticketData: {
      id: ticketId,
      status: newStatus
    }
  }));
}
```

### 5. Deleting a Ticket

```typescript
import { deleteTicket } from '../store';

deleteTicketById(ticketId: string) {
  this.store.dispatch(deleteTicket({ id: ticketId }));
}
```

### 6. Searching Tickets

```typescript
import { searchTickets } from '../store';

searchForTickets(searchTerm: string) {
  this.store.dispatch(searchTickets({ searchTerm }));
}
```

### 7. Using Advanced Selectors

```typescript
import {
  selectFilteredTickets,
  selectTicketsByStatus,
  selectOpenTicketsCount,
  selectHighPriorityTicketsCount,
  selectTicketById
} from '../store';

export class TicketDashboardComponent {
  // Get filtered tickets based on current filters
  filteredTickets$ = this.store.select(selectFilteredTickets);
  
  // Get ticket counts by status
  ticketsByStatus$ = this.store.select(selectTicketsByStatus);
  
  // Get count of open tickets
  openTicketsCount$ = this.store.select(selectOpenTicketsCount);
  
  // Get count of high priority tickets
  highPriorityCount$ = this.store.select(selectHighPriorityTicketsCount);
  
  // Get specific ticket by ID
  getTicketById(id: string) {
    return this.store.select(selectTicketById(id));
  }
}
```

### 8. Setting Filters

```typescript
import { setTicketFilter, clearTicketFilter } from '../store';

applyStatusFilter(statuses: TicketStatus[]) {
  this.store.dispatch(setTicketFilter({
    filter: { status: statuses }
  }));
}

clearAllFilters() {
  this.store.dispatch(clearTicketFilter());
}
```

### 9. Handling Loading States

```typescript
import {
  selectTicketsLoading,
  selectTicketCreating,
  selectTicketUpdating,
  selectAnyLoading
} from '../store';

export class TicketComponent {
  isLoading$ = this.store.select(selectTicketsLoading);
  isCreating$ = this.store.select(selectTicketCreating);
  isUpdating$ = this.store.select(selectTicketUpdating);
  isAnyOperationInProgress$ = this.store.select(selectAnyLoading);
}
```

## Available Actions

### Load Actions
- `loadTickets({ filter? })` - Load tickets with optional filtering
- `loadTicket({ id })` - Load a single ticket by ID

### CRUD Actions
- `createTicket({ ticketData })` - Create a new ticket
- `updateTicket({ ticketData })` - Update an existing ticket
- `deleteTicket({ id })` - Delete a ticket

### Search Actions
- `searchTickets({ searchTerm })` - Search tickets by term

### Filter Actions
- `setTicketFilter({ filter })` - Apply filters to ticket list
- `clearTicketFilter()` - Clear all filters

### Selection Actions
- `selectTicket({ id })` - Select a ticket
- `clearSelectedTicket()` - Clear selected ticket

### UI Actions
- `setLoading({ loading })` - Set loading state
- `clearError()` - Clear all errors

## Available Selectors

### Data Selectors
- `selectAllTickets` - Get all tickets
- `selectSelectedTicket` - Get currently selected ticket
- `selectFilteredTickets` - Get filtered tickets based on current filters

### Loading Selectors
- `selectTicketsLoading` - Get loading state for tickets list
- `selectTicketCreating` - Get creating state
- `selectTicketUpdating` - Get updating state
- `selectAnyLoading` - Get any loading state

### Error Selectors
- `selectTicketsError` - Get tickets loading error
- `selectCreateTicketError` - Get create error
- `selectUpdateTicketError` - Get update error
- `selectAnyError` - Get any error state

### Statistics Selectors
- `selectTicketsByStatus` - Get tickets grouped by status
- `selectTicketsByPriority` - Get tickets grouped by priority
- `selectOpenTicketsCount` - Get count of open tickets
- `selectHighPriorityTicketsCount` - Get count of high priority tickets

### Specific Selectors
- `selectTicketById(id)` - Get ticket by specific ID
- `selectTicketsByAssignee(assigneeId)` - Get tickets by assignee
- `selectTicketsByReporter(reporterId)` - Get tickets by reporter

## Ticket Interface

```typescript
interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  type: TicketType;
  assigneeId?: string;
  assigneeName?: string;
  reporterId: string;
  reporterName: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  tags?: string[];
  attachments?: TicketAttachment[];
}
```

## Enums

```typescript
enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  PENDING = 'pending',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

enum TicketType {
  BUG = 'bug',
  FEATURE = 'feature',
  SUPPORT = 'support',
  TASK = 'task'
}
```

## Error Handling

The store automatically handles errors from API calls and provides error selectors:

```typescript
constructor(private store: Store) {
  // Subscribe to errors and show user feedback
  this.store.select(selectAnyError).subscribe(error => {
    if (error) {
      // Show error message to user
      this.showErrorMessage(error);
    }
  });
}
```

## Performance Considerations

1. **Use filtered selectors**: Use `selectFilteredTickets` instead of filtering in components
2. **Check loading states**: Use loading selectors to show appropriate UI feedback
3. **Handle errors**: Always subscribe to error selectors for user feedback
4. **Cache awareness**: The store includes cache invalidation logic

## Integration with Forms

```typescript
// Reactive form for creating tickets
createTicketForm = this.fb.group({
  title: ['', Validators.required],
  description: ['', Validators.required],
  priority: [TicketPriority.MEDIUM],
  type: [TicketType.TASK],
  assigneeId: [''],
  dueDate: ['']
});

onSubmit() {
  if (this.createTicketForm.valid) {
    this.store.dispatch(createTicket({
      ticketData: this.createTicketForm.value
    }));
  }
}
```

This store provides a robust foundation for managing ticket state throughout your application with proper TypeScript typing, error handling, and performance optimization.