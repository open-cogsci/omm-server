'use strict'

const User = use('App/Models/User')
const UserType = use('App/Models/UserType')
const Persona = use('Persona')

const isEmpty = require('validator').isEmpty

class UserController {
  /**
  * @swagger
  * /users:
  *   get:
  *     tags:
  *       - Users
  *     security:
  *       - JWT: []
  *     summary: >
  *         Retrieves a list of all users currently present in the database.
  *     responses:
  *       200:
  *         description: An array of users.
  *         schema:
  *           properties:
  *             data:
  *               type: array
  *               items:
  *                 $ref: '#/definitions/User'
  *       401:
  *         description: Unauthorized.
  *       default:
  *         description: Unexpected error.
  */

  /**
   * Show a list of all users.
   * GET users
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {Auth} ctx.auth
   */
  async index ({ response, transform, auth }) {
    if (!auth.current.user.isAdmin) {
      return response.status(401).json({ message: 'Permission denied' })
    }

    const users = await User
      .query()
      .withCount('studies')
      .with('userType')
      .orderBy('name', 'asc')
      .fetch()
    return transform.collection(users, 'UserTransformer.withStudiesCount')
  }

  /**
  * @swagger
  * /users:
  *   post:
  *     tags:
  *       - Users
  *     security:
  *       - JWT: []
  *     summary: >
  *         Stores a new user in the database.
  *     consumes:
  *       - application/json
  *     parameters:
  *       - in: body
  *         name: user
  *         description: The user to create.
  *         schema:
  *           $ref: '#/definitions/User'
  *     responses:
  *       201:
  *         description: OK
  *         schema:
  *           properties:
  *             data:
  *               $ref: '#/definitions/User'
  *       400:
  *         description: The request was invalid (e.g. the passed data did not validate).
  *         schema:
  *           type: array
  *           items:
  *             $ref: '#/definitions/ValidationError'
  *       401:
  *         description: Unauthorized.
  *       default:
  *         description: Unexpected error.
  */

  /**
   * Create a new user
   * POST store
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, transform }) {
    const userData = request.only(['name', 'email', 'password', 'user_type_id'])
    // Spoof the password confirmation for Persona
    userData.password_confirmation = userData.password
    // save user to database
    const user = await Persona.register(userData)

    return transform.item(user, 'UserTransformer')
  }

  /**
  * @swagger
  * /users/{id}:
  *   put:
  *     tags:
  *       - Users
  *     security:
  *       - JWT: []
  *     summary: >
  *         Updates a single user.
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         type: string
  *         description: The ID of the user to update.
  *       - in: body
  *         name: user
  *         description: The updated user data.
  *         schema:
  *           $ref: '#/definitions/User'
  *     responses:
  *       200:
  *         description: The updated user.
  *         schema:
  *           properties:
  *             data:
  *               $ref: '#/definitions/User'
  *       401:
  *         description: Unauthorized.
  *       400:
  *         description: The request was invalid (e.g. the passed data did not validate).
  *         schema:
  *           type: array
  *           items:
  *             $ref: '#/definitions/ValidationError'
  *       404:
  *         description: The user with the specified id was not found.
  *       default:
  *         description: Unexpected error.
  *   patch:
  *     tags:
  *       - Users
  *     security:
  *       - JWT: []
  *     summary: >
  *         Updates a single user
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         type: string
  *         description: The ID of the user to update.
  *       - in: body
  *         name: user
  *         description: The updated user data.
  *         schema:
  *           $ref: '#/definitions/User'
  *     responses:
  *       200:
  *         description: The updated user with its related data.
  *         schema:
  *           properties:
  *             data:
  *               $ref: '#/definitions/User'
  *       400:
  *         description: The request was invalid (e.g. the passed data did not validate).
  *         schema:
  *           type: array
  *           items:
  *             $ref: '#/definitions/ValidationError'
  *       401:
  *         description: Unauthorized.
  *       404:
  *         description: The user with the specified id was not found.
  *       default:
  *         description: Unexpected error.
  */

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
    const data = request.only(['name', 'email', 'account_status', 'user_type_id', 'password'])
    if (isEmpty(data.password)) {
      delete data.password
    }

