export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  grade: string;
  enrolledAt: string;
  createdAt: string;
  guardianName: string | null;
  contactNumber: string | null;
  address: string | null;
}

export interface CreateStudentRequest {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  grade: string;
  guardianName?: string | null;
  contactNumber?: string | null;
  address?: string | null;
}

export type UpdateStudentRequest = CreateStudentRequest;
