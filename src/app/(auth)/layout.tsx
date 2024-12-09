import SignInLayout from '@/layouts/SingInLayout/SignInLayout';

export default function Layout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <SignInLayout>{children}</SignInLayout>;
}
