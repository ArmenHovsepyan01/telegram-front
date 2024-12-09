import * as Yup from 'yup';

const initialValues = {
  name: '',
  lastName: '',
  email: '',
  password: '',
  nickName: ''
};

const fields = [
  {
    name: 'name',
    required: true,
    type: 'text',
    label: 'First Name',
    placeholder: 'John'
  },
  {
    name: 'lastName',
    required: true,
    type: 'text',
    label: 'Last Name',
    placeholder: 'Doe'
  },
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
  },
  {
    name: 'nickName',
    required: false,
    type: 'text',
    label: 'Nickname',
    placeholder: 'Johnny'
  }
];

const validationSchema = Yup.object().shape({
  name: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters long')
    .required('Password is required'),
  nickName: Yup.string().max(20, 'Nickname must not exceed 20 characters').nullable()
});

export const registrationForm = {
  fields,
  initialValues,
  validationSchema
};
