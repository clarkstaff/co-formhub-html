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
          <span class="assignee-text text-dark dark:text-white-dark font-medium" [title]="fullAssigneeTooltip">
            {{ displayText }}
          </span>
          <span *ngIf="hasMultipleAssignees" class="inline-flex items-center px-2 py-1 rounded text-xs bg-secondary-light dark:bg-secondary-dark-light text-secondary dark:text-secondary ml-1">
            +{{ additionalCount }}
          </span>
        </div>
        
        <!-- Detailed display - show all assignees with types -->
        <div *ngSwitchCase="'detailed'" class="detailed-display">
          <div 
            *ngFor="let assignee of assigneeDetails; trackBy: trackByAssigneeId" 
            class="assignee-item mb-1 py-1 border-b border-white-light dark:border-dark last:border-b-0">
            <span class="assignee-name font-medium text-black dark:text-white">{{ assignee.assignee_name }}</span>
            <span class="assignee-type inline-flex items-center px-2 py-1 rounded text-xs ml-2 border border-white-light dark:border-dark bg-transparent text-dark dark:text-white-dark" 
                  [class]="getAssigneeTypeBadgeClass(assignee.assignee_type)">
              {{ getAssigneeTypeLabel(assignee.assignee_type) }}
            </span>
          </div>
        </div>
        
        <!-- Avatar display - show profile pictures/initials -->
        <div *ngSwitchCase="'avatar'" class="avatar-display flex items-center">
          <div 
            *ngFor="let assignee of visibleAssignees; trackBy: trackByAssigneeId"
            class="assignee-avatar mr-1" 
            [title]="assignee.assignee_name">
            <div class="avatar-circle w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white uppercase" 
                 [class]="getAssigneeTypeClass(assignee.assignee_type)">
              {{ getAssigneeInitials(assignee.assignee_name) }}
            </div>
          </div>
          <div *ngIf="hasHiddenAssignees" 
               class="avatar-circle w-8 h-8 rounded-full flex items-center justify-center text-xs bg-dark dark:bg-white-dark text-white dark:text-black" 
               [title]="hiddenAssigneesTooltip">
            +{{ additionalCount }}
          </div>
        </div>
        
        <!-- List display - simple bulleted list -->
        <ul *ngSwitchDefault class="list-display list-none mb-0 p-0">
          <li *ngFor="let assignee of assigneeDetails; trackBy: trackByAssigneeId" 
              class="assignee-list-item py-1">
            <i class="fas fa-user mr-2 text-dark dark:text-white-dark" 
               [class]="getAssigneeIconClass(assignee.assignee_type)"></i>
            <span class="text-black dark:text-white">{{ assignee.assignee_name }}</span>
            <small class="text-dark dark:text-white-dark ml-2">({{ getAssigneeTypeLabel(assignee.assignee_type) }})</small>
          </li>
        </ul>
      </ng-container>
    </div>
  `,
  styles: [`
    .assignee-display {
      font-size: 0.875rem;
    }
    
    /* Avatar type classes using custom theme colors */
    .avatar-user { background-color: #4361ee !important; }
    .avatar-employee { background-color: #805dca !important; }
    .avatar-group { background-color: #00ab55 !important; }
    .avatar-role { background-color: #e2a03f !important; }
    .avatar-division { background-color: #e7515a !important; }
    
    /* Badge type classes using custom theme colors */
    .badge-user { 
      background-color: #eaf1ff !important; 
      color: #4361ee !important;
      border-color: #4361ee !important;
    }
    .badge-employee { 
      background-color: #ebe4f7 !important; 
      color: #805dca !important;
      border-color: #805dca !important;
    }
    .badge-group { 
      background-color: #ddf5f0 !important; 
      color: #00ab55 !important;
      border-color: #00ab55 !important;
    }
    .badge-role { 
      background-color: #fff9ed !important; 
      color: #e2a03f !important;
      border-color: #e2a03f !important;
    }
    .badge-division { 
      background-color: #fff5f5 !important; 
      color: #e7515a !important;
      border-color: #e7515a !important;
    }
    
    /* Dark mode badge overrides */
    @media (prefers-color-scheme: dark) {
      .badge-user { 
        background-color: rgba(67,97,238,.15) !important; 
        color: #4361ee !important;
      }
      .badge-employee { 
        background-color: rgb(128, 93, 202, 0.15) !important; 
        color: #805dca !important;
      }
      .badge-group { 
        background-color: rgba(0,171,85,.15) !important; 
        color: #00ab55 !important;
      }
      .badge-role { 
        background-color: rgba(226,160,63,.15) !important; 
        color: #e2a03f !important;
      }
      .badge-division { 
        background-color: rgba(231,81,90,.15) !important; 
        color: #e7515a !important;
      }
    }
    
    /* Icon type classes using custom theme colors */
    .icon-user { color: #4361ee !important; }
    .icon-employee { color: #805dca !important; }
    .icon-group { color: #00ab55 !important; }
    .icon-role { color: #e2a03f !important; }
    .icon-division { color: #e7515a !important; }
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