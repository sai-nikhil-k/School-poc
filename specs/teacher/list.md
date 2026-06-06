---
spec_path: School POC app/school-poc/specs/teacher/list.md
type: frontend-page-spec
related:
  - School POC app/school-poc/specs/teacher/index.md
  - School POC app/school-poc/specs/teacher/form.md
  - School POC app/school-poc/specs/teacher/detail.md
  - School POC/api_endpoints.md
---

# Teacher List Page

## Route
`/teachers`

## Component
`TeacherListComponent` — standalone, `ChangeDetectionStrategy.OnPush`, implements `OnInit`, `AfterViewInit`

---

## UI Layout

```
┌──── sidebar (256px) ────────────────────────────────────────────────────┐
│ Main Campus       │  [mat-toolbar]  Teachers          [+ Add Teacher]   │
│ Admin Portal      │  ──────────────────────────────────────────────────  │
│                   │  [ 🔍 Search by name, email or subject...         ]  │
│  Dashboard        │                                                      │
│  Students         │  ┌───────────────────────────────────────────────┐  │
│  ● Teachers       │  │ NAME    EMAIL    SUBJECT  STATUS  ACTIONS      │  │
│                   │  ├───────────────────────────────────────────────┤  │
│                   │  │ JD  J.Doe  j@…  Math  [Active]  👁 ✏ 🗑      │  │
│  [+ New Reg.]     │  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

Layout: `.app-shell` flex row — 256px sidebar + `flex: 1` main content.
**`.page-container` uses `padding: 24px` only — no `max-width`, no `margin: auto`.**

---

## Table Columns

| Column | Content | Notes |
|--------|---------|-------|
| Name | Avatar initials + `firstName + ' ' + lastName` | Entire cell is `<a [routerLink]>` to `/teachers/:id` |
| Email | `email` | Display only |
| Subject | `subject` | Display only |
| Status | `.status-badge` — `Active` / `Inactive` | Clickable — calls `toggleActive()` on click |
| Actions | View / Edit / Delete icon buttons | 3 icon buttons |

---

## Actions

| Action | Behavior |
|--------|----------|
| Name click | Navigate to `/teachers/:id` (detail page) |
| Add Teacher | Toolbar button + sidebar "New Registration" → open `TeacherFormDialogComponent` in `MatDialog`; reload list on success |
| View | `visibility` icon button → navigate to `/teachers/:id` |
| Edit | `edit` icon button → open `TeacherFormDialogComponent` (edit mode); reload on success |
| Status badge click | Call `PATCH /api/teachers/:id/toggle-active` → update row in-place |
| Delete | `delete` icon button (warn) → open `ConfirmDialogComponent` → call DELETE API → reload list |

---

## Pagination

- Uses `MatTableDataSource` + `MatPaginator`
- Page size: 10 default; options `[10, 25, 50]`
- Paginator hidden via CSS class `.paginator-hidden` when `dataSource.data.length <= 10`
- Wire in `ngAfterViewInit`: `this.dataSource.paginator = this.paginator`

---

## Search

- `MatFormField` `appearance="outline"` — **no `<mat-label>`**, placeholder only, `subscriptSizing="dynamic"`
- 300ms debounce via `debounceTime` + `distinctUntilChanged`
- Calls `GET /api/teachers?search=term` on each debounced keystroke
- Clearing reloads full list

---

## States

| State | Display |
|-------|---------|
| Loading | `MatProgressSpinner` centered |
| Loaded, has data | `MatTable` with rows |
| Loaded, no teachers | `"No teachers found. Click 'Add Teacher' to get started."` |
| Loaded, search no results | `"No teachers match your search."` |
| Error loading | `MatSnackBar` error |
| Error deleting | `MatSnackBar` error |
| Error toggling active | `MatSnackBar` error |

---

## Angular Material Components Used

| Component | Purpose |
|-----------|---------|
| `MatToolbar` | Page header bar |
| `MatFormField` + `MatInput` | Search field (no label, placeholder only, `subscriptSizing="dynamic"`) |
| `MatTable` / `MatTableDataSource` | Teacher data table |
| `MatPaginator` | Table pagination |
| `MatIconButton` | View / Edit / Delete action buttons |
| `MatIcon` | Icons |
| `MatProgressSpinner` | Loading state |
| `MatDialog` | Add/Edit form dialog + Delete confirmation |
| `MatSnackBar` | Feedback toasts |
