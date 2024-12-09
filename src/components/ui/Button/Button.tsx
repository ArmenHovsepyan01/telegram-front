import React, { FC } from 'react';
import cn from 'classnames';
import LoadingSVG from '../../../assets/icons/loading.svg';

interface ButtonProps {
  className?: string;
  text?: string;
  type: React.ButtonHTMLAttributes<HTMLButtonElement>['type'];
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}
const Button: FC<ButtonProps> = ({
  className = '',
  text = '',
  type,
  onClick,
  disabled = false,
  loading = false
}) => {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      type={type}
      className={cn(
        'flex w-full justify-center rounded-md px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
        className,
        disabled || loading ? 'bg-indigo-300' : 'bg-indigo-600',
        !disabled && !loading && 'hover:bg-indigo-500',
        disabled && 'cursor-not-allowed'
      )}>
      {loading ? (
        <>
          <LoadingSVG className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
          <span className="relative inline-block">
            Loading
            <span className="dot-animation absolute left-full ml-1 animate-dot-blink animation-delay-400">
              ...
            </span>
          </span>
        </>
      ) : (
        text
      )}
    </button>
  );
};

export default Button;
