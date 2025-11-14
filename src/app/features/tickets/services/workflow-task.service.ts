import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface WorkflowTask {
  id: string;
  custom_form_response_id: number; // The actual ID needed for processing
  title: string;
  description: string;
  status: string;
  priority: string;
  type: string;
  form_type: string;
  form_name: string;
  stage_name: string;
  created_at: string;
  updated_at: string;
  due_date?: string;
  reference_id: string;
  requestor: string;
  workflow_name?: string;
  workflow_id?: number;
  assignees: Array<{
    id: string;
    name: string;
    type: 'user' | 'group';
    avatar?: string;
  }>;
  form_data: any; // The actual form data from customFormResponse
}

export interface WorkflowTaskFilters {
  status?: string[];
  stage_type?: string;
  search?: string;
  per_page?: number;
  page?: number;
}

export interface ProcessTaskRequest {
  action: 'approved' | 'rejected';
  notes?: string;
}

export interface ProcessTaskResponse {
  success: boolean;
  message: string;
  stage?: any;
}

@Injectable({
  providedIn: 'root'
})
export class WorkflowTaskService {
  private readonly baseUrl = environment.formhub.url;

  constructor(private http: HttpClient) {}

  /**
   * Get workflow tasks with filters
   */
  getTasks(filters: WorkflowTaskFilters = {}): Observable<{ data: WorkflowTask[], meta: any }> {
    let params = new HttpParams();
    
    if (filters.status?.length) {
      filters.status.forEach(status => {
        params = params.append('status[]', status);
      });
    }
    
    if (filters.stage_type) {
      params = params.set('stage_type', filters.stage_type);
    }
    
    if (filters.search) {
      params = params.set('search', filters.search);
    }
    
    if (filters.per_page) {
      params = params.set('per_page', filters.per_page.toString());
    }
    
    if (filters.page) {
      params = params.set('page', filters.page.toString());
    }

    return this.http.get<{ data: WorkflowTask[], meta: any }>(`${this.baseUrl}/custom-forms/task`, { params });
  }

  /**
   * Get a specific workflow task
   */
  getTask(id: string): Observable<WorkflowTask> {
    return this.http.get<WorkflowTask>(`${this.baseUrl}/custom-forms/task/${id}`);
  }

  /**
   * Process a workflow task (approve/reject)
   */
  processTask(id: string, request: ProcessTaskRequest): Observable<ProcessTaskResponse> {
    return this.http.post<ProcessTaskResponse>(`${this.baseUrl}/custom-forms/process/responses/${id}/process`, request);
  }
}