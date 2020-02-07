'use strict'
const User = use('App/Models/User')
const Hash = use('Hash')

class UserController {
  /**
   * Create a new user
   * POST store
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response }) {
    // get user data from signup form
    const userData = request.only(['name', 'username', 'email', 'password'])

    try {
      // save user to database
      const user = await User.create(userData)

      return response.json({
        status: 'success',
        data: user
      })
    } catch (error) {
      return response.status(400).json({
        status: 'error',
        message: 'There was a problem creating the user, please try again later.'
      })
    }
  }

  /**
   * Attempt a user login with provided credentials
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Auth} ctx.auth
   * @param {Response} ctx.response
   */
  async login ({ request, auth, response }) {
    try {
      // validate the user credentials and generate a JWT token
      const token = await auth.attempt(
        request.input('email'),
        request.input('password')
      )

      return response.json({
        status: 'success',
        data: token
      })
    } catch (error) {
      response.status(400).json({
        status: 'error',
        message: 'Invalid email/password'
      })
    }
  }

  /**
   * Update current user's password.
   * PUT or PATCH changePassword
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Auth} ctx.auth
   * @param {Response} ctx.response
   */
  async changePassword ({ request, auth, response }) {
    // get currently authenticated user
    const user = auth.current.user

    // verify if current password matches
    const verifyPassword = await Hash.verify(
      request.input('password'),
      user.password
    )

    // display appropriate message
    if (!verifyPassword) {
      return response.status(400).json({
        status: 'error',
        message: 'Current password could not be verified! Please try again.'
      })
    }

    // hash and save new password
    user.password = request.input('newPassword')
    await user.save()

    return response.json({
      status: 'success',
      message: 'Password updated!'
    })
  }

  /**
   * Get a user's info
   * GET users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async show ({ params, response }) {
    try {
      const user = await User.query()
        .where('username', params.username)
        .firstOrFail()

      return response.json({
        status: 'success',
        data: user
      })
    } catch (error) {
      return response.status(404).json({
        status: 'error',
        message: 'User not found'
      })
    }
  }

  /**
   * Get the currently logged in user.
   * GET me
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async me ({ auth, response }) {
    const user = await User.query()
      .where('id', auth.current.user.id)
      .firstOrFail()

    return response.json({
      status: 'success',
      data: user
    })
  }

  /**
   * Update current user.
   * PUT or PATCH update_me
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Auth} ctx.auth
   * @param {Response} ctx.response
   */
  async updateMe ({ request, auth, response }) {
    try {
      // get currently authenticated user
      const user = auth.current.user

      // update with new data entered
      user.name = request.input('name')
      user.username = request.input('username')
      user.email = request.input('email')

      await user.save()

      return response.json({
        status: 'success',
        message: 'Profile updated!',
        data: user
      })
    } catch (error) {
      return response.status(400).json({
        status: 'error',
        message: 'There was a problem updating profile, please try again later.'
      })
    }
  }
}

module.exports = UserController
