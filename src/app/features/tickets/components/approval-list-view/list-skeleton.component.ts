import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-list-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="panel">
      <div class="table-responsive">
        <table class="table-striped">
          <thead>
            <tr>
              <th class="w-12">
                <div class="w-4 h-4 bg-white-light dark:bg-dark rounded animate-pulse"></div>
              </th>
              <th>Task</th>
              <th>Request Type</th>
              <th>Requestor</th>
              <th>Requested At</th>
              <th>Assignee</th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of skeletonRows" class="animate-pulse">
              <td>
                <div class="w-4 h-4 bg-white-light dark:bg-dark rounded"></div>
              </td>
              <td>
                <div class="space-y-2">
                  <div class="h-4 bg-white-light dark:bg-dark rounded w-3/4"></div>
                  <div class="h-3 bg-white-light dark:bg-dark rounded w-1/2"></div>
                  <div class="h-3 bg-white-light dark:bg-dark rounded w-1/4"></div>
                </div>
              </td>
              <td>
                <div class="h-6 bg-white-light dark:bg-dark rounded-full w-24"></div>
              </td>
              <td>
                <div class="h-4 bg-white-light dark:bg-dark rounded w-20"></div>
              </td>
              <td>
                <div class="h-4 bg-white-light dark:bg-dark rounded w-16"></div>
              </td>
              <td>
                <div class="h-4 bg-white-light dark:bg-dark rounded w-24"></div>
              </td>
              <td>
                <div class="flex items-center justify-center gap-2">
                  <div class="w-8 h-8 bg-white-light dark:bg-dark rounded"></div>
                  <div class="w-8 h-8 bg-white-light dark:bg-dark rounded"></div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }
  `]
})
export class ListSkeletonComponent {
  skeletonRows = new Array(10).fill(0).map((_, i) => i);
}