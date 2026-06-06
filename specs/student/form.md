---
spec_path: School POC app/school-poc/specs/student/form.md
type: frontend-page-spec
related:
  - School POC app/school-poc/specs/student/index.md
  - School POC app/school-poc/specs/student/list.md
  - School POC/api_endpoints.md
  - School POC api/specs/student/validation.md
---

# Student Form Dialog

## Overview
Add and edit students are handled via a `MatDialog` modal — there are no separate page routes for these actions.

## Component
`StudentFormDialogComponent` — standalone, opened via `MatDialog`.

Dialog data interface:
```typescript
export interface StudentFormDialogData {
  studentId?: string; // undefined = add mode, set = edit mode
}
```

Return value: `true` on success (caller should reload data), `false` / `undefined` on cancel or error.

---

## UI Layout

```
┌─ mat-dialog-title ──────────────────────────────────┐
│  Add Student  /  Edit Student                  [×]  │
├──────────────────────────────────────────────────── │
│  mat-dialog-content (scrollable, max-height: 70vh)  │
│                                                      │
│  Student Information                                 │
│  ─────────────────────────────────────────────────  │
│  [First Name *]          [Last Name *]               │
│  [Email Address *                              ]     │
│  [Date of Birth *]       [Grade Level *]             │
│                                                      │
│  Guardian & Contact                                  │
│  ─────────────────────────────────────────────────  │
│  [Guardian Name]         [Contact Number]            │
│  [Address                                      ]     │
│                                                      │
├──────────────────────────────────────────────────── │
│  mat-dialog-actions              [Cancel] [Save]     │
└──────────────────────────────────────────────────── │
```

Dialog opened with: `width: '640px'`, `maxHeight: '90vh'`.

All `mat-form-field` elements use `appearance="outline"` and `floatLabel="always"` (label always above the border, never floating).

---

## Form Fields

### Section: Student Information

| Field | Control Name | Material Component | Validators |
|-------|-------------|-------------------|------------|
| First Name | `firstName` | `MatInput` (type=text) | Required, MaxLength(100) |
| Last Name | `lastName` | `MatInput` (type=text) | Required, MaxLength(100) |
| Email Address | `email` | `MatInput` (type=email) | Required, Email format, MaxLength(255) |
| Date of Birth | `dateOfBirth` | `MatInput` (type=date) | Required |
| Grade Level | `grade` | `MatInput` (type=text) | Required, MaxLength(50) |

### Section: Guardian & Contact (all optional)

| Field | Control Name | Material Component | Validators |
|-------|-------------|-------------------|------------|
| Guardian Name | `guardianName` | `MatInput` (type=text) | MaxLength(150) |
| Contact Number | `contactNumber` | `MatInput` (type=text) | MaxLength(20) |
| Address | `address` | `MatInput` (type=text) | MaxLength(500) |

---

## Mode Behavior

### Add Mode (`data.studentId` is undefined)
- Dialog title: `"Add Student"`
- All fields empty on init
- Submit calls: `POST /api/students`
- On success: `MatSnackBar` `"Student added successfully"` → `dialogRef.close(true)`
- On cancel: `dialogRef.close(false)`

### Edit Mode (`data.studentId` is set)
- Dialog title: `"Edit Student"`
- On init: load student via `GET /api/students/:id`, then pre-fill all form fields
- Show `MatProgressSpinner` while fetching; form hidden
- Submit calls: `PUT /api/students/:id`
- On success: `MatSnackBar` `"Student updated successfully"` → `dialogRef.close(true)`
- If student not found (404): `MatSnackBar` error → `dialogRef.close(false)`

---

## Validation Display

| Trigger | Behavior |
|---------|---------|
| Field touched + invalid | Show `MatError` inline below the field |
| Form submitted while invalid | Mark all fields as touched, show all errors |
| Server `409` response | Set `serverDuplicate` error on `email` control → show error |

### Field Error Messages

| Field | Error Key | Displayed Message |
|-------|-----------|-------------------|
| `firstName` | `required` | `"First name is required"` |
| `firstName` | `maxlength` | `"First name cannot exceed 100 characters"` |
| `lastName` | `required` | `"Last name is required"` |
| `lastName` | `maxlength` | `"Last name cannot exceed 100 characters"` |
| `email` | `required` | `"Email is required"` |
| `email` | `email` | `"Please enter a valid email address"` |
| `email` | `maxlength` | `"Email cannot exceed 255 characters"` |
| `email` | `serverDuplicate` | `"Email already exists"` |
| `dateOfBirth` | `required` | `"Date of birth is required"` |
| `grade` | `required` | `"Grade is required"` |
| `grade` | `maxlength` | `"Grade cannot exceed 50 characters"` |

---

## Buttons

| Button | Material Type | Behavior |
|--------|--------------|---------|
| Save | `mat-raised-button` (primary) | Call `onSubmit()` |
| Cancel | `mat-button` | `dialogRef.close(false)` |

Submit button uses `(click)="onSubmit()"` (not `type="submit"` / `ngSubmit`) because `mat-dialog-actions` is outside the `<form>` element.

---

## States

| State | Display |
|-------|---------|
| Loading student (edit mode) | `MatProgressSpinner` centered; form hidden |
| Form ready | Form fields visible and interactive |
| Submitting | Save button disabled |
| Submit success | `MatSnackBar` success → `dialogRef.close(true)` |
| Submit error 409 | Set `serverDuplicate` error on email field |
| Submit error 500 | Generic `MatSnackBar` error message |
| Student not found (edit) | `MatSnackBar` `"Student not found"` → `dialogRef.close(false)` |

---

## Service Calls

| Event | Method | API Call |
|-------|--------|----------|
| Edit mode init | `studentService.getById(id)` | `GET /api/students/:id` |
| Add mode submit | `studentService.create(request)` | `POST /api/students` |
| Edit mode submit | `studentService.update(id, request)` | `PUT /api/students/:id` |

---

## Angular Material Components Used

| Component | Purpose |
|-----------|---------|
| `MatDialogTitle` / `MatDialogContent` / `MatDialogActions` | Dialog structure |
| `MatFormField` (appearance="outline", floatLabel="always") | Wrapper for each field |
| `MatInput` | Text / email / date inputs |
| `MatError` | Inline validation error messages |
| `MatButton` | Save and Cancel buttons |
| `MatProgressSpinner` | Loading state (edit mode) |
| `MatSnackBar` | Success and error feedback toasts |
| `ReactiveFormsModule` | `FormBuilder`, `FormGroup`, `Validators` |
