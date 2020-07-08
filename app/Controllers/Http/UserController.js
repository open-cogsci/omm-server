'use strict'

const capitalize = require('lodash/capitalize')
const User = use('App/Models/User')
const UserType = use('App/Models/UserType')
const Hash = use('Hash')

const isEmpty = require('validator').isEmpty

class UserController {
  /**
  * @swagger
  * /users:
  *   get:
  *     tags:
  *       - USers
  *     security:
  *       - JWT: []
  *     summary: >
  *         Retrieves a list of all users currently present in the database.
  *     parameters:
  *       - in: query
  *         name: active
  *         required: false
  *         type: boolean
  *         description: Whether to retrieve active or archived studies.
  *     responses:
  *       200:
  *         description: An array of users
  *         schema:
  *           properties:
  *             data:
  *               type: array
  *               items:
  *                 $ref: '#/definitions/USer'
  *       default:
  *         description: Unexpected error
  */

  /**
   * Show a list of all users.
   * GET users
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async index ({ transform }) {
    const users = await User
      .query()
      .withCount('studies')
      .with('userType')
      .orderBy('name', 'asc')
      .fetch()
    return transform.collection(users, 'UserTransformer.withStudiesCount')
  }

  /**
   * Create a new user
   * POST store
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response }) {
    const userData = request.only(['name', 'email', 'password', 'user_type_id', 'active'])

    try {
      // save user to database
      const user = await User.create(userData)
      await user.reload()

      return response.json({
        status: 'success',
        data: user
      })
    } catch (error) {
      return response.status(400).json({
        message: 'There was a problem creating the user, please try again later.'
      })
    }
  }

  /**
   * Update user details.
   * PUT or PATCH users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response, auth, transform }) {
    const user = await User.findOrFail(params.id)
    const data = request.only(['name', 'email', 'active', 'user_type_id', 'password'])
    if (isEmpty(data.password)) {
      delete data.password
    }

    if (auth.current.user.id === params.id) {
      if (!data.active) {
        return response.status(400).json({
          message: 'You cannot deactivate yourself'
        })
      }
      if (data.user_type_id !== user.user_type_id) {
        return response.status(400).json({
          message: 'You cannot change your own user type'
        })
      }
    }

    user.merge(data)
    try {
      await user.save()
    } catch (e) {
      return response.status(400).json({
        message: 'There was a problem updating the user, please try again later.'
      })
    }
    return transform.item(user, 'UserTransformer')
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
      const token = await auth
        // .withRefreshToken()
        .attempt(
          request.input('email'),
          request.input('password')
        )

      return response.json({
        status: 'success',
        data: token
      })
    } catch (error) {
      response.status(400).json({
        message: 'Invalid email/password'
      })
    }
  }

  /**
   * Logout the current user
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Auth} ctx.auth
   * @param {Response} ctx.response
   */
  async logout ({ auth, response }) {
    try {
      const user = await auth.getUser()
      const token = auth.getAuthHeader()
      await user
        .tokens()
        .where('token', token)
        .update({ is_revoked: true })
      response.json({
        message: 'User logged out.'
      })
    } catch (error) {
      response.status(400).json({
        message: 'Unable to logout user'
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
        message: 'Current password is incorrect.',
        errors: { password: 'Incorrect password' }
      })
    }

    // hash and save new password
    user.password = request.input('newPassword')
    await user.save()

    return response.json({
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
        message: 'User not found'
      })
    }
  }

  async destroy ({ params, response, auth }) {
    if (auth.current.user.id === params.id) {
      return response.status(400).json({ message: 'You cannot delete yourself' })
    }
    const user = await User.findOrFail(params.id)
    try {
      await user.delete()
    } catch (e) {
      response.status(400).json({
        message: 'The user could not be removed'
      })
    }
    return response.noContent()
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
      .select('id', 'name', 'email', 'created_at', 'updated_at')
      .where('id', auth.current.user.id)
      .firstOrFail()

    return response.json({
      data: { user }
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
      user.email = request.input('email')

      await user.save()

      return response.json({
        message: 'Profile updated!',
        data: user
      })
    } catch (error) {
      return response.status(400).json({
        message: 'There was a problem updating profile, please try again later.'
      })
    }
  }

  /**
   * Get a list of possible user types
   * PUT or PATCH update_me
   *
   * @param {object} ctx
   * @param {Response} ctx.response
   */
  async userTypes ({ response }) {
    try {
      const idsAndNames = await UserType.pair('id', 'name')
      const data = Object.entries(idsAndNames).map(([id, name]) => ({
        value: parseInt(id),
        text: capitalize(name)
      }))
      return { data }
    } catch (e) {
      return response.status(400).json({ message: 'Could not fetch user types' })
    }
  }
}

module.exports = UserController
