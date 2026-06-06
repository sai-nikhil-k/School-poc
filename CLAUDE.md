---
spec_path: School POC app/school-poc/CLAUDE.md
type: frontend-overview
related:
  - School POC/CLAUDE.md
  - School POC/api_endpoints.md
  - School POC/design.system.md
---

# Frontend — Angular Application

## Overview
Angular SPA for the School POC. Student/teacher management UI + dashboard, backed by the ASP.NET Core API.

## Tech
- Angular (latest), standalone components, `ChangeDetectionStrategy.OnPush`
- Angular Material MDC (UI components + theming)
- Reactive Forms (`FormBuilder`, `FormGroup`, `Validators`)
- Angular Router, HttpClient, Signals (`signal()`), `takeUntilDestroyed()`

---

## Project Structure

```
src/
├── app/
│   ├── app.ts                        ← root component (inline: <router-outlet />)
│   ├── app.routes.ts                 ← route definitions
│   ├── core/
│   │   └── services/
│   │       ├── student.service.ts
│   │       ├── teacher.service.ts
│   │       └── dashboard.service.ts
│   ├── models/
│   │   ├── student.model.ts
│   │   ├── teacher.model.ts
│   │   └── dashboard.model.ts
│   ├── shared/
│   │   └── components/
│   │       ├── app-shell/            ← sidebar layout (parent route for list/dashboard pages)
│   │       └── confirm-dialog/       ← shared delete confirmation dialog
│   └── features/
│       ├── dashboard/
│       ├── students/
│       │   ├── student-list/
│       │   ├── student-detail/
│       │   └── student-form-dialog/
│       └── teachers/
│           ├── teacher-list/
│           ├── teacher-detail/
│           └── teacher-form-dialog/
├── environments/
│   └── environment.ts                ← apiUrl: 'http://localhost:5090/api'
└── styles.css                        ← global tokens, sidebar, toolbar, badges, responsive
```

---

## Routes

```
AppShellComponent (path: '')          ← sidebar + <router-outlet>
  ├── /dashboard  → DashboardComponent
  ├── /students   → StudentListComponent
  ├── /teachers   → TeacherListComponent
  └── /           → redirect → /students

/students/:id  → StudentDetailComponent   ← standalone, no sidebar
/teachers/:id  → TeacherDetailComponent   ← standalone, no sidebar
```

Add/Edit for both entities: `MatDialog` only — no page routes.

---

## Component Rules

- Every component is standalone (`standalone: true`)
- All list, detail, and dialog components: `ChangeDetectionStrategy.OnPush`
- Services injected via `inject()` — never constructor parameters
- Local reactive state: `signal()`
- Subscriptions: `takeUntilDestroyed()` — always

## Service Rules

```
Component → Service → HttpClient → API
```

- `HttpClient` lives only in services, never in components
- Method naming: `getAll()`, `getById(id)`, `create(request)`, `update(id, request)`, `delete(id)`
- All methods return `Observable`
- Services handle HTTP and data shaping only — no UI logic

---

## Models

### Student
```typescript
export interface Student {
  id: string;
  firstName: string; lastName: string;
  email: string;
  dateOfBirth: string;        // ISO date "2000-01-15"
  grade: string;
  enrolledAt: string;         // ISO timestamp
  createdAt: string;          // ISO timestamp
  guardianName: string | null;
  contactNumber: string | null;
  address: string | null;
}
export interface CreateStudentRequest {
  firstName: string; lastName: string; email: string;
  dateOfBirth: string; grade: string;
  guardianName?: string | null; contactNumber?: string | null; address?: string | null;
}
// UpdateStudentRequest is identical to CreateStudentRequest
```

### Teacher
```typescript
export interface Teacher {
  id: string;
  firstName: string; lastName: string;
  email: string;
  phoneNumber: string | null;
  subject: string;
  joinedAt: string;   // ISO date "2020-09-01"
  isActive: boolean;
  createdAt: string;  // ISO timestamp
}
export interface CreateTeacherRequest {
  firstName: string; lastName: string; email: string;
  phoneNumber?: string | null; subject: string; joinedAt: string; isActive: boolean;
}
// UpdateTeacherRequest is identical to CreateTeacherRequest
```

---

## Design Standards

All design tokens (colors, spacing, typography, elevation), layout patterns (Type A/B/C), table/button/dialog/form/avatar/badge/animation/loading/empty-state standards are in the single source of truth:

**→ `School POC/design.system.md`**

Do not hardcode hex values, arbitrary pixel sizes, or duplicate UI patterns in this file.

---

## Responsive Breakpoints

| Breakpoint | Rule |
|------------|------|
| `≤ 767px` | Sidebar collapses from 256px to 68px (icon-only) — handled in `styles.css` |
| `≤ 768px` | Detail page two-column layout → single column |
| `≤ 900px` | Dashboard main grid + bento row → single column |
| `≤ 768px` | Dashboard stat cards → 2-column |
| `≤ 480px` | Dashboard stat cards → 1-column; form `.form-row` → single column |

Never allow page-level overflow. Tables use `overflow: hidden` on the container for border-radius.

---

## Confirm Dialog (shared)

```typescript
this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(
  ConfirmDialogComponent,
  { data: { title: 'Delete Entity', message: 'Are you sure...' }, width: '400px' }
);
```
Located at: `src/app/shared/components/confirm-dialog/confirm-dialog.ts`

---

## Performance

- `ChangeDetectionStrategy.OnPush` on all list, detail, and dialog components
- `takeUntilDestroyed()` for all subscriptions inside components
- `async` pipe preferred over manual subscribe when template binding suffices
- `debounceTime(300)` + `distinctUntilChanged()` on all search inputs — never call API on every keystroke
- `forkJoin` for parallel API calls (dashboard stats + recent)
- `MatTableDataSource` for all mat-tables — enables paginator and client-side filter
- Never import an entire Angular Material module for one component

---

## Accessibility

- All icon-only buttons: `title` attribute required — `<button mat-icon-button title="Delete">`
- `mat-form-field` with `floatLabel="always"` — label always visible
- Badges: color + text (never color alone) — "Active" / "Inactive"
- Semantic HTML: `<aside>` for sidebar, `<nav>` for navigation, `<table>` for tabular data

---

## Code Quality

- Remove all unused imports before committing; no dead code
- No local redefinition of global CSS classes (`.toolbar-spacer`, `.avatar-initials`, `.btn-icon-text`)
- No hardcoded hex colors — use CSS tokens defined in `School POC/design.system.md`
- `!important` only for Angular Material MDC overrides
- Date formats: `'mediumDate'` for dates, `'medium'` for timestamps — never `'MMMM d, y'`
- Component naming: `{Entity}{Role}Component` (e.g., `StudentListComponent`)
- Service naming: `{Entity}Service`; Model naming: `{Entity}`, `Create{Entity}Request`
- CSS classes: kebab-case, descriptive — e.g., `.name-cell`, `.field-grid-2col`

---

## Feature Index

Load the feature index first — it summarizes scope, components, API, and links to detailed page specs.

| Feature | Spec index |
|---------|-----------|
| Students | `specs/student/index.md` |
| Teachers | `specs/teacher/index.md` |
| Dashboard | `specs/dashboard/index.md` |

For detailed CSS component patterns: `School POC/design.system.md`
