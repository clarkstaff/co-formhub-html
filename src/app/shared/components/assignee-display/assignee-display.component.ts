import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketAssignee } from '../../../features/tickets/models/ticket.interface';

@Component({
  selector: 'app-assignee-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="assignee-display" [class]="cssClass">
      <ng-container [ngSwitch]="displayMode">
        <!-- Compact display - just names -->
        <div *ngSwitchCase="'compact'" class="compact-display">
          <span class="assignee-text" [title]="fullAssigneeTooltip">
            {{ displayText }}
          </span>
          <span *ngIf="hasMultipleAssignees" class="badge badge-secondary ms-1">
            +{{ additionalCount }}
          </span>
        </div>
        
        <!-- Detailed display - show all assignees with types -->
        <div *ngSwitchCase="'detailed'" class="detailed-display">
          <div 
            *ngFor="let assignee of assigneeDetails; trackBy: trackByAssigneeId" 
            class="assignee-item mb-1">
            <span class="assignee-name">{{ assignee.assignee_name }}</span>
            <span class="assignee-type badge badge-outline ms-2" 
                  [class]="getAssigneeTypeBadgeClass(assignee.assignee_type)">
              {{ getAssigneeTypeLabel(assignee.assignee_type) }}
            </span>
          </div>
        </div>
        
        <!-- Avatar display - show profile pictures/initials -->
        <div *ngSwitchCase="'avatar'" class="avatar-display d-flex">
          <div 
            *ngFor="let assignee of visibleAssignees; trackBy: trackByAssigneeId"
            class="assignee-avatar me-1" 
            [title]="assignee.assignee_name">
            <div class="avatar-circle" 
                 [class]="getAssigneeTypeClass(assignee.assignee_type)">
              {{ getAssigneeInitials(assignee.assignee_name) }}
            </div>
          </div>
          <div *ngIf="hasHiddenAssignees" 
               class="avatar-circle more-assignees" 
               [title]="hiddenAssigneesTooltip">
            +{{ additionalCount }}
          </div>
        </div>
        
        <!-- List display - simple bulleted list -->
        <ul *ngSwitchDefault class="list-display list-unstyled mb-0">
          <li *ngFor="let assignee of assigneeDetails; trackBy: trackByAssigneeId" 
              class="assignee-list-item">
            <i class="fas fa-user me-2" 
               [class]="getAssigneeIconClass(assignee.assignee_type)"></i>
            {{ assignee.assignee_name }}
            <small class="text-muted ms-2">({{ getAssigneeTypeLabel(assignee.assignee_type) }})</small>
          </li>
        </ul>
      </ng-container>
    </div>
  `,
  styles: [`
    .assignee-display {
      font-size: 0.875rem;
    }
    
    .compact-display .assignee-text {
      color: #495057;
      font-weight: 500;
    }
    
    .detailed-display .assignee-item {
      padding: 0.25rem 0;
      border-bottom: 1px solid #f8f9fa;
    }
    
    .assignee-name {
      font-weight: 500;
      color: #212529;
    }
    
    .assignee-type {
      font-size: 0.75rem;
      padding: 0.125rem 0.5rem;
      border-radius: 0.375rem;
    }
    
    .badge-outline {
      border: 1px solid #dee2e6;
      background: transparent;
      color: #6c757d;
    }
    
    .badge-user { background-color: #e3f2fd; color: #1976d2; }
    .badge-employee { background-color: #f3e5f5; color: #7b1fa2; }
    .badge-group { background-color: #e8f5e8; color: #388e3c; }
    .badge-role { background-color: #fff3e0; color: #f57c00; }
    .badge-division { background-color: #fce4ec; color: #c2185b; }
    
    .avatar-display {
      align-items: center;
    }
    
    .avatar-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 600;
      color: white;
      text-transform: uppercase;
    }
    
    .avatar-user { background-color: #2196f3; }
    .avatar-employee { background-color: #9c27b0; }
    .avatar-group { background-color: #4caf50; }
    .avatar-role { background-color: #ff9800; }
    .avatar-division { background-color: #e91e63; }
    .more-assignees { 
      background-color: #6c757d; 
      font-size: 0.625rem;
    }
    
    .list-display .assignee-list-item {
      padding: 0.125rem 0;
    }
    
    .fa-user { color: #6c757d; }
    .icon-user { color: #2196f3; }
    .icon-employee { color: #9c27b0; }
    .icon-group { color: #4caf50; }
    .icon-role { color: #ff9800; }
    .icon-division { color: #e91e63; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssigneeDisplayComponent {
  @Input() assigneeDetails: TicketAssignee[] = [];
  @Input() displayMode: 'compact' | 'detailed' | 'avatar' | 'list' = 'compact';
  @Input() maxVisible: number = 3;
  @Input() cssClass: string = '';

  get displayText(): string {
    if (!this.assigneeDetails || this.assigneeDetails.length === 0) {
      return 'Unassigned';
    }
    
    const names = this.assigneeDetails.map(a => a.assignee_name);
    
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} & ${names[1]}`;
    if (names.length <= 3) return `${names[0]}, ${names[1]} & ${names[2]}`;
    return `${names[0]} +${names.length - 1} others`;
  }

  get hasMultipleAssignees(): boolean {
    return this.assigneeDetails.length > 1;
  }

  get additionalCount(): number {
    return Math.max(0, this.assigneeDetails.length - 1);
  }

  get fullAssigneeTooltip(): string {
    return this.assigneeDetails.map(a => a.assignee_name).join(', ');
  }

  get visibleAssignees(): TicketAssignee[] {
    return this.assigneeDetails.slice(0, this.maxVisible);
  }

  get hasHiddenAssignees(): boolean {
    return this.assigneeDetails.length > this.maxVisible;
  }

  get hiddenAssigneesTooltip(): string {
    const hidden = this.assigneeDetails.slice(this.maxVisible);
    return hidden.map(a => a.assignee_name).join(', ');
  }

  trackByAssigneeId = (index: number, assignee: TicketAssignee): number => assignee.id;

  getAssigneeTypeLabel(assigneeType: string): string {
    console.log('Assignee Type:', assigneeType);
    const typeMap: { [key: string]: string } = {
      // Full Laravel model class names
      'App\\Models\\User': 'User',
      'App\\Models\\Employee': 'Employee', 
      'App\\Models\\Group': 'Department',
      'App\\Models\\Role': 'Role',
      'App\\Models\\Division': 'Service Level',
      // Simple string types from API
      'user': 'User',
      'employee': 'Employee',
      'group': 'Department',
      'role': 'Role',
      'division': 'Service Level'
    };
    
    return typeMap[assigneeType] || 'Unknown';
  }

  getAssigneeTypeBadgeClass(assigneeType: string): string {
    const classMap: { [key: string]: string } = {
      // Full Laravel model class names
      'App\\Models\\User': 'badge-user',
      'App\\Models\\Employee': 'badge-employee',
      'App\\Models\\Group': 'badge-group', 
      'App\\Models\\Role': 'badge-role',
      'App\\Models\\Division': 'badge-division',
      // Simple string types from API
      'user': 'badge-user',
      'employee': 'badge-employee',
      'group': 'badge-group',
      'role': 'badge-role',
      'division': 'badge-division'
    };
    
    return classMap[assigneeType] || 'badge-outline';
  }

  getAssigneeTypeClass(assigneeType: string): string {
    const classMap: { [key: string]: string } = {
      // Full Laravel model class names
      'App\\Models\\User': 'avatar-user',
      'App\\Models\\Employee': 'avatar-employee',
      'App\\Models\\Group': 'avatar-group',
      'App\\Models\\Role': 'avatar-role', 
      'App\\Models\\Division': 'avatar-division',
      // Simple string types from API
      'user': 'avatar-user',
      'employee': 'avatar-employee',
      'group': 'avatar-group',
      'role': 'avatar-role',
      'division': 'avatar-division'
    };
    
    return classMap[assigneeType] || 'avatar-user';
  }

  getAssigneeIconClass(assigneeType: string): string {
    const classMap: { [key: string]: string } = {
      // Full Laravel model class names
      'App\\Models\\User': 'icon-user',
      'App\\Models\\Employee': 'icon-employee', 
      'App\\Models\\Group': 'icon-group',
      'App\\Models\\Role': 'icon-role',
      'App\\Models\\Division': 'icon-division',
      // Simple string types from API
      'user': 'icon-user',
      'employee': 'icon-employee',
      'group': 'icon-group',
      'role': 'icon-role',
      'division': 'icon-division'
    };
    
    return classMap[assigneeType] || 'icon-user';
  }

  getAssigneeInitials(name: string): string {
    if (!name) return '?';
    
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].substring(0, 2);
    }
    
    return parts[0][0] + (parts[1][0] || '');
  }
}