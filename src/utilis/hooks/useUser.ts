import { useContext } from 'react';
import { AuthContext } from '@/providers/AuthProvider/AuthProvider';

export const useUser = () => {
  const { user } = useContext(AuthContext);
  if (!user) {
    return null;
  }

  return user;
};
