---
spec_path: School POC app/school-poc/specs/student/index.md
type: feature-index
related:
  - School POC app/school-poc/CLAUDE.md
  - School POC api/specs/student/index.md
---

# Student Feature — Frontend Index

## Scope
Full CRUD: list view, add dialog, edit dialog, detail view, delete confirmation.

## Routes
| Route | Component | Layout |
|-------|-----------|--------|
| `/students` | `StudentListComponent` | Type A — inside AppShell |
| `/students/:id` | `StudentDetailComponent` | Type C — standalone, no sidebar |
| Add / Edit | `StudentFormDialogComponent` | MatDialog — no route |

## Components
| Component | Path | Role |
|-----------|------|------|
| `StudentListComponent` | `features/students/student-list/` | List with search, table, pagination |
| `StudentFormDialogComponent` | `features/students/student-form-dialog/` | Add/Edit modal dialog |
| `StudentDetailComponent` | `features/students/student-detail/` | Detail view — profile + info cards |

## Service
`StudentService` → `core/services/student.service.ts`
Methods: `getAll(search?)`, `getById(id)`, `create(req)`, `update(id, req)`, `delete(id)`

## Model (`models/student.model.ts`)
Fields: `id`, `firstName`, `lastName`, `email`, `dateOfBirth`, `grade`, `enrolledAt`, `createdAt`
Optional: `guardianName`, `contactNumber`, `address`

## API Endpoints
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/students` | List (optional `?search=`) — matches FirstName, LastName, Email |
| GET | `/api/students/{id}` | Get by ID |
| POST | `/api/students` | Create → `201` + Location header |
| PUT | `/api/students/{id}` | Full update |
| DELETE | `/api/students/{id}` | Hard delete → `204` |

## Page Specs
- `list.md` — table columns, actions, search, pagination, states
- `form.md` — form fields, validation, add/edit modes, error handling
- `detail.md` — profile card, info card, toolbar actions, states
