import { setFormikFieldError } from '@/utilis/helpers/setFormikFieldError';
import { toast } from 'react-toastify';

export const handleErrors = (
  error,
  setFieldError?: (field: string, message: string | undefined) => void
) => {
  if (setFieldError) {
    if (error?.errors) {
      return setFormikFieldError(setFieldError, error.errors);
    }
  }

  toast.error(error.message);
  console.log('Caught an error', error);
};
