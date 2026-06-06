import { Routes } from '@angular/router';
import { AppShellComponent } from './shared/components/app-shell/app-shell';
import { DashboardComponent } from './features/dashboard/dashboard';
import { StudentListComponent } from './features/students/student-list/student-list';
import { StudentDetailComponent } from './features/students/student-detail/student-detail';
import { TeacherListComponent } from './features/teachers/teacher-list/teacher-list';
import { TeacherDetailComponent } from './features/teachers/teacher-detail/teacher-detail';

export const routes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      { path: '', redirectTo: 'students', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'students', component: StudentListComponent },
      { path: 'teachers', component: TeacherListComponent },
    ],
  },
  { path: 'students/:id', component: StudentDetailComponent },
  { path: 'teachers/:id', component: TeacherDetailComponent },
];
