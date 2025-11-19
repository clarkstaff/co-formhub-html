import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lazy-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-between border-t border-white-light dark:border-dark px-4 py-3 sm:px-6 bg-white dark:bg-dark">
      <!-- Mobile View -->
      <div class="flex flex-1 justify-between sm:hidden">
        <button
          [disabled]="currentPage <= 1 || loading"
          (click)="onPrevious()"
          class="relative inline-flex items-center rounded-md border border-white-light dark:border-dark bg-white dark:bg-dark px-4 py-2 text-sm font-medium text-black dark:text-white hover:bg-white-light dark:hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          [disabled]="!hasNextPage || loading"
          (click)="onNext()"
          class="relative ml-3 inline-flex items-center rounded-md border border-white-light dark:border-dark bg-white dark:bg-dark px-4 py-2 text-sm font-medium text-black dark:text-white hover:bg-white-light dark:hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>

      <!-- Desktop View -->
      <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-dark dark:text-white-dark">
            Showing
            <span class="font-medium">{{ startIndex }}</span>
            to
            <span class="font-medium">{{ endIndex }}</span>
            of
            <span class="font-medium">{{ totalItems }}</span>
            results
          </p>
        </div>
        <div>
          <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <!-- Previous Button -->
            <button
              [disabled]="currentPage <= 1 || loading"
              (click)="onPrevious()"
              class="relative inline-flex items-center rounded-l-md px-2 py-2 text-dark dark:text-white-dark ring-1 ring-inset ring-white-light dark:ring-dark hover:bg-white-light dark:hover:bg-black focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span class="sr-only">Previous</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
              </svg>
            </button>

            <!-- Page Numbers -->
            <ng-container *ngFor="let page of visiblePages">
              <!-- Current Page -->
              <button
                *ngIf="page === currentPage"
                aria-current="page"
                class="relative z-10 inline-flex items-center bg-primary px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {{ page }}
              </button>
              
              <!-- Other Pages -->
              <button
                *ngIf="page !== currentPage && page !== '...'"
                (click)="onPageChange(+page)"
                [disabled]="loading"
                class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-dark dark:text-white-dark ring-1 ring-inset ring-white-light dark:ring-dark hover:bg-white-light dark:hover:bg-black focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ page }}
              </button>
              
              <!-- Ellipsis -->
              <span
                *ngIf="page === '...'"
                class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-dark dark:text-white-dark ring-1 ring-inset ring-white-light dark:ring-dark"
              >
                ...
              </span>
            </ng-container>

            <!-- Next Button -->
            <button
              [disabled]="!hasNextPage || loading"
              (click)="onNext()"
              class="relative inline-flex items-center rounded-r-md px-2 py-2 text-dark dark:text-white-dark ring-1 ring-inset ring-white-light dark:ring-dark hover:bg-white-light dark:hover:bg-black focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span class="sr-only">Next</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>

      <!-- Loading Indicator -->
      <div *ngIf="loading" class="absolute inset-0 bg-white dark:bg-dark bg-opacity-50 dark:bg-opacity-50 flex items-center justify-center">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    
    .animate-spin {
      animation: spin 1s linear infinite;
    }
  `]
})
export class LazyPaginationComponent {
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Input() totalItems: number = 0;
  @Input() itemsPerPage: number = 10;
  @Input() loading: boolean = false;
  @Input() hasNextPage: boolean = false;
  
  @Output() pageChange = new EventEmitter<number>();

  get startIndex(): number {
    return ((this.currentPage - 1) * this.itemsPerPage) + 1;
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }

  get visiblePages(): (number | string)[] {
    const pages: (number | string)[] = [];
    const maxVisible = 7;
    
    if (this.totalPages <= maxVisible) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(this.totalPages);
      } else if (this.currentPage >= this.totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = this.totalPages - 4; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(this.totalPages);
      }
    }
    
    return pages;
  }

  onPrevious(): void {
    if (this.currentPage > 1 && !this.loading) {
      this.pageChange.emit(this.currentPage - 1);
    }
  }

  onNext(): void {
    if (this.hasNextPage && !this.loading) {
      this.pageChange.emit(this.currentPage + 1);
    }
  }

  onPageChange(page: number): void {
    if (page !== this.currentPage && !this.loading && page >= 1 && page <= this.totalPages) {
      this.pageChange.emit(page);
    }
  }
}