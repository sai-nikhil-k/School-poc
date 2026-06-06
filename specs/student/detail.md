---
spec_path: School POC app/school-poc/specs/student/detail.md
type: frontend-page-spec
related:
  - School POC app/school-poc/specs/student/index.md
  - School POC app/school-poc/specs/student/list.md
  - School POC app/school-poc/specs/student/form.md
  - School POC/api_endpoints.md
---

# Student Detail Page

## Route
`/students/:id`

## Component
`StudentDetailComponent` — standalone, `ChangeDetectionStrategy.OnPush`

---

## UI Layout

No sidebar. Full-viewport width layout with `padding: 32px 24px`.

```
┌─ mat-toolbar ─────────────────────────────────[Edit] [Delete]──┐
│  ←   Student Details                                           │
├──────────────────────────────────────────────────────────────── │
│  ┌── profile-col (1fr) ──┐  ┌── detail-col (2fr) ────────────┐ │
│  │ ████████████████████  │  │ Personal Information  ID: STU-x │ │
│  │      [Avatar]         │  │ ─────────────────────────────── │ │
│  │   Full Name           │  │ Full Name      John Doe          │ │
│  │   Grade               │  │ Email          j@email.com       │ │
│  │   Active Student      │  │ Grade / Level  Grade 10          │ │
│  ├───────────────────────│  │ Date of Birth  Jan 1, 2005       │ │
│  │ [Attendance] [GPA]    │  │ Enrolled Date  Sep 1, 2023       │ │
│  │    94%        3.82    │  │ Created Date   Sep 1, 2023 …     │ │
│  └───────────────────────┘  └─────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

Grid: `.detail-layout { grid-template-columns: 1fr 2fr; gap: 24px; }`
Breakpoint `≤ 900px`: stacks to single column.

---

## Left Column — Profile Card

- **Hero band**: 120px gradient band (`#24389c → #4355b9`)
- **Avatar**: 80px circle with initials (`firstName[0] + lastName[0]`), overlapping the hero band by 40px; background `#dee0ff`, color `#27378a`, 4px white border
- **Name**: `firstName + ' ' + lastName`, 20px bold
- **Grade**: subtitle text, 13px
- **Status badge**: `.status-badge.active` — "Active Student"

---

## Left Column — Quick Stats

Two stat cards in a 2-column grid below the profile card:

| Card | Value | Extra |
|------|-------|-------|
| Attendance | 94% (static placeholder) | Progress bar track |
| GPA | 3.82 (static placeholder) | — |

These are decorative POC elements; no real data from API.

---

## Right Column — Personal Information Card

Card header shows "Personal Information" title + `ID: STU-<first 8 chars of UUID, uppercase>`.

| Row | Label | Value | Condition |
|-----|-------|-------|-----------|
| 1 | Full Name | `firstName + ' ' + lastName` | Always shown |
| 2 | Email | `email` (styled primary color) | Always shown |
| 3 | Grade / Level | `grade` in `.grade-badge` | Always shown |
| 4 | Date of Birth | `dateOfBirth | date:'MMMM d, y'` | Always shown |
| 5 | Enrolled Date | `enrolledAt | date:'MMMM d, y'` | Always shown |
| 6 | Created Date | `createdAt | date:'medium'` | Always shown |
| 7 | Guardian Name | `guardianName` | Only if non-null |
| 8 | Contact Number | `contactNumber` | Only if non-null |
| 9 | Address | `address` | Only if non-null |

Optional rows rendered with `@if (s.guardianName)` etc.
Alternating row background: `rgba(36, 56, 156, 0.02)` on even rows.

---

## Toolbar Buttons

| Button | Type | Behavior |
|--------|------|----------|
| Back arrow | `mat-icon-button` | Navigate to `/students` |
| Edit | `mat-stroked-button` | Open `StudentFormDialogComponent` (edit mode) in `MatDialog`; reload student on success |
| Delete | `mat-raised-button` color="warn" | Open `ConfirmDialogComponent` → call DELETE API → navigate to `/students` |

---

## Delete Confirmation Dialog

- Component: `ConfirmDialogComponent` (shared)
- Title: `"Delete Student"`
- Message: `"Are you sure you want to delete [FirstName LastName]? This action cannot be undone."`
- On confirm: `DELETE /api/students/:id` → `MatSnackBar` success → navigate to `/students`
- On cancel: dismiss, no action

---

## States

| State | Display |
|-------|---------|
| Loading | `MatProgressSpinner` centered |
| Loaded | Two-column detail layout |
| Error / not found | `MatSnackBar` `"Student not found"` → navigate to `/students` |
| Delete success | `MatSnackBar` `"Student deleted successfully"` → navigate to `/students` |
| Delete error | `MatSnackBar` `"Failed to delete student"` |

---

## Service Calls

| Event | Method | API Call |
|-------|--------|----------|
| Page init | `studentService.getById(id)` | `GET /api/students/:id` |
| Delete confirmed | `studentService.delete(id)` | `DELETE /api/students/:id` |

---

## Angular Material Components Used

| Component | Purpose |
|-----------|---------|
| `MatToolbar` | Page header bar with Edit / Delete actions |
| `MatCard` | Personal information card (right column) |
| `MatButton` / `MatIconButton` | Toolbar action buttons |
| `MatIcon` | Icons (`arrow_back`, `edit`, `delete`) |
| `MatProgressSpinner` | Loading state |
| `MatDialog` | Delete confirmation modal |
| `MatSnackBar` | Success and error feedback toasts |
| `DatePipe` | Format date fields |
