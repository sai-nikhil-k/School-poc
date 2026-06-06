---
spec_path: School POC app/school-poc/specs/teacher/detail.md
type: frontend-page-spec
related:
  - School POC app/school-poc/specs/teacher/index.md
  - School POC app/school-poc/specs/teacher/list.md
  - School POC/api_endpoints.md
---

# Teacher Detail Page

## Route
`/teachers/:id`

## Component
`TeacherDetailComponent` — standalone, `ChangeDetectionStrategy.OnPush`

---

## UI Layout

No sidebar. Full-width two-column layout with `padding: 32px 24px`.

```
┌─ mat-toolbar ─────────────────────────[Edit] [Delete]──┐
│  ←   Teacher Details                                    │
├──────────────────────────────────────────────────────── │
│  ┌── profile-col (240px) ─┐  ┌── detail-col (1fr) ───┐ │
│  │  [Avatar]              │  │ General Information     │ │
│  │  Full Name             │  │ ──────────────────────  │ │
│  │  Subject               │  │ FULL NAME  EMAIL        │ │
│  │  Teaching Faculty      │  │ SUBJECT    PHONE        │ │
│  │  ─────────────────     │  │ JOIN DATE  CREATED AT   │ │
│  │  Status: Active        │  └─────────────────────────┘ │
│  │  Joined: Sep 1, 2020   │                              │
│  └────────────────────────┘                              │
└──────────────────────────────────────────────────────── ┘
```

Grid: `.detail-layout { grid-template-columns: 240px 1fr; gap: 24px; }`

---

## Toolbar Buttons

| Button | Type | Behavior |
|--------|------|----------|
| Back arrow | `mat-icon-button` | Navigate to `/teachers` |
| Edit | `mat-stroked-button` | Open `TeacherFormDialogComponent` (edit mode); reload teacher on success |
| Delete | `mat-raised-button` color="warn" | Open `ConfirmDialogComponent` → DELETE API → navigate to `/teachers` |

Both Edit and Delete are shown only when `teacher()` is non-null.

---

## Left Column — Profile Card

- **Avatar**: 80px circle with initials (`firstName[0] + lastName[0]`), background `#dee0ff`, color `#27378a`
- **Name**: `firstName + ' ' + lastName`, 17px bold
- **Subject**: primary color, 13px
- **Role**: `"Teaching Faculty"`, 12px muted
- **Meta section** (below border): Status badge + Joined date

---

## Right Column — General Information Card

Two-column field grid (`1fr 1fr`):

| Label | Value | Notes |
|-------|-------|-------|
| Full Name | `firstName + ' ' + lastName` | — |
| Email | `email` | primary color |
| Subject | `subject` | — |
| Phone | `phoneNumber` | show `"—"` if null |
| Join Date | `joinedAt \| date:'mediumDate'` | — |
| Created At | `createdAt \| date:'medium'` | — |

---

## Delete Confirmation Dialog

- Component: `ConfirmDialogComponent` (shared)
- Title: `"Delete Teacher"`
- Message: `"Are you sure you want to delete [FirstName LastName]? This action cannot be undone."`
- On confirm: `DELETE /api/teachers/:id` → snackbar `"Teacher deleted successfully"` → navigate to `/teachers`
- On cancel: dismiss, no action

---

## States

| State | Display |
|-------|---------|
| Loading | `MatProgressSpinner` centered |
| Loaded | Two-column detail layout |
| Not found | `MatSnackBar` `"Teacher not found"` → navigate to `/teachers` |
| Delete success | `MatSnackBar` `"Teacher deleted successfully"` → navigate to `/teachers` |
| Delete error | `MatSnackBar` `"Failed to delete teacher"` |

---

## Angular Material Components Used

| Component | Purpose |
|-----------|---------|
| `MatToolbar` | Page header with Edit / Delete actions |
| `MatCard` | General information card |
| `MatButton` / `MatIconButton` | Toolbar buttons |
| `MatIcon` | Icons |
| `MatProgressSpinner` | Loading state |
| `MatDialog` | Edit form dialog + Delete confirmation |
| `MatSnackBar` | Feedback toasts |
| `DatePipe` | Format date fields |
