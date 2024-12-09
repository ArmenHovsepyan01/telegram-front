'use client';

import { memo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormikProvider, useFormik } from 'formik';
import Input from '@/components/ui/Input/Input';
import Button from '@/components/ui/Button/Button';
import { getInputError } from '@/utilis/helpers/getInputError';
import { handleErrors } from '@/utilis/helpers/handleErrors';
import { registrationForm } from '@/utilis/forms/registration';
import UserService from '@/services/user';

const RegisterForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { initialValues, validationSchema, fields } = registrationForm;
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, formikHelpers) => {
      try {
        const userService = new UserService();
        setIsLoading(true);
        await userService.create(values);
        return router.push('/registaration-success?from=register');
      } catch (error) {
        handleErrors(error, formikHelpers.setFieldError);
      } finally {
        setIsLoading(false);
      }
    }
  });

  return (
    <FormikProvider value={formik}>
      <form className="space-y-3" autoComplete="off" onSubmit={formik.handleSubmit}>
        {fields.map(({ name, placeholder, type, required, label }) => {
          const error = getInputError(name, formik.errors, formik.touched);

          return (
            <Input
              key={name}
              name={name}
              type={type}
              required={required}
              placeholder={placeholder}
              label={label}
              //@ts-ignore
              value={formik.values[name]}
              onChange={formik.handleChange}
              error={error}
              disabled={isLoading}
            />
          );
        })}
        <Button
          text="Sign in"
          type="submit"
          onClick={formik.handleSubmit}
          disabled={isLoading}
          loading={isLoading}
        />
      </form>
    </FormikProvider>
  );
};

export default memo(RegisterForm);
