import HomeLayout from '@/layouts/HomeLayout/HomeLayout';
import { Suspense } from 'react';
import AuthProvider from '@/providers/AuthProvider/AuthProvider';

export default function Layout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <Suspense fallback={<div>Loading....</div>}>
        <HomeLayout>{children}</HomeLayout>
      </Suspense>
    </AuthProvider>
  );
}
