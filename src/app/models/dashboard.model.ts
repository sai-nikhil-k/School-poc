export interface GradeCount {
  grade: string;
  count: number;
}

export interface DashboardStats {
  totalStudents: number;
  byGrade: GradeCount[];
}
