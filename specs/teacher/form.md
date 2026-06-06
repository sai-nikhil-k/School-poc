---
spec_path: School POC app/school-poc/specs/teacher/form.md
type: frontend-page-spec
related:
  - School POC app/school-poc/specs/teacher/index.md
  - School POC app/school-poc/specs/teacher/list.md
  - School POC/api_endpoints.md
  - School POC api/specs/teacher/validation.md
---

# Teacher Form Dialog

## Overview
Add and edit teachers are handled via a `MatDialog` modal — there are no separate page routes for these actions.

## Component
`TeacherFormDialogComponent` — standalone, opened via `MatDialog`.

Dialog data interface:
```typescript
export interface TeacherFormDialogData {
  teacherId?: string; // undefined = add mode, set = edit mode
}
```

Return value: `true` on success (caller reloads data), `false`/`undefined` on cancel.

---

## UI Layout

```
┌─ mat-dialog-title ──────────────────────────────────┐
│  Add Teacher  /  Edit Teacher                  [×]  │
├──────────────────────────────────────────────────── │
│  mat-dialog-content (scrollable, max-height: 70vh)  │
│                                                      │
│  Teacher Information                                 │
│  ─────────────────────────────────────────────────  │
│  [First Name *]          [Last Name *]               │
│  [Email *]               [Phone Number]              │
│  [Subject *]             [Join Date *]               │
│  [ Active toggle ]                                   │
│                                                      │
├──────────────────────────────────────────────────── │
│  mat-dialog-actions              [Cancel] [Save]     │
└──────────────────────────────────────────────────── │
```

Dialog opened with: `width: '640px'`, `maxHeight: '90vh'`.

All `mat-form-field` elements use `appearance="outline"`, `floatLabel="always"`, `subscriptSizing="dynamic"`.

---

## Form Fields

| Field | Control Name | Material Component | Validators |
|-------|-------------|-------------------|------------|
| First Name | `firstName` | `MatInput` (text) | Required, MaxLength(100) |
| Last Name | `lastName` | `MatInput` (text) | Required, MaxLength(100) |
| Email | `email` | `MatInput` (email) | Required, Email format, MaxLength(255) |
| Phone Number | `phoneNumber` | `MatInput` (tel) | Optional, MaxLength(20) |
| Subject | `subject` | `MatInput` (text) | Required, MaxLength(100) |
| Join Date | `joinedAt` | `MatDatepicker` | Required, not in future (`joinedAtNotFutureValidator`) |
| Active | `isActive` | `MatSlideToggle` | — (boolean, default `true`) |

---

## Mode Behavior

### Add Mode (`data.teacherId` is undefined)
- Title: `"Add Teacher"`
- All fields empty; `isActive` defaults to `true`
- Submit calls: `POST /api/teachers`
- On success: snackbar `"Teacher added successfully"` → `dialogRef.close(true)`

### Edit Mode (`data.teacherId` is set)
- Title: `"Edit Teacher"`
- Load via `GET /api/teachers/:id`; patch form; `joinedAt` patched as `new Date(teacher.joinedAt + 'T00:00:00')`
- Show `MatProgressSpinner` while fetching; form hidden
- Submit calls: `PUT /api/teachers/:id`
- On success: snackbar `"Teacher updated successfully"` → `dialogRef.close(true)`
- If not found: snackbar error → `dialogRef.close(false)`

---

## Validation

| Field | Error | Message |
|-------|-------|---------|
| `firstName` | `required` | `"First name is required"` |
| `firstName` | `maxlength` | `"First name cannot exceed 100 characters"` |
| `lastName` | `required` | `"Last name is required"` |
| `lastName` | `maxlength` | `"Last name cannot exceed 100 characters"` |
| `email` | `required` | `"Email is required"` |
| `email` | `email` | `"Please enter a valid email address"` |
| `email` | `maxlength` | `"Email cannot exceed 255 characters"` |
| `email` | `serverDuplicate` | `"Email already exists"` |
| `phoneNumber` | `maxlength` | `"Phone number cannot exceed 20 characters"` |
| `subject` | `required` | `"Subject is required"` |
| `subject` | `maxlength` | `"Subject cannot exceed 100 characters"` |
| `joinedAt` | `required` | `"Join date is required"` |
| `joinedAt` | `futureDate` | `"Join date cannot be in the future"` |

---

## Buttons

| Button | Behavior |
|--------|----------|
| Save / Save Changes | `(click)="onSubmit()"` — NOT `type="submit"` (dialog-actions is outside `<form>`) |
| Cancel | `dialogRef.close(false)` |

---

## States

| State | Display |
|-------|---------|
| Loading (edit) | `MatProgressSpinner`; form hidden |
| Form ready | All fields visible |
| Submitting | Save button disabled + spinner |
| Success | Snackbar → `dialogRef.close(true)` |
| Error 409 | `serverDuplicate` on email field |
| Error 400 | Map server field errors to controls |
| Error 500 | Generic snackbar |
