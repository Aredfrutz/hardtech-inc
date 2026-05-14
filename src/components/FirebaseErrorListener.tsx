'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

/**
 * A central listener for Firebase-related errors, particularly
 * Firestore permission errors. Surfaces contextual information
 * for better debugging and user feedback.
 */
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      // In development, log the rich contextual error
      if (process.env.NODE_ENV === 'development') {
        console.group('🔥 Firestore Permission Denied');
        console.error('Message:', error.message);
        console.error('Path:', error.context.path);
        console.error('Operation:', error.context.operation);
        if (error.context.requestResourceData) {
          console.error('Data:', error.context.requestResourceData);
        }
        console.groupEnd();
      }

      // Surface a user-friendly toast
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: `You don't have permission to ${error.context.operation} this data.`,
      });

      // Optionally throw to trigger Next.js error boundary/overlay in dev
      if (process.env.NODE_ENV === 'development') {
        // We throw asynchronously to not break the current execution flow
        // but still trigger the dev overlay.
        setTimeout(() => {
          throw error;
        }, 0);
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null;
}
