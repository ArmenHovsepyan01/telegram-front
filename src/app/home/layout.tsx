import HomeLayout from '@/layouts/HomeLayout/HomeLayout';
import AuthProvider from '@/providers/AuthProvider/AuthProvider';
import { SocketProvider } from '@/providers/SocketProvider/SocketProvider';
import { FirebaseWrapper } from '@/components/FirebaseWrapper/FirebaseWrapper';

export default function Layout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <SocketProvider>
        <FirebaseWrapper>
          <HomeLayout>{children}</HomeLayout>
        </FirebaseWrapper>
      </SocketProvider>
    </AuthProvider>
  );
}
