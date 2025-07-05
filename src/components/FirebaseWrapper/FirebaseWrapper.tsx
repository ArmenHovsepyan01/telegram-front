'use client';

import { ReactNode } from 'react';

import { useFirebaseNotifications } from '@/utilis/hooks/useFirebaseNotifications';

export function FirebaseWrapper({ children }: { children: ReactNode }) {
  useFirebaseNotifications();
  return <>{children}</>;
}
