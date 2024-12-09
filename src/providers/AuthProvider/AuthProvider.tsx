'use client';

import { createContext, FC, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { deleteCookie } from 'cookies-next';
import { User } from '@/types';
import { getUserProfile } from '@/app/actions';
import useSWR from 'swr';

interface IAuthProvider {
  children: ReactNode;
}

interface IAuthContext {
  logout: () => void;
  user?: User;
}

const logout = () => {
  deleteCookie('accessToken');
};

export const AuthContext = createContext<IAuthContext>({ logout });

const AuthProvider: FC<IAuthProvider> = ({ children }) => {
  const { data, isLoading } = useSWR('random', () => getUserProfile());
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ logout: handleLogout, user: data }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
