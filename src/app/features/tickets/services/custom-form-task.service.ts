import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { 
  CustomFormTask, 
  CustomFormTaskResponse, 
  adaptCustomFormTaskToTicket,
  TaskStatus 
} from '../models/custom-form-task.interface';
import { Ticket } from '../models/ticket.interface';

@Injectable({
  providedIn: 'root'
})
export class CustomFormTaskService {
  private readonly baseUrl = `${environment.formhub.url}/custom-forms/task`;

  constructor(private http: HttpClient) { }

  /**
   * Get all pending custom form tasks assigned to current user
   */
  getMyTasks(): Observable<Ticket[]> {
    return this.http.get<CustomFormTaskResponse>(this.baseUrl).pipe(
      map(response => {
        if (response.success && response.data) {
          const tickets = response.data.map(task => adaptCustomFormTaskToTicket(task));
          return tickets;
        }
        return [];
      })
    );
  }

  /**
   * Get pending tasks only (for approval board)
   */
  getPendingTasks(): Observable<Ticket[]> {
    return this.getMyTasks().pipe(
      map(tickets => tickets.filter(ticket => 
        ticket.customFormData && 
        ticket.status === 'pending'
      ))
    );
  }

  /**
   * Approve a custom form task
   */
  approveTask(taskId: number, notes?: string): Observable<any> {
    // This would call the appropriate approve endpoint
    // Based on the routes, it might be something like PUT /task/approveOrReject/{task_id}
    return this.http.put(`${environment.formhub.url}/task/approveOrReject/${taskId}`, {
      action: 'approve',
      notes: notes
    });
  }

  /**
   * Reject a custom form task
   */
  rejectTask(taskId: number, notes?: string): Observable<any> {
    return this.http.put(`${environment.formhub.url}/task/approveOrReject/${taskId}`, {
      action: 'reject',
      notes: notes
    });
  }

  /**
   * Get task details by ID
   */
  getTaskDetails(taskId: number): Observable<CustomFormTask> {
    // This would need to be implemented based on available endpoints
    // For now, we'll filter from the main list
    return this.http.get<CustomFormTaskResponse>(this.baseUrl).pipe(
      map(response => {
        const task = response.data.find(t => t.id === taskId);
        if (!task) {
          throw new Error(`Task with ID ${taskId} not found`);
        }
        return task;
      })
    );
  }
}