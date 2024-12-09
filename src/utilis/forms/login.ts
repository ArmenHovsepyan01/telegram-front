import * as Yup from 'yup';

const initialValues = {
  email: '',
  password: ''
};

const fields = [
  {
    name: 'email',
    required: true,
    type: 'email',
    label: 'Email Address',
    placeholder: 'example@gmail.com'
  },
  {
    name: 'password',
    required: true,
    type: 'password',
    label: 'Password',
    placeholder: 'example123'
  }
];

const validationSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters long')
    .required('Password is required')
});

export const loginForm = {
  fields,
  initialValues,
  validationSchema
};
