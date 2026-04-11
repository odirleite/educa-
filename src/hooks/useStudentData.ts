import { useState, useEffect } from 'react';
import { Subject, Task, College } from '../types';

export function useStudentData() {
  const [colleges, setColleges] = useState<College[]>(() => {
    const saved = localStorage.getItem('student_colleges');
    return saved ? JSON.parse(saved) : [
      { id: 'c1', name: 'Faculdade 1', color: '#3b82f6', progress: 0, missingRequirements: '' },
      { id: 'c2', name: 'Faculdade 2', color: '#8b5cf6', progress: 0, missingRequirements: '' }
    ];
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('student_subjects');
    const parsed = saved ? JSON.parse(saved) : [];
    return parsed.map((s: any) => ({ ...s, collegeId: s.collegeId || 'c1' }));
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('student_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('student_colleges', JSON.stringify(colleges));
  }, [colleges]);

  useEffect(() => {
    localStorage.setItem('student_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('student_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addCollege = (college: Omit<College, 'id'>) => {
    setColleges([...colleges, { ...college, id: crypto.randomUUID() }]);
  };

  const updateCollege = (id: string, updated: Partial<College>) => {
    setColleges(colleges.map(c => c.id === id ? { ...c, ...updated } : c));
  };

  const deleteCollege = (id: string) => {
    setColleges(colleges.filter(c => c.id !== id));
    const subjectsToDelete = subjects.filter(s => s.collegeId === id).map(s => s.id);
    setSubjects(subjects.filter(s => s.collegeId !== id));
    setTasks(tasks.filter(t => !subjectsToDelete.includes(t.subjectId)));
  };

  const addSubject = (subject: Omit<Subject, 'id'>) => {
    const newSubject = { ...subject, id: crypto.randomUUID() };
    setSubjects([...subjects, newSubject]);
  };

  const updateSubject = (id: string, updated: Partial<Subject>) => {
    setSubjects(subjects.map(s => s.id === id ? { ...s, ...updated } : s));
  };

  const deleteSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
    // Also delete associated tasks
    setTasks(tasks.filter(t => t.subjectId !== id));
  };

  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask = { ...task, id: crypto.randomUUID() };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (id: string, updated: Partial<Task>) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, ...updated } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const toggleTaskCompletion = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return {
    colleges,
    subjects,
    tasks,
    addCollege,
    updateCollege,
    deleteCollege,
    addSubject,
    updateSubject,
    deleteSubject,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion
  };
}
