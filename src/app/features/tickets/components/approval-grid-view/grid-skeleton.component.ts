import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-grid-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      
      <!-- Left Side Skeleton -->
      <div class="lg:col-span-1 bg-white dark:bg-dark border border-white-light dark:border-dark rounded-lg shadow overflow-hidden">
        
        <!-- Header Skeleton -->
        <div class="p-4 border-b border-white-light dark:border-dark animate-pulse">
          <div class="flex items-center justify-between mb-3">
            <div class="h-6 bg-white-light dark:bg-black rounded w-32"></div>
            <div class="w-4 h-4 bg-white-light dark:bg-black rounded"></div>
          </div>
          
          <div class="h-4 bg-white-light dark:bg-black rounded w-48 mb-3"></div>

          <!-- Bulk Action Skeleton -->
          <div class="flex gap-2">
            <div class="flex-1 h-8 bg-white-light dark:bg-black rounded"></div>
            <div class="flex-1 h-8 bg-white-light dark:bg-black rounded"></div>
          </div>
        </div>
        
        <!-- Task List Skeleton -->
        <div class="divide-y divide-white-light dark:divide-dark max-h-[calc(100vh-20rem)] overflow-y-auto">
          <div *ngFor="let item of skeletonItems" 
               class="p-4 animate-pulse">
            <!-- Checkbox -->
            <div class="absolute top-2 right-2 w-4 h-4 bg-white-light dark:bg-black rounded"></div>
            
            <div class="flex justify-between items-start">
              <div class="flex-1 mr-12">
                <!-- Title -->
                <div class="h-5 bg-white-light dark:bg-black rounded w-3/4 mb-2"></div>
                
                <!-- Assignee -->
                <div class="h-4 bg-white-light dark:bg-black rounded w-1/2 mb-1"></div>
                
                <!-- Reference -->
                <div class="h-3 bg-white-light dark:bg-black rounded w-20 mb-2"></div>
              </div>
              
              <!-- Badge -->
              <div class="h-6 bg-white-light dark:bg-black rounded-full w-20"></div>
            </div>
            
            <!-- Description -->
            <div class="space-y-1 mt-2">
              <div class="h-4 bg-white-light dark:bg-black rounded w-full"></div>
              <div class="h-4 bg-white-light dark:bg-black rounded w-2/3"></div>
            </div>
            
            <!-- Meta Info -->
            <div class="space-y-1 mt-3">
              <div class="h-3 bg-white-light dark:bg-black rounded w-1/3"></div>
              <div class="h-3 bg-white-light dark:bg-black rounded w-1/4"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Side Skeleton -->
      <div class="lg:col-span-2 bg-white dark:bg-dark border border-white-light dark:border-dark rounded-lg shadow">
        <div class="flex flex-col items-center justify-center h-full p-6 text-center min-h-[400px] animate-pulse">
          <div class="w-16 h-16 bg-white-light dark:bg-black rounded-full mb-4"></div>
          <div class="h-6 bg-white-light dark:bg-black rounded w-48 mb-2"></div>
          <div class="h-4 bg-white-light dark:bg-black rounded w-64"></div>
        </div>
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
export class GridSkeletonComponent {
  skeletonItems = new Array(8).fill(0).map((_, i) => i);
}