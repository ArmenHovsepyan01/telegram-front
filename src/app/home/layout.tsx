import HomeLayout from '@/layouts/HomeLayout/HomeLayout';
import AuthProvider from '@/providers/AuthProvider/AuthProvider';
import { SocketProvider } from '@/providers/SocketProvider/SocketProvider';

export default function Layout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <SocketProvider>
        <HomeLayout>{children}</HomeLayout>
      </SocketProvider>
    </AuthProvider>
  );
}
