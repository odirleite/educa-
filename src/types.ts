export type College = {
  id: string;
  name: string;
  color: string;
  progress?: number;
  missingRequirements?: string;
  userId?: string;
  createdAt?: string;
};

export type Subject = {
  id: string;
  name: string;
  color: string;
  professor: string;
  schedule: string;
  collegeId: string;
  notes?: string;
  status?: 'active' | 'completed';
  semester?: string;
  progress?: number;
  userId?: string;
  createdAt?: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  subjectId: string;
  completed: boolean;
  userId?: string;
  createdAt?: string;
};
