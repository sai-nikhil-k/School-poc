import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { DatePipe } from '@angular/common';
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

import { StudentService } from '../../../core/services/student.service';
import { Student } from '../../../models/student.model';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog';
import {
  StudentFormDialogComponent,
  StudentFormDialogData,
} from '../student-form-dialog/student-form-dialog';

@Component({
  selector: 'app-student-list',
  imports: [
    DatePipe,
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
  templateUrl: './student-list.html',
  styleUrl: './student-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentListComponent implements OnInit, AfterViewInit {
  private readonly studentService = inject(StudentService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly dataSource = new MatTableDataSource<Student>([]);
  readonly loading = signal(false);
  readonly searchControl = new FormControl('');
  readonly displayedColumns = ['name', 'email', 'grade', 'enrolledAt', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor() {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((search) => this.loadStudents(search ?? ''));
  }

  ngOnInit(): void {
    this.loadStudents();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  private loadStudents(search?: string): void {
    this.loading.set(true);
    this.studentService.getAll(search).subscribe({
      next: (students) => {
        this.dataSource.data = students;
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Failed to load students', 'Close', { duration: 3000 });
      },
    });
  }

  openAddDialog(): void {
    const ref = this.dialog.open<StudentFormDialogComponent, StudentFormDialogData, boolean>(
      StudentFormDialogComponent,
      { width: '640px', maxHeight: '90vh', data: {} }
    );
    ref.afterClosed().subscribe((result) => {
      if (result) this.loadStudents(this.searchControl.value ?? '');
    });
  }

  openEditDialog(student: Student): void {
    const ref = this.dialog.open<StudentFormDialogComponent, StudentFormDialogData, boolean>(
      StudentFormDialogComponent,
      { width: '640px', maxHeight: '90vh', data: { studentId: student.id } }
    );
    ref.afterClosed().subscribe((result) => {
      if (result) this.loadStudents(this.searchControl.value ?? '');
    });
  }

  confirmDelete(student: Student): void {
    const ref = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(
      ConfirmDialogComponent,
      {
        data: {
          title: 'Delete Student',
          message: `Are you sure you want to delete ${student.firstName} ${student.lastName}? This action cannot be undone.`,
        },
        width: '400px',
      }
    );
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) this.deleteStudent(student.id);
    });
  }

  private deleteStudent(id: string): void {
    this.studentService.delete(id).subscribe({
      next: () => {
        this.snackBar.open('Student deleted successfully', 'Close', { duration: 3000 });
        this.loadStudents(this.searchControl.value ?? '');
      },
      error: () => this.snackBar.open('Failed to delete student', 'Close', { duration: 3000 }),
    });
  }
}
