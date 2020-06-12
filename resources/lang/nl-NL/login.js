export default {
  signin: 'Log alstublieft in',
  fields: {
    email: {
      label: 'E-mail address',
      validation: {
        empty: 'Please provide your email address.',
        invalid: 'This e-mail address is invalid.'
      }
    },
    password: {
      label: 'Password',
      validation: {
        empty: 'Please provide a password.'
      }
    }
  },
  buttons: {
    recover: 'Recover password',
    signin: 'Sign in'
  }
}
