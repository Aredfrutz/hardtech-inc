
'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import { FirebaseProvider } from './provider';
import { initializeFirebase } from './index';

export function FirebaseClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  // Hold the initialized Firebase services in state
  const [services, setServices] = useState<ReturnType<typeof initializeFirebase> | null>(null);

  useEffect(() => {
    // Initialize Firebase only once on the client
    setServices(initializeFirebase());
  }, []);

  // Show a simple loading state while Firebase is initializing
  if (!services) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <FirebaseProvider app={services.app} firestore={services.firestore} auth={services.auth}>
      {children}
    </FirebaseProvider>
  );
}