    if (auth.current.user.id === params.id) {
      if (!data.account_status === 'inactive') {
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
  * @swagger
  * /users/{id}:
  *   get:
  *     tags:
  *       - Users
  *     security:
  *       - JWT: []
  *     summary: >
  *         Retrieves a single user along with all its relations.
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         type: string
  *         description: The ID of the user to retrieve
  *     responses:
  *       200:
  *         description: The user with its related data.
  *         schema:
  *           properties:
  *             data:
  *               $ref: '#/definitions/UserWithRelations'
  *       400:
  *         description: The specified id is invalid (e.g. not the expected dtype).
  *       401:
  *         description: Unauthorized.
  *       404:
  *         description: The user with the specified id was not found.
  *       default:
  *         description: Unexpected error
  */

  /**
   * Get a user's info
   * GET users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async show ({ params, response, auth, transform }) {
    if (!auth.current.user.isAdmin) {
      return response.status(401).json({ message: 'Permission denied' })
    }

    const user = await User.query()
      .where('id', params.id)
      .with('studies', (builder) => {
        builder
          .wherePivot('is_owner', true)
          .withCount('participants')
          // Somehowe, the pivot fields below are also included after the withCount() call
          // Remove them here to tidy up the response.
          .setHidden(['access_permission_id', 'is_owner', 'study_id', 'user_id'])
      })
      .firstOrFail()
    return transform.include('studies.participants_count').item(user, 'UserTransformer')
  }

  /**
   * @swagger
   * /users/{id}:
   *   delete:
   *     tags:
   *       - Users
   *     security:
   *       - JWT: []
   *     summary: >
   *         Deletes a single user.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         type: string
   *         description: The ID of the user to delete.
   *     responses:
   *       204:
   *         description: The user has been deleted.
   *       400:
   *         description: The specified id is invalid (e.g. not the expected dtype).
   *       401:
   *         description: Unauthorized.
   *       404:
   *         description: The user with the specified id was not found.
   *       default:
   *         description: Unexpected error.
   */

  /**
   * Delete a user with id.
   * DELETE users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, response, auth }) {
    if (auth.user.id === params.id) {
      return response.status(400).json({ message: 'You cannot delete yourself' })
    }
    const user = await User.findOrFail(params.id)
    await user.delete()
    return response.noContent()
  }

  /**
  * @swagger
  * /users/me:
  *   get:
  *     tags:
  *       - Users
  *     security:
  *       - JWT: []
  *     summary: >
  *         Retrieves the information of the currently logged in user.
  *     responses:
  *       401:
  *         description: Unauthorized.
  *       default:
  *         description: Unexpected error.
  */

  /**
   * Get the currently logged in user.
   * GET me
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async me ({ auth, transform }) {
    const user = await User.findOrFail(auth.current.user.id)
    return transform.item(user, 'UserTransformer')
  }

  /**
  * @swagger
  * /users/me:
  *   put:
  *     tags:
  *       - Users
  *     security:
  *       - JWT: []
  *     summary: >
  *         Updates the currently logged in user.
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         type: string
  *         description: The ID of the user to update.
  *       - in: body
  *         name: user
  *         description: The updated user data.
  *         schema:
  *           $ref: '#/definitions/User'
  *     responses:
  *       200:
  *         description: The updated user with its related data.
  *         schema:
  *           properties:
  *             data:
  *               $ref: '#/definitions/User'
  *       400:
  *         description: The request was invalid (e.g. the passed data did not validate).
  *         schema:
  *           type: array
  *           items:
  *             $ref: '#/definitions/ValidationError'
  *       401:
  *         description: Unauthorized.
  *       404:
  *         description: The user with the specified id was not found.
  *       default:
  *         description: Unexpected error.
  */

  /**
   * Update current user.
   * PUT or PATCH update_me
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Auth} ctx.auth
   * @param {Response} ctx.response
   */
  async updateMe ({ request, auth, response, transform }) {
    const user = auth.user
    const payload = request.only(['name', 'email'])
    await Persona.updateProfile(user, payload)
    return transform.item(user, 'UserTransformer')
  }

  /**
  * @swagger
  * /auth/login:
  *   post:
  *     tags:
  *       - Authentication
  *     summary: >
  *         Attempts to login a user with the specified credentials.
  *     parameters:
  *       - in: body
  *         name: user
  *         description: The user's credentials to perform a login attempt with.
  *         schema:
  *           type: object
  *           properties:
  *             email:
  *               type: string
  *               description: The user's email address
  *               example: john@doe.com
  *             password:
  *               type: string
  *               description: The user's password
  *     responses:
  *       200:
  *         description: The user's data.
  *         schema:
  *           properties:
  *             data:
  *               $ref: '#/definitions/User'
  *       400:
  *         description: The login attempt failed with the supplied credentials.
  *         schema:
  *           type: array
  *           items:
  *             $ref: '#/definitions/ValidationError'
  *       default:
  *         description: Unexpected error.
  */

  /**
   * Attempt a user login with provided credentials
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Auth} ctx.auth
   * @param {Response} ctx.response
   */
  async login ({ request, auth, response }) {
    const payload = request.only(['uid', 'password'])

    const user = await Persona.verify(payload)
    if (user.account_status === 'inactive') {
      response.unauthorized({
        message: 'Your account has been suspended. Please contact your administrator'
      })
    }

    // validate the user credentials and generate a JWT token
    const token = await auth
      .withRefreshToken()
      .generate(user)

    return response.json({
      data: token
    })
  }

  /**
  * @swagger
  * /auth/logout:
  *   post:
  *     tags:
  *       - Authentication
  *     security:
  *       - JWT: []
  *     summary: Logs out the current user, discarding his JWT refresh tokens.
  *     responses:
  *       204:
  *         description: The user has been logged out.
  *       default:
  *         description: Unexpected error.
  */

  /**
   * Log out the current user
   *
   * @param {object} ctx
   * @param {Auth} ctx.auth
   * @param {Response} ctx.response
   */
  async logout ({ auth, response }) {
    const user = await auth.getUser()
    await user.tokens()
      .where('type', 'jwt_refresh_token')
      .where('is_revoked', false)
      .update({ is_revoked: true })
    return response.noContent()
  }

  /**
  * @swagger
  * /auth/password:
  *   put:
  *     tags:
  *       - Authentication
  *     security:
  *       - JWT: []
  *     summary: >
  *         Changes the password of the currently logged in user.
  *     parameters:
  *       - in: body
  *         name: password info
  *         description: The old and new password information
  *         schema:
  *           type: object
  *           properties:
  *             old_password:
  *               description: The user's previous password.
  *               type: string
  *             password:
  *               description: The user's new password.
  *               type: string
  *             password_confirmation:
  *               description: The user's new password repeated.
  *               type: string
  *     responses:
  *       204:
  *         description: The user's password has been updated
  *       400:
  *         description: The login attempt failed with the supplied credentials.
  *         schema:
  *           type: array
  *           items:
  *             $ref: '#/definitions/ValidationError'
  *       default:
  *         description: Unexpected error.
  */
  async changePassword ({ request, auth, response }) {
    const payload = request.only(['old_password', 'password', 'password_confirmation'])
    await Persona.updatePassword(auth.user, payload)
    return response.json({ message: 'Password updated!' })
  }

  /**
  * @swagger
  * /auth/password/recover:
  *   post:
  *     tags:
  *       - Authentication
  *     summary: >
  *         Sends a password reset link by email to the specified user
  *     parameters:
  *       - in: body
  *         name: password info
  *         description: The user email to which to send the reset link.
  *         schema:
  *           type: object
  *           properties:
  *             uid:
  *               description: The user's email.
  *               type: string
  *               example: john@doe.com
  *     responses:
  *       204:
  *         description: The rest link has been sent.
  *       400:
  *         description: The request was invalid (e.g. the passed data did not validate).
  *         schema:
  *           type: array
  *           items:
  *             $ref: '#/definitions/ValidationError'
  *       default:
  *         description: Unexpected error.
  */

  /**
   * Send password reset link by email
   * POST forgotPassword
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async forgotPassword ({ request, response }) {
    await Persona.forgotPassword(request.input('uid'))
    return response.noContent()
  }

  /**
  * @swagger
  * /auth/password/reset/{token}:
  *   post:
  *     tags:
  *       - Authentication
  *     summary: >
  *         Resets the password of the user linked to by the token.
  *     parameters:
  *       - in: path
  *         name: token
  *         description: >
  *           The verification token to reset the password. This was received by email
  *           by the user.
  *       - in: body
  *         name: password info
  *         description: The new password and its confirmation.
  *         schema:
  *           type: object
  *           properties:
  *             password:
  *               description: The user's new password.
  *               type: string
  *             password_confirmation:
  *               description: The user's new password repeated.
  *               type: string
  *     responses:
  *       204:
  *         description: Password has been reset
  *       400:
  *         description: The request was invalid (e.g. the passed data did not validate).
  *         schema:
  *           type: array
  *           items:
  *             $ref: '#/definitions/ValidationError'
  *       default:
  *         description: Unexpected error.
  */

  /**
   * Resets the password of a user provided a valid token is passed.
   * POST updatePasswordByToken
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Params} ctx.params
   * @param {Response} ctx.response
   */
  async updatePasswordByToken ({ request, params, response }) {
    const token = decodeURIComponent(params.token)
    const payload = request.only(['password', 'password_confirmation'])
    await Persona.updatePasswordByToken(token, payload)
    return response.noContent()
  }

  /**
   * Resends the e-mail with the users account info
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @returns
   * @memberof UserController
   */
  async resendAccountEmail ({ request, response }) {
    const id = request.input('id')
    const user = await User.findOrFail(id)
    if (user.account_status !== 'pending') {
      return response.badRequest({ message: 'User has already been activated' })
    }
    console.log('emailing')
    return response.noContent()
  }

  /**
  * @swagger
  * /users/types:
  *   get:
  *     tags:
  *       - Users
  *     security:
  *       - JWT: []
  *     summary: >
  *         Enumerates possible user types
  *     responses:
  *       200:
  *         description: A list of ids and names of available user types.
  *         schema:
  *           properties:
  *             data:
  *               type: array
  *               items:
  *                 type: object
  *                 properties:
  *                   value:
  *                     description: The id of the user type
  *                     example: 2
  *                     type: integer
  *                   text:
  *                     description: The label/name of the user type
  *                     example: standard
  *                     type: string
  *       401:
  *         description: Unauthorized.
  *       default:
  *         description: Unexpected error.
  */

  /**
   * Get a list of possible user types
   * PUT or PATCH update_me
   *
   * @param {object} ctx
   * @param {Response} ctx.response
   */
  async userTypes ({ response }) {
    try {
      const data = await UserType.all()
      return { data }
    } catch (e) {
      return response.status(400).json({ message: 'Could not fetch user types' })
    }
  }
}

module.exports = UserController
