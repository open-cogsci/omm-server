export default {
  subheader: 'Send a password reset link to the provided e-mail address.',
  fields: {
    email: {
      label: 'Email address',
      validation: {
        empty: 'Please provide your email address.',
        invalid: 'This e-mail address is invalid.'
      }
    }
  },
  buttons: {
    signin: 'Sign in',
    email: 'Send email'
  },
  messages: {
    received: 'Check your email for a reset link.'
  }
}
