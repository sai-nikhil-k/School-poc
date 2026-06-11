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
import { MatSnackBar } from '@angular/material/snack-bar';

import { StudentService } from '../../../core/services/student.service';
import { CreateStudentRequest } from '../../../models/student.model';

export interface StudentFormDialogData {
  studentId?: string;
}

function pastDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return (control.value as Date) >= today ? { pastDate: true } : null;
}

@Component({
  selector: 'app-student-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './student-form-dialog.html',
  styleUrl: './student-form-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<StudentFormDialogComponent>);
  readonly data = inject<StudentFormDialogData>(MAT_DIALOG_DATA);
  private readonly studentService = inject(StudentService);
  private readonly snackBar = inject(MatSnackBar);

  readonly isEditMode = signal(false);
  readonly loading = signal(false);
  readonly submitting = signal(false);
  readonly maxDate = new Date(Date.now() - 86400000);

  readonly form = this.fb.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    dateOfBirth: [null as Date | null, [Validators.required, pastDateValidator]],
    grade: ['', [Validators.required, Validators.maxLength(50)]],
    guardianName: [null as string | null, [Validators.maxLength(150)]],
    contactNumber: [null as string | null, [Validators.maxLength(20)]],
    address: [null as string | null, [Validators.maxLength(500)]],
  });

  ngOnInit(): void {
    if (this.data.studentId) {
      this.isEditMode.set(true);
      this.loadStudent(this.data.studentId);
    }
  }

  private loadStudent(id: string): void {
    this.loading.set(true);
    this.studentService.getById(id).subscribe({
      next: (student) => {
        this.form.patchValue({
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          dateOfBirth: new Date(student.dateOfBirth + 'T00:00:00'),
          grade: student.grade,
          guardianName: student.guardianName,
          contactNumber: student.contactNumber,
          address: student.address,
        });
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open('Student not found', 'Close', { duration: 3000 });
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
    const request: CreateStudentRequest = {
      firstName: raw.firstName!.trim(),
      lastName: raw.lastName!.trim(),
      email: raw.email!.trim(),
      dateOfBirth: this.formatDate(raw.dateOfBirth!),
      grade: raw.grade!.trim(),
      guardianName: raw.guardianName?.trim() || null,
      contactNumber: raw.contactNumber?.trim() || null,
      address: raw.address?.trim() || null,
    };

    this.submitting.set(true);

    const action$ = this.isEditMode()
      ? this.studentService.update(this.data.studentId!, request)
      : this.studentService.create(request);

    action$.subscribe({
      next: () => {
        this.submitting.set(false);
        const msg = this.isEditMode()
          ? 'Student updated successfully'
          : 'Student added successfully';
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
    if (control.hasError('pastDate') || control.hasError('matDatepickerMax'))
      return 'Date of birth must be in the past';
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
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email',
      dateOfBirth: 'Date of birth',
      grade: 'Grade',
      guardianName: 'Guardian name',
      contactNumber: 'Contact number',
      address: 'Address',
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
