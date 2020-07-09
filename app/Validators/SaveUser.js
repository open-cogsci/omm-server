'use strict'

class SaveUser {
  get rules () {
    const id = this.ctx.params.id || this.ctx.auth.current.user.id
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
