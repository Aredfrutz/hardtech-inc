
'use client';

import { useFirebase } from '../provider';

export function useUser() {
  const { user, loading } = useFirebase();
  return { user, loading };
}
