import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TeacherService } from '../../../core/services/teacher.service';
import { CreateTeacherRequest } from '../../../models/teacher.model';

export interface TeacherFormDialogData {
  teacherId?: string;
}

function joinedAtNotFutureValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return (control.value as Date) > today ? { futureDate: true } : null;
}

@Component({
  selector: 'app-teacher-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSlideToggleModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './teacher-form-dialog.html',
  styleUrl: './teacher-form-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<TeacherFormDialogComponent>);
  readonly data = inject<TeacherFormDialogData>(MAT_DIALOG_DATA);
  private readonly teacherService = inject(TeacherService);
  private readonly snackBar = inject(MatSnackBar);

  readonly isEditMode = signal(false);
  readonly loading = signal(false);
  readonly submitting = signal(false);
  readonly maxDate = new Date();

  readonly form = this.fb.group({
    firstName:   ['', [Validators.required, Validators.maxLength(100)]],
    lastName:    ['', [Validators.required, Validators.maxLength(100)]],
    email:       ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    phoneNumber: [null as string | null, [Validators.maxLength(20)]],
    subject:     ['', [Validators.required, Validators.maxLength(100)]],
    joinedAt:    [null as Date | null, [Validators.required, joinedAtNotFutureValidator]],
    isActive:    [true],
  });

  ngOnInit(): void {
    if (this.data.teacherId) {
      this.isEditMode.set(true);
      this.loadTeacher(this.data.teacherId);
    }
  }

  private loadTeacher(id: string): void {
    this.loading.set(true);
    this.teacherService.getById(id).subscribe({
      next: (teacher) => {
        this.form.patchValue({
          firstName:   teacher.firstName,
          lastName:    teacher.lastName,
          email:       teacher.email,
          phoneNumber: teacher.phoneNumber,
          subject:     teacher.subject,
          joinedAt:    new Date(teacher.joinedAt + 'T00:00:00'),
          isActive:    teacher.isActive,
        });
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open('Teacher not found', 'Close', { duration: 3000 });
        this.dialogRef.close(false);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.value;
    const request: CreateTeacherRequest = {
      firstName:   raw.firstName!.trim(),
      lastName:    raw.lastName!.trim(),
      email:       raw.email!.trim(),
      phoneNumber: raw.phoneNumber?.trim() || null,
      subject:     raw.subject!.trim(),
      joinedAt:    this.formatDate(raw.joinedAt!),
      isActive:    raw.isActive ?? true,
    };

    this.submitting.set(true);

    const action$ = this.isEditMode()
      ? this.teacherService.update(this.data.teacherId!, request)
      : this.teacherService.create(request);

    action$.subscribe({
      next: () => {
        this.submitting.set(false);
        const msg = this.isEditMode() ? 'Teacher updated successfully' : 'Teacher added successfully';
        this.snackBar.open(msg, 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err: HttpErrorResponse) => {
        this.submitting.set(false);
        this.handleServerError(err);
      },
    });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  getError(field: string): string {
    const control = this.form.get(field);
    if (!control?.errors || !control.touched) return '';
    if (control.hasError('required')) return `${this.fieldLabel(field)} is required`;
    if (control.hasError('email')) return 'Please enter a valid email address';
    if (control.hasError('maxlength')) {
      const max = control.getError('maxlength').requiredLength;
      return `${this.fieldLabel(field)} cannot exceed ${max} characters`;
    }
    if (control.hasError('futureDate') || control.hasError('matDatepickerMax'))
      return 'Join date cannot be in the future';
    if (control.hasError('serverDuplicate')) return 'Email already exists';
    if (control.hasError('serverError')) return control.getError('serverError');
    return '';
  }

  private handleServerError(error: HttpErrorResponse): void {
    if (error.status === 409) {
      this.form.get('email')?.setErrors({ serverDuplicate: true });
      this.form.get('email')?.markAsTouched();
      return;
    }
    if (error.status === 400 && error.error?.errors) {
      const errors = error.error.errors as Record<string, string[]>;
      Object.keys(errors).forEach((key) => {
        const field = key.charAt(0).toLowerCase() + key.slice(1);
        const control = this.form.get(field);
        if (control) {
          control.setErrors({ serverError: errors[key][0] });
          control.markAsTouched();
        }
      });
      return;
    }
    this.snackBar.open('An error occurred. Please try again.', 'Close', { duration: 3000 });
  }

  private fieldLabel(field: string): string {
    const labels: Record<string, string> = {
      firstName:   'First name',
      lastName:    'Last name',
      email:       'Email',
      phoneNumber: 'Phone number',
      subject:     'Subject',
      joinedAt:    'Join date',
    };
    return labels[field] ?? field;
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
