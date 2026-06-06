---
spec_path: School POC app/school-poc/specs/dashboard/index.md
type: feature-spec
related:
  - School POC app/school-poc/CLAUDE.md
  - School POC api/specs/dashboard/index.md
---

# Dashboard Page

## Route
`/dashboard` — inside AppShell (Type B page)

## Component
`DashboardComponent` — standalone, `ChangeDetectionStrategy.OnPush`

## Data Sources
Use `forkJoin` to load both APIs in parallel on init.

| API | Description |
|-----|-------------|
| `GET /api/dashboard/stats` | `{ totalStudents, byGrade: [{grade, count}] }` |
| `GET /api/dashboard/recent` | Last 5 enrolled students — `StudentDto[]` |

## UI Layout
Type B page layout: `padding: 32px 24px; display: flex; flex-direction: column; gap: 24px`

| Section | Content |
|---------|---------|
| Stat cards | Total students count card; grade breakdown with progress bars |
| Recent enrollments | Last 5 students — avatar initials + name + enrolled date |

## States
| State | Display |
|-------|---------|
| Loading | `MatProgressSpinner` centered (diameter="48") |
| Loaded | Stat cards + recent enrollments list |
| Error | `MatSnackBar` error message (duration: 3000) |
| Empty (no students) | "No data yet" placeholder message |

## Acceptance Criteria
- Shows total student count from `/api/dashboard/stats`
- Shows grade breakdown with per-grade counts and progress bars
- Shows last 5 enrolled students from `/api/dashboard/recent`
- Both APIs load in parallel via `forkJoin`
