export default {
  subheader: 'Reset your password',
  fields: {
    email: {
      label: 'Email address',
      validation: {
        empty: 'Please provide your email address',
        invalid: 'This e-mail address is invalid'
      }
    }
  },
  buttons: {
    signin: 'Sign in',
    email: 'Send email'
  },
  messages: {
    received: 'Request received. Check your email for a reset link.'
  }
}
