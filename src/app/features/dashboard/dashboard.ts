import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';

import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardStats } from '../../models/dashboard.model';
import { Student } from '../../models/student.model';

@Component({
  selector: 'app-dashboard',
  imports: [
    DatePipe,
    RouterLink,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly snackBar = inject(MatSnackBar);

  readonly stats = signal<DashboardStats | null>(null);
  readonly recent = signal<Student[]>([]);
  readonly loading = signal(false);

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading.set(true);
    forkJoin({
      stats: this.dashboardService.getStats(),
      recent: this.dashboardService.getRecent()
    }).subscribe({
      next: ({ stats, recent }) => {
        this.stats.set(stats);
        this.recent.set(recent);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Failed to load dashboard data', 'Close', { duration: 3000 });
      }
    });
  }
}
