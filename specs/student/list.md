---
spec_path: School POC app/school-poc/specs/student/list.md
type: frontend-page-spec
related:
  - School POC app/school-poc/specs/student/index.md
  - School POC app/school-poc/specs/student/form.md
  - School POC app/school-poc/specs/student/detail.md
  - School POC/api_endpoints.md
---

# Student List Page

## Route
`/students`

## Component
`StudentListComponent` — standalone, `ChangeDetectionStrategy.OnPush`

---

## UI Layout

```
┌──── sidebar (256px) ──────────────────────────────────────────────────┐
│ Main Campus       │  [mat-toolbar]  Students                          │
│ Admin Portal      │  ──────────────────────────────────────────────── │
│                   │  [ 🔍 Search students...                        ]  │
│  Dashboard        │                                                   │
│  ● Students       │  ┌─────────────────────────────────────────────┐  │
│  Teachers         │  │ NAME      EMAIL       GRADE  ENROLLED  ACT  │  │
│                   │  ├─────────────────────────────────────────────┤  │
│                   │  │ JD  John  j@…  Gr 10  Sep 1, 2023   ✏ 🗑  │  │
│                   │  │ JS  Jane  s@…  Gr 11  Oct 5, 2023   ✏ 🗑  │  │
│  [+ New Reg.]     │  └─────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────┘
```

Layout: `.app-shell` flex row — 256px sidebar + `flex: 1` main content.
**`.page-container` uses `padding: 24px` only — no max-width constraint — content fills the full available width.**

---

## Table Columns

| Column | Content | Notes |
|--------|---------|-------|
| Name | Avatar initials + `firstName + ' ' + lastName` | Entire cell is a `routerLink` to `/students/:id` |
| Email | `email` | Display only |
| Grade | `grade` wrapped in `.grade-badge` | Styled pill |
| Enrolled Date | `enrolledAt` formatted `MMM d, y` via `DatePipe` | Display only |
| Actions | Edit / Delete icon buttons | 2 icon buttons |

---

## Actions

| Action | Icon | Behavior |
|--------|------|----------|
| Name click | (entire name cell is `<a [routerLink]>`) | Navigate to `/students/:id` (detail page) |
| Add Student | toolbar button + sidebar "New Registration" | Open `StudentFormDialogComponent` in `MatDialog`; reload list on success |
| Edit | `edit` icon button | Open `StudentFormDialogComponent` (edit mode) in `MatDialog`; reload list on success |
| Delete | `delete` icon button (color="warn") | Open `ConfirmDialogComponent` → call DELETE API → refresh list |

---

## Delete Confirmation Dialog

- Component: Angular Material `MatDialog`
- Title: `"Delete Student"`
- Message: `"Are you sure you want to delete [FirstName LastName]? This action cannot be undone."`
- Buttons: `Cancel` (mat-button) / `Delete` (mat-raised-button, color="warn")
- On confirm: call `DELETE /api/students/:id` → show success `MatSnackBar` → reload list
- On cancel: dismiss dialog, no action

---

## Search Behavior

- `MatFormField` appearance="outline" with `matPrefix` search icon; 300ms debounce
- Calls `GET /api/students?search=term` on each debounced keystroke
- Clearing the search field reloads the full unfiltered list
- Search is server-side (API handles filtering)

---

## States

| State | Display |
|-------|---------|
| Loading | `MatProgressSpinner` centered on page |
| Loaded, has data | `MatTable` with rows |
| Loaded, no students | Message: `"No students found. Click 'New Registration' to get started."` |
| Loaded, search no results | Message: `"No students match your search."` |
| Error loading | `MatSnackBar` with error message |
| Error deleting | `MatSnackBar` with error message |

---

## Service Calls

| Event | Service Method | API Call |
|-------|---------------|----------|
| Page init | `studentService.getAll()` | `GET /api/students` |
| Search input (debounced) | `studentService.getAll(search)` | `GET /api/students?search=term` |
| Delete confirmed | `studentService.delete(id)` | `DELETE /api/students/:id` |

---

## Pagination

- Uses `MatTableDataSource` + `MatPaginator`
- Page size: 10 rows default; options `[10, 25, 50]`
- Paginator is **hidden** (CSS class `.paginator-hidden { display: none }`) when `dataSource.data.length <= 10`
- Hiding via CSS (not `*ngIf`) keeps the paginator in the DOM so `@ViewChild` can wire it in `ngAfterViewInit`

---

## Angular Material Components Used

| Component | Purpose |
|-----------|---------|
| `MatToolbar` | Page header bar |
| `MatFormField` + `MatInput` | Search field (appearance="outline", no `<mat-label>`, placeholder only, `subscriptSizing="dynamic"`) |
| `MatTable` / `MatTableDataSource` | Student data table |
| `MatHeaderRow` / `MatRow` | Table rows |
| `MatPaginator` | Table pagination |
| `MatIconButton` | Edit / Delete action buttons |
| `MatIcon` | Icons for actions |
| `MatProgressSpinner` | Loading state |
| `MatDialog` | Add/Edit form dialog + Delete confirmation modal |
| `MatSnackBar` | Success and error feedback toasts |
| `DatePipe` | Format `enrolledAt` timestamp |
