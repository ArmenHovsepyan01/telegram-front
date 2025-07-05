import { FC, ReactNode } from 'react';
import TelegramIcon from '../../assets/icons/telegram_icon.png';

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
          src={TelegramIcon.src}
          className="mx-auto h-10 w-auto rounded-full"
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
