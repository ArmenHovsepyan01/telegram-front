import React from 'react';
import Link from 'next/link';
import FormWrapper from '@/components/FormWrapper/FormWrapper';
import RegisterForm from '@/components/RegisterForm/RegisterForm';

const Register = () => {
  return (
    <FormWrapper title="Create an account">
      <RegisterForm />
      <p className="mt-5 text-center text-sm/6 text-gray-500">
        Already have an account?
        <Link href="/login" className="ml-1 font-semibold text-blue-600 hover:text-blue-500">
          Sign in
        </Link>
      </p>
    </FormWrapper>
  );
};

export default Register;
