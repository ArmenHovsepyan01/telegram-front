import LoginForm from '@/components/LoginForm/LoginForm';
import Link from 'next/link';
import FormWrapper from '@/components/FormWrapper/FormWrapper';

const Login = () => {
  return (
    <FormWrapper title="Sign in to your account">
      <LoginForm />
      <p className="mt-5 text-center text-sm/6 text-gray-500">
        Don&#39;t have an account?
        <Link href="/register" className="ml-1 font-semibold text-indigo-600 hover:text-indigo-500">
          Create an account
        </Link>
      </p>
    </FormWrapper>
  );
};

export default Login;
