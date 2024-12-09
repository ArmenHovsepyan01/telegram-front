import React from 'react';
import RegisterForm from '@/components/RegisterForm/RegisterForm';
import Link from 'next/link';
import FormWrapper from '@/components/FormWrapper/FormWrapper';

const Page = () => {
  return (
    <FormWrapper title="Congratulations! You have successfully created an account.">
      <div className="text-center">
        We have sent a verification email. Please check your email to verify your account
      </div>
      <div className="flex items-center justify-center mt-2">
        <Link
          target="_blank"
          href="https://mail.google.com/"
          className="bg-blue-400 text-white px-4 py-2 rounded-md">
          Gmail
        </Link>
      </div>
    </FormWrapper>
  );
};

export default Page;
