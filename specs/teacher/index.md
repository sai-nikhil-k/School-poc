---
spec_path: School POC app/school-poc/specs/teacher/index.md
type: feature-index
related:
  - School POC app/school-poc/CLAUDE.md
  - School POC api/specs/teacher/index.md
---

# Teacher Feature — Frontend Index

## Scope
Full CRUD with active toggle: list view, add dialog, edit dialog, detail view, delete confirmation.

## Routes
| Route | Component | Layout |
|-------|-----------|--------|
| `/teachers` | `TeacherListComponent` | Type A — inside AppShell |
| `/teachers/:id` | `TeacherDetailComponent` | Type C — standalone, no sidebar |
| Add / Edit | `TeacherFormDialogComponent` | MatDialog — no route |

## Components
| Component | Path | Role |
|-----------|------|------|
| `TeacherListComponent` | `features/teachers/teacher-list/` | List with search, table, pagination, active toggle |
| `TeacherFormDialogComponent` | `features/teachers/teacher-form-dialog/` | Add/Edit modal dialog |
| `TeacherDetailComponent` | `features/teachers/teacher-detail/` | Detail view — profile + info cards |

## Service
`TeacherService` → `core/services/teacher.service.ts`
Methods: `getAll(search?)`, `getById(id)`, `create(req)`, `update(id, req)`, `delete(id)`, `toggleActive(id)`

## Model (`models/teacher.model.ts`)
Fields: `id`, `firstName`, `lastName`, `email`, `subject`, `joinedAt`, `isActive`, `createdAt`
Optional: `phoneNumber`

## API Endpoints
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/teachers` | List (optional `?search=`) — matches FirstName, LastName, Subject |
| GET | `/api/teachers/{id}` | Get by ID |
| POST | `/api/teachers` | Create → `201` + Location header |
| PUT | `/api/teachers/{id}` | Full update |
| DELETE | `/api/teachers/{id}` | Hard delete → `204` |
| PATCH | `/api/teachers/{id}/toggle-active` | Flip IsActive flag → `200 TeacherDto` |

## Page Specs
- `list.md` — table columns (with clickable status badge), actions, search, pagination, states
- `form.md` — form fields (datepicker, active toggle), validation, add/edit modes
- `detail.md` — profile card, two-column info grid, toolbar actions, states
