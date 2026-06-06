export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  subject: string;
  joinedAt: string;     // ISO date string e.g. "2020-09-01"
  isActive: boolean;
  createdAt: string;    // ISO timestamp
}

export interface CreateTeacherRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  subject: string;
  joinedAt: string;
  isActive: boolean;
}

export type UpdateTeacherRequest = CreateTeacherRequest;
