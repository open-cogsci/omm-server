export default {
  subheader: 'Hello! Please set your password below:',
  fields: {
    old_password: {
      label: 'Old password',
      validation: {
        empty: 'Please provide your current password.'
      }
    },
    password: {
      label: 'New password',
      validation: {
        empty: 'Please provide a new password.'
      }
    },
    password_confirmation: {
      label: 'Repeat the password above',
      validation: {
        empty: 'Please confirm your password',
        mismatch: 'Mismatch with password above.'
      }
    }
  },
  buttons: {
    change: 'Change password'
  }
}
