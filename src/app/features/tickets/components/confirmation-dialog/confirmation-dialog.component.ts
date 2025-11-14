import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  type: 'approve' | 'reject';
  ticketTitle?: string;
}

export interface ConfirmationResult {
  confirmed: boolean;
  skipNextTime: boolean;
  notes?: string;
}

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.css'
})
export class ConfirmationDialogComponent {
  @Input() isOpen: boolean = false;
  @Input() data: ConfirmationDialogData = {
    title: 'Confirm Action',
    message: 'Are you sure?',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'approve'
  };

  @Output() result = new EventEmitter<ConfirmationResult>();
  @Output() close = new EventEmitter<void>();

  skipNextTime: boolean = false;
  notes: string = '';

  onConfirm() {
    this.result.emit({
      confirmed: true,
      skipNextTime: this.skipNextTime,
      notes: this.notes
    });
    this.onClose();
  }

  onCancel() {
    this.result.emit({
      confirmed: false,
      skipNextTime: this.skipNextTime,
      notes: this.notes
    });
    this.onClose();
  }

  onClose() {
    this.skipNextTime = false;
    this.notes = '';
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  getIconClass(): string {
    return this.data.type === 'approve' 
      ? 'text-green-600' 
      : 'text-red-600';
  }

  getConfirmButtonClass(): string {
    return this.data.type === 'approve'
      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
      : 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
  }
}