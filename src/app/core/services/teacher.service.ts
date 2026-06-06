import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateTeacherRequest, Teacher, UpdateTeacherRequest } from '../../models/teacher.model';

@Injectable({ providedIn: 'root' })
export class TeacherService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/teachers`;

  getAll(search?: string): Observable<Teacher[]> {
    const params: Record<string, string> = search?.trim() ? { search: search.trim() } : {};
    return this.http.get<Teacher[]>(this.apiUrl, { params });
  }

  getById(id: string): Observable<Teacher> {
    return this.http.get<Teacher>(`${this.apiUrl}/${id}`);
  }

  create(request: CreateTeacherRequest): Observable<Teacher> {
    return this.http.post<Teacher>(this.apiUrl, request);
  }

  update(id: string, request: UpdateTeacherRequest): Observable<Teacher> {
    return this.http.put<Teacher>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleActive(id: string): Observable<Teacher> {
    return this.http.patch<Teacher>(`${this.apiUrl}/${id}/toggle-active`, {});
  }
}
