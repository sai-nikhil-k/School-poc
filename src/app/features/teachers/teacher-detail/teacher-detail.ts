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

import { TeacherService } from '../../../core/services/teacher.service';
import { Teacher } from '../../../models/teacher.model';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog';
import {
  TeacherFormDialogComponent,
  TeacherFormDialogData,
} from '../teacher-form-dialog/teacher-form-dialog';

@Component({
  selector: 'app-teacher-detail',
  imports: [
    DatePipe,
    RouterLink,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './teacher-detail.html',
  styleUrl: './teacher-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly teacherService = inject(TeacherService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly teacher = signal<Teacher | null>(null);
  readonly loading = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/teachers']); return; }
    this.loadTeacher(id);
  }

  private loadTeacher(id: string): void {
    this.loading.set(true);
    this.teacherService.getById(id).subscribe({
      next: (teacher) => {
        this.teacher.set(teacher);
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open('Teacher not found', 'Close', { duration: 3000 });
        this.router.navigate(['/teachers']);
      },
    });
  }

  openEditDialog(): void {
    const t = this.teacher();
    if (!t) return;

    const ref = this.dialog.open<TeacherFormDialogComponent, TeacherFormDialogData, boolean>(
      TeacherFormDialogComponent,
      { width: '640px', maxHeight: '90vh', data: { teacherId: t.id } }
    );

    ref.afterClosed().subscribe((result) => {
      if (result) this.loadTeacher(t.id);
    });
  }

  confirmDelete(): void {
    const t = this.teacher();
    if (!t) return;

    const ref = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(
      ConfirmDialogComponent,
      {
        data: {
          title: 'Delete Teacher',
          message: `Are you sure you want to delete ${t.firstName} ${t.lastName}? This action cannot be undone.`,
        },
        width: '400px',
      }
    );

    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) this.deleteTeacher(t.id);
    });
  }

  private deleteTeacher(id: string): void {
    this.teacherService.delete(id).subscribe({
      next: () => {
        this.snackBar.open('Teacher deleted successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/teachers']);
      },
      error: () => this.snackBar.open('Failed to delete teacher', 'Close', { duration: 3000 }),
    });
  }
}
