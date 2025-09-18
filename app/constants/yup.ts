import * as Yup from 'yup';

export const yupString = Yup.string().required('Required.');

export const yupStringOptional = Yup.string();

export const stringMax = (max: number) =>
  Yup.string().max(max, 'Max of ${max} chars.').required('Required.');

export const number = Yup.number().positive().moreThan(0).required('Required.');

export const OTP = Yup.number()
  .positive()
  .min(0)
  .max(9999)
  .test(
    'len',
    'Must be exactly 4 chars.',
    (val: any) => val.toString().length === 4,
  )
  .required('Required.');

export const yupUsername = Yup.string()
  .min(3, 'Less characters.')
  .required('Required.');

export const yupPassword = Yup.string()
  .min(8, 'Should be a minimum of ${min} chars.')
  .matches(
    /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
    'At least 8 chars, 1 num, 1 uppercase, 1 lowercase and 1 special char.',
  )
  .required('Required.');

export const yupPasscode = Yup.string()
  .min(5, 'Should be a minimum of ${min} chars.')
  .required('Required.');

export const yupPhoneNumber = Yup.string()
  .min(10, 'Must be ${min} chars.')
  .test({
    name: 'startsWith',
    exclusive: true,
    message: 'Use format 07xxxxxxxx',
    test: value => value?.startsWith('07') || value?.startsWith('01'),
  })
  .required('Required.');

export const yupEmailAddress = Yup.string()
  .email('Invalid email')
  .max(50, 'Max of 50 chars')
  .required('Required.');
