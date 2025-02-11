'use client';

import { createContext, FC, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { deleteCookie } from 'cookies-next';
import { User } from '@/types';
import { getUserProfile } from '@/app/actions';
import useSWR from 'swr';
import CoverLoading from '@/components/CoverLoading/CoverLoading';

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
  const { data, isLoading, mutate } = useSWR('random', () => getUserProfile());
  const router = useRouter();

  const handleLogout = async () => {
    logout();
    await mutate(() => undefined, { revalidate: false });
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ logout: handleLogout, user: data }}>
      <CoverLoading isLoading={isLoading}>{children}</CoverLoading>
    </AuthContext.Provider>
  );
};

export default AuthProvider;
