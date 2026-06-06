import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';

import { TeacherService } from '../../../core/services/teacher.service';
import { Teacher } from '../../../models/teacher.model';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog';
import {
  TeacherFormDialogComponent,
  TeacherFormDialogData,
} from '../teacher-form-dialog/teacher-form-dialog';

@Component({
  selector: 'app-teacher-list',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './teacher-list.html',
  styleUrl: './teacher-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherListComponent implements OnInit, AfterViewInit {
  private readonly teacherService = inject(TeacherService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly dataSource = new MatTableDataSource<Teacher>([]);
  readonly loading = signal(false);
  readonly searchControl = new FormControl('');
  readonly displayedColumns = ['name', 'email', 'subject', 'active', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor() {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((search) => this.loadTeachers(search ?? ''));
  }

  ngOnInit(): void {
    this.loadTeachers();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  private loadTeachers(search?: string): void {
    this.loading.set(true);
    this.teacherService.getAll(search).subscribe({
      next: (teachers) => {
        this.dataSource.data = teachers;
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Failed to load teachers', 'Close', { duration: 3000 });
      },
    });
  }

  openAddDialog(): void {
    const ref = this.dialog.open<TeacherFormDialogComponent, TeacherFormDialogData, boolean>(
      TeacherFormDialogComponent,
      { width: '640px', maxHeight: '90vh', data: {} }
    );
    ref.afterClosed().subscribe((result) => {
      if (result) this.loadTeachers(this.searchControl.value ?? '');
    });
  }

  openEditDialog(teacher: Teacher): void {
    const ref = this.dialog.open<TeacherFormDialogComponent, TeacherFormDialogData, boolean>(
      TeacherFormDialogComponent,
      { width: '640px', maxHeight: '90vh', data: { teacherId: teacher.id } }
    );
    ref.afterClosed().subscribe((result) => {
      if (result) this.loadTeachers(this.searchControl.value ?? '');
    });
  }

  toggleActive(teacher: Teacher): void {
    this.teacherService.toggleActive(teacher.id).subscribe({
      next: (updated) => {
        this.dataSource.data = this.dataSource.data.map((t) =>
          t.id === updated.id ? updated : t
        );
      },
      error: () => this.snackBar.open('Failed to update teacher status', 'Close', { duration: 3000 }),
    });
  }

  confirmDelete(teacher: Teacher): void {
    const ref = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(
      ConfirmDialogComponent,
      {
        data: {
          title: 'Delete Teacher',
          message: `Are you sure you want to delete ${teacher.firstName} ${teacher.lastName}? This action cannot be undone.`,
        },
        width: '400px',
      }
    );
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) this.deleteTeacher(teacher.id);
    });
  }

  private deleteTeacher(id: string): void {
    this.teacherService.delete(id).subscribe({
      next: () => {
        this.snackBar.open('Teacher deleted successfully', 'Close', { duration: 3000 });
        this.loadTeachers(this.searchControl.value ?? '');
      },
      error: () => this.snackBar.open('Failed to delete teacher', 'Close', { duration: 3000 }),
    });
  }
}
