import { FormikErrors, FormikTouched } from 'formik';

export const getInputError = <T>(
  name: string,
  errors: FormikErrors<T>,
  touched: FormikTouched<T>
): string => {
  if (touched[name as keyof T] && errors[name as keyof T]) {
    return errors[name as keyof T] as string;
  }

  return '';
};
