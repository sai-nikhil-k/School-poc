import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateStudentRequest, Student, UpdateStudentRequest } from '../../models/student.model';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/students`;

  getAll(search?: string): Observable<Student[]> {
    const params: Record<string, string> = search?.trim() ? { search: search.trim() } : {};
    return this.http.get<Student[]>(this.apiUrl, { params });
  }

  getById(id: string): Observable<Student> {
    return this.http.get<Student>(`${this.apiUrl}/${id}`);
  }

  create(request: CreateStudentRequest): Observable<Student> {
    return this.http.post<Student>(this.apiUrl, request);
  }

  update(id: string, request: UpdateStudentRequest): Observable<Student> {
    return this.http.put<Student>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
