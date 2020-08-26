export default {
  search: 'Search users by name or email address',
  no_studies: 'No studies to list',
  types: {
    standard: 'standard',
    administrator: 'administrator'
  },
  status: {
    pending: 'pending',
    active: 'active',
    inactive: 'inactive'
  },
  messages: {
    saved: 'User has been saved',
    deleted: 'User has been deleted',
    activation_resent: 'Activation e-mail has been resent',
    account_info_resent: 'Account info e-mail has been resent'
  },
  labels: {
    name: 'Name',
    email: 'Email',
    user_type: 'User type',
    account_status: 'Status',
    last_login: 'Last login',
    created_at: 'Created at',
    updated_at: 'Updated at'
  },
  fields: {
    name: {
      label: 'Name',
      errors: {
        notEmpty: 'Name cannot be empty',
        maxLength: 'This field has a maximum length of'
      }
    },
    email: {
      label: 'Email address',
      errors: {
        notEmpty: 'Email cannot be empty',
        invalid: 'Invalid email address'
      }
    },
    user_type: {
      label: 'Usertype'
    }
  },
  buttons: {
    resend_activation_email: 'Resend activation email',
    resend_verification_email: 'Resend verification email'
  },
  dialogs: {
    new: {
      title: 'Add a new user',
      subtitle: 'Please enter the information below'
    }
  },
  prevent_delete: `A user can no longer be deleted when it is associated with a study.<br>
                   Deactivate the user instead.`
}
