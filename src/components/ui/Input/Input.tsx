import React, { ChangeEvent, FC, memo } from 'react';
import classNames from 'classnames';

interface InputProps {
  name: string;
  type: React.InputHTMLAttributes<HTMLInputElement>['type'];
  label?: string;
  placeholder?: string;
  className?: string;
  required: boolean;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled: boolean;
}

const Input: FC<InputProps> = ({
  name,
  type,
  label,
  placeholder,
  className = '',
  required = false,
  value,
  onChange,
  error,
  disabled = false
}) => {
  return (
    <div className={className}>
      {!!label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-900">
          {label}
        </label>
      )}
      <div className="mt-2">
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete="lkajsdlaskdlnasdnsalkdnslkzn"
          className={classNames(
            'block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6',
            disabled && 'bg-gray-100 cursor-not-allowed'
          )}
        />
      </div>
      {error && <span className="text-red-600 text-[13px] mt-1">{error}</span>}
    </div>
  );
};

export default memo(Input);
