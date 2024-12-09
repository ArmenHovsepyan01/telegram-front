export const setFormikFieldError = (setFieldError, errors) => {
  if (errors && errors?.length) {
    errors.forEach(({ path, message }) => {
      setFieldError(path, message);
    });
  }
};
