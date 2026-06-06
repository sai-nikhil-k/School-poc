import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';

import { StudentService } from '../../../core/services/student.service';
import { Student } from '../../../models/student.model';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog';
import {
  StudentFormDialogComponent,
  StudentFormDialogData,
} from '../student-form-dialog/student-form-dialog';

@Component({
  selector: 'app-student-detail',
  imports: [
    DatePipe,
    RouterLink,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './student-detail.html',
  styleUrl: './student-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly studentService = inject(StudentService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly student = signal<Student | null>(null);
  readonly loading = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/students']); return; }
    this.loadStudent(id);
  }

  private loadStudent(id: string): void {
    this.loading.set(true);
    this.studentService.getById(id).subscribe({
      next: (student) => {
        this.student.set(student);
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open('Student not found', 'Close', { duration: 3000 });
        this.router.navigate(['/students']);
      },
    });
  }

  openEditDialog(): void {
    const s = this.student();
    if (!s) return;

    const ref = this.dialog.open<StudentFormDialogComponent, StudentFormDialogData, boolean>(
      StudentFormDialogComponent,
      { width: '640px', maxHeight: '90vh', data: { studentId: s.id } }
    );

    ref.afterClosed().subscribe((result) => {
      if (result) this.loadStudent(s.id);
    });
  }

  confirmDelete(): void {
    const s = this.student();
    if (!s) return;

    const ref = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(
      ConfirmDialogComponent,
      {
        data: {
          title: 'Delete Student',
          message: `Are you sure you want to delete ${s.firstName} ${s.lastName}? This action cannot be undone.`,
        },
        width: '400px',
      }
    );

    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) this.deleteStudent(s.id);
    });
  }

  private deleteStudent(id: string): void {
    this.studentService.delete(id).subscribe({
      next: () => {
        this.snackBar.open('Student deleted successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/students']);
      },
      error: () => this.snackBar.open('Failed to delete student', 'Close', { duration: 3000 }),
    });
  }
}
