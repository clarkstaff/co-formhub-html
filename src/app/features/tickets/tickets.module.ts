import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketsRoutingModule } from './tickets-routing.module';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

// Store
import { ticketReducer } from './store/ticket.reducer';
import { TicketEffects } from './store/ticket.effects';

// Services
import { TicketService } from './services/ticket.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    TicketsRoutingModule,
    StoreModule.forFeature('tickets', ticketReducer),
    EffectsModule.forFeature([TicketEffects])
  ],
  providers: [
    TicketService
  ]
})
export class TicketsModule { }
