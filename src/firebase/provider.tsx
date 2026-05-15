'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { FirebaseStorage } from 'firebase/storage';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

export interface MockUser {
  uid: string;
  displayName: string;
  email: string;
  role: 'admin' | 'student';
}

interface FirebaseContextType {
  app: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  storage: FirebaseStorage;
  user: MockUser | null;
  loading: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const FirebaseContext = createContext<FirebaseContextType | null>(null);

export function FirebaseProvider({ 
  children, 
  app, 
  firestore, 
  auth,
  storage
}: { 
  children: ReactNode; 
  app: FirebaseApp; 
  firestore: Firestore; 
  auth: Auth;
  storage: FirebaseStorage;
}) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load mock user from localStorage on mount
    const savedUser = localStorage.getItem('mock_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('mock_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (username: string, password: string): boolean => {
    let mockUser: MockUser | null = null;

    if (username === 'adminHT' && password === 'adminHT123') {
      mockUser = {
        uid: 'mock-admin-id',
        displayName: 'HardTech Admin',
        email: 'admin@hardtech.academy',
        role: 'admin'
      };
    } else if (username === 'juantech' && password === 'juantech123') {
      mockUser = {
        uid: 'mock-student-id',
        displayName: 'Juan Tech',
        email: 'juan@tech.com',
        role: 'student'
      };
    }

    if (mockUser) {
      setUser(mockUser);
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mock_user');
  };

  return (
    <FirebaseContext.Provider value={{ app, firestore, auth, storage, user, loading, login, logout }}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (!context) throw new Error('useFirebase must be used within a FirebaseProvider');
  return context;
}

export function useFirebaseApp() {
  return useFirebase().app;
}

export function useFirestore() {
  const { firestore } = useFirebase();
  return { firestore, db: firestore };
}

export function useStorage() {
  return useFirebase().storage;
}

export function useAuth() {
  const { user, login, logout } = useFirebase();
  return { user, login, logout };
}
