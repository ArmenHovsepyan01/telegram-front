import { FC, ReactNode } from 'react';

interface SignInLayoutProps {
  children: ReactNode;
}

const SignInLayout: FC<SignInLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-[100vh] flex-1 flex-col justify-center items-center px-6 py-12 lg:px-8 bg-gray-100">
      {children}
    </div>
  );
};

export default SignInLayout;
