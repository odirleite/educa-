export type College = {
  id: string;
  name: string;
  color: string;
  progress?: number;
  missingRequirements?: string;
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
};

export type Task = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  subjectId: string;
  completed: boolean;
};
