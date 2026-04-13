import { useState, useEffect } from 'react';
import { Subject, Task, College } from '../types';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, doc, setDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function useStudentData(userId: string | null) {
  const [colleges, setColleges] = useState<College[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!userId) {
      setColleges([]);
      setSubjects([]);
      setTasks([]);
      return;
    }

    const qColleges = query(collection(db, 'colleges'), where('userId', '==', userId));
    const unsubColleges = onSnapshot(qColleges, (snapshot) => {
      setColleges(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as College)));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'colleges'));

    const qSubjects = query(collection(db, 'subjects'), where('userId', '==', userId));
    const unsubSubjects = onSnapshot(qSubjects, (snapshot) => {
      setSubjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject)));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'subjects'));

    const qTasks = query(collection(db, 'tasks'), where('userId', '==', userId));
    const unsubTasks = onSnapshot(qTasks, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'tasks'));

    return () => {
      unsubColleges();
      unsubSubjects();
      unsubTasks();
    };
  }, [userId]);

  const addCollege = async (college: Omit<College, 'id'>) => {
    if (!userId) return;
    const id = crypto.randomUUID();
    try {
      await setDoc(doc(db, 'colleges', id), { ...college, id, userId, createdAt: new Date().toISOString() });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'colleges');
    }
  };

  const updateCollege = async (id: string, updated: Partial<College>) => {
    try {
      await updateDoc(doc(db, 'colleges', id), updated);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'colleges');
    }
  };

  const deleteCollege = async (id: string) => {
    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'colleges', id));
      
      const subjectsToDelete = subjects.filter(s => s.collegeId === id);
      subjectsToDelete.forEach(s => {
        batch.delete(doc(db, 'subjects', s.id));
      });

      const subjectIds = subjectsToDelete.map(s => s.id);
      const tasksToDelete = tasks.filter(t => subjectIds.includes(t.subjectId));
      tasksToDelete.forEach(t => {
        batch.delete(doc(db, 'tasks', t.id));
      });

      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'colleges');
    }
  };

  const addSubject = async (subject: Omit<Subject, 'id'>) => {
    if (!userId) return;
    const id = crypto.randomUUID();
    try {
      await setDoc(doc(db, 'subjects', id), { ...subject, id, userId, createdAt: new Date().toISOString() });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'subjects');
    }
  };

  const updateSubject = async (id: string, updated: Partial<Subject>) => {
    try {
      await updateDoc(doc(db, 'subjects', id), updated);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'subjects');
    }
  };

  const deleteSubject = async (id: string) => {
    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'subjects', id));
      
      const tasksToDelete = tasks.filter(t => t.subjectId === id);
      tasksToDelete.forEach(t => {
        batch.delete(doc(db, 'tasks', t.id));
      });

      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'subjects');
    }
  };

  const addTask = async (task: Omit<Task, 'id'>) => {
    if (!userId) return;
    const id = crypto.randomUUID();
    try {
      await setDoc(doc(db, 'tasks', id), { ...task, id, userId, createdAt: new Date().toISOString() });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'tasks');
    }
  };

  const updateTask = async (id: string, updated: Partial<Task>) => {
    try {
      await updateDoc(doc(db, 'tasks', id), updated);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'tasks');
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'tasks');
    }
  };

  const toggleTaskCompletion = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    try {
      await updateDoc(doc(db, 'tasks', id), { completed: !task.completed });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'tasks');
    }
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
