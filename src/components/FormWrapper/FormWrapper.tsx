import { FC, ReactNode } from 'react';

interface FormProps {
  children: ReactNode;
  title: string;
}

const FormWrapper: FC<FormProps> = ({ children, title }) => {
  return (
    <div className="shadow-lg p-6 max-w-[440px] w-full rounded-2xl bg-white px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          alt="Your Company"
          src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600"
          className="mx-auto h-10 w-auto"
        />
        <h2 className="mt-2 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
          {title}
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">{children}</div>
    </div>
  );
};

export default FormWrapper;
