import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, switchMap } from 'rxjs/operators';

import { TicketService } from '../services/ticket.service';
import * as TicketActions from './ticket.actions';

@Injectable()
export class TicketEffects {

  constructor(
    private actions$: Actions,
    private ticketService: TicketService
  ) {}

  // Load tickets effect
  loadTickets$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TicketActions.loadTickets),
      switchMap(action =>
        this.ticketService.getTickets(action.filter).pipe(
          map(tickets => TicketActions.loadTicketsSuccess({ tickets })),
          catchError(error => of(TicketActions.loadTicketsFailure({ 
            error: error.message || 'Failed to load tickets' 
          })))
        )
      )
    )
  );

  // Load single ticket effect
  loadTicket$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TicketActions.loadTicket),
      switchMap(action =>
        this.ticketService.getTicket(action.id).pipe(
          map(ticket => TicketActions.loadTicketSuccess({ ticket })),
          catchError(error => of(TicketActions.loadTicketFailure({ 
            error: error.message || 'Failed to load ticket' 
          })))
        )
      )
    )
  );

  // Create ticket effect
  createTicket$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TicketActions.createTicket),
      mergeMap(action =>
        this.ticketService.createTicket(action.ticketData).pipe(
          map(ticket => TicketActions.createTicketSuccess({ ticket })),
          catchError(error => of(TicketActions.createTicketFailure({ 
            error: error.message || 'Failed to create ticket' 
          })))
        )
      )
    )
  );

  // Update ticket effect
  updateTicket$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TicketActions.updateTicket),
      mergeMap(action =>
        this.ticketService.updateTicket(action.ticketData).pipe(
          map(ticket => TicketActions.updateTicketSuccess({ ticket })),
          catchError(error => of(TicketActions.updateTicketFailure({ 
            error: error.message || 'Failed to update ticket' 
          })))
        )
      )
    )
  );

  // Delete ticket effect
  deleteTicket$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TicketActions.deleteTicket),
      mergeMap(action =>
        this.ticketService.deleteTicket(action.id).pipe(
          map(() => TicketActions.deleteTicketSuccess({ id: action.id })),
          catchError(error => of(TicketActions.deleteTicketFailure({ 
            error: error.message || 'Failed to delete ticket' 
          })))
        )
      )
    )
  );

  // Search tickets effect
  searchTickets$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TicketActions.searchTickets),
      switchMap(action =>
        this.ticketService.searchTickets(action.searchTerm).pipe(
          map(tickets => TicketActions.searchTicketsSuccess({ tickets })),
          catchError(error => of(TicketActions.searchTicketsFailure({ 
            error: error.message || 'Failed to search tickets' 
          })))
        )
      )
    )
  );
}