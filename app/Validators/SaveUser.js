'use strict'

class SaveUser {
  get rules () {
    let id = this.ctx.params.id

    // Don't check for uniqueness of email address if a user updates
    // his or her own profile
    if (!id && this.ctx.request.url().includes('/auth/user')) {
      id = this.ctx.auth.current.user.id
    }

    return {
      name: 'required|max:50',
      email: `required|email|unique:users,email,id,${id}`,
      user_type_id: 'exists:user_types,id'
    }
  }

  get messages () {
    return {
      'email.unique': 'This email address is already taken'
    }
  }

  authorize () {
    // Allow a user to change his own data
    if (this.ctx.request.url().includes('/auth/user')) {
      return true
    }
    // Only allow admins to add or change user data
    if (!this.ctx.auth.current.user.isAdmin) {
      this.ctx.response.unauthorized('Not authorized')
      return false
    }
    return true
  }
}

module.exports = SaveUser
