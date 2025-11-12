import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ticket } from '../../store';

@Component({
  selector: 'app-approval-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './approval-card.component.html',
  styleUrl: './approval-card.component.css'
})
export class ApprovalCardComponent {
  @Input() ticket!: Ticket;
  @Input() isSelected: boolean = false;
  @Output() selectTicket = new EventEmitter<Ticket>();

  onCardClick() {
    this.selectTicket.emit(this.ticket);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  formatProcessType(type: string): string {
    return type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }
}
