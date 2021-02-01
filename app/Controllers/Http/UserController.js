'use strict'

const User = use('App/Models/User')
const UserType = use('App/Models/UserType')
const Persona = use('Persona')
const Event = use('Event')

const { validate } = use('Validator')

const { isEmpty } = require('validator')
const isInteger = require('lodash/isInteger')
const formatISO = require('date-fns/formatISO9075')

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
  async index ({ request, response, transform, auth }) {
    if (!auth.current.user.isAdmin) {
      return response.status(401).json({ message: 'Permission denied' })
    }
    const query = User
      .query()
      .withCount('studies')
      .with('userType')
      .orderBy('name', 'asc')

    const searchterm = request.input('q')
    if (searchterm && searchterm.length >= 2) {
      query.where(function () {
        this.where('name', 'LIKE', `%${searchterm}%`)
        this.orWhere('email', 'LIKE', `%${searchterm}%`)
      })
    }

    const page = request.input('page', 1)
    const perPage = request.input('perPage', 20)
    const users = await query.paginate(page, perPage)
    return transform.include('user_type,studies_count').paginate(users, 'UserTransformer')
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
    const data = request.only(
      ['name', 'email', 'account_status', 'user_type_id', 'password']
    )
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

  async setLocale ({ request, response, auth }) {
    const locale = request.input('locale')
    const allowedLocales = ['en', 'nl', 'fr']
    if (!allowedLocales.includes(locale)) {
      response.badRequest({ message: `Unknown locale '${locale}'. Allowed values are ${allowedLocales}` })
    }
    auth.user.locale = locale
    await auth.user.save()
    return response.noContent()
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
      .with('userType')
      .with('studies', (builder) => {
        builder
          .wherePivot('is_owner', true)
          .withCount('participants')
          .withCount('participants as finished_participants', (query) => {
            query.wherePivot('status_id', 3)
          })
      })
      .firstOrFail()
    return transform
      .include('studies.participants_count,studies.finished_participants_count,user_type')
      .item(user, 'UserTransformer')
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
    if (!auth.current.user.isAdmin) {
      return response.status(401).json({ message: 'Permission denied' })
    }
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

    let errorResponse = null
    const user = await Persona.verify(payload, (user) => {
      if (user.account_status === 'inactive') {
        errorResponse = response.unauthorized({
          message: 'Your account has been suspended. Please contact your administrator'
        })
      }
    })
    if (errorResponse !== null) { return errorResponse }
    if (user.account_status === 'pending') {
      return response.unauthorized({
        message: 'Please verify your email address first. Check your mailbox.'
      })
    }

    user.last_login = formatISO(Date.now())
    await user.save()

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
  *       401:
  *         description: Unauthorized.
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
  *       401:
  *         description: Unauthorized.
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
  *         name: uid
  *         description: The user email to which to send the reset link.
  *         schema:
  *           type: object
  *           properties:
  *             uid:
  *               description: The user's email address.
  *               type: string
  *               example: john@doe.com
  *               required: true
  *     responses:
  *       204:
  *         description: The reset link has been sent.
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
    const validation = await validate(request.all(), { uid: 'required|email' })
    if (validation.fails()) {
      return response.status(422).json(validation.messages())
    }
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
  *         required: true
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

    // E-mail verification can also be done in this step. Check if etoken is provided:
    const etoken = request.input('etoken', null)
    if (etoken !== null) {
      await Persona.verifyEmail(decodeURIComponent(etoken))
    }
    return response.noContent()
  }

  /**
  * @swagger
  * /users/resend_account_email:
  *   post:
  *     tags:
  *       - Users
  *     security:
  *       - JWT: []
  *     summary: >
  *         Resends the email to a new user in which he/she is requested to set a password. This
  *         happens automatically for the first time after a user is created.
  *     parameters:
  *       - in: body
  *         name: id
  *         description: The ID of the user
  *         schema:
  *           type: object
  *           properties:
  *             id:
  *               description: The user's ID
  *               type: integer
  *               example: 2
  *               required: true
  *     responses:
  *       204:
  *         description: The email has been resent
  *       400:
  *         description: The user's account has already been activated
  *       401:
  *         description: Unauthorized.
  *       404:
  *         description: The user with the specified ID could not be found
  *       default:
  *         description: Unexpected error.
  */

  /**
   * Resends the e-mail with the users account info so the user can set an initial password
   * for their account.
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
    const token = await Persona.generateToken(user, 'email')
    Event.fire('user::created', { user, token })
    return response.noContent()
  }

  /**
  * @swagger
  * /auth/email/resend:
  *   post:
  *     tags:
  *       - Authentication
  *     security:
  *       - JWT: []
  *     summary: >
  *         Resends the email to a user to verify his/her email account by clicking on a link
  *         embedded in the email
  *     parameters:
  *       - in: body
  *         description: The ID of the user
  *         schema:
  *           type: object
  *           properties:
  *             id:
  *               description: The user's ID
  *               type: integer
  *               example: 2
  *               required: true
  *     responses:
  *       204:
  *         description: The email has been resent
  *       400:
  *         description: The user's account has already been activated
  *       401:
  *         description: Unauthorized.
  *       404:
  *         description: The user with the specified ID could not be found (if ID was supplied)
  *       default:
  *         description: Unexpected error.
  */

  /**
   * Resends the email verification email to the user. If no user ID is supplied, the email is sent
   * to the currently logged in user.
   *
   * @param {object} ctx
   * @param {Auth} ctx.auth
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @returns response
   * @memberof UserController
   */
  async resendVerificationEmail ({ auth, request, response }) {
    let user
    const userID = request.input('id')
    if (isInteger(userID) && auth.user.isAdmin) {
      user = await User.findOrFail(userID)
    } else {
      user = auth.user
    }
    if (user.account_status !== 'pending') {
      return response.badRequest({ message: 'User has already been verified' })
    }
    const token = await Persona.generateToken(user, 'email')
    await Event.fire('email::changed', { user, token })
    return response.noContent()
  }

  /**
  * @swagger
  * /auth/email/verify/{token}:
  *   post:
  *     tags:
  *       - Authentication
  *     summary: >
  *         Verifies a user's email address using the supplied token.
  *     parameters:
  *       - in: path
  *         name: token
  *         description: >
  *           The verification token to reset the password. This was received by email
  *           by the user.
  *         required: true
  *     responses:
  *       204:
  *         description: Email has been verified.
  *       400:
  *         description: The token could not be used to verify an email address.
  *       default:
  *         description: Unexpected error.
  */

  /**
   * Verify a user's email address using the supplied token
   *
   * @param {object} ctx
   * @param {Params} ctx.params
   * @param {Response} ctx.response

   * @returns response
   * @memberof UserController
   */
  async verifyEmailAddress ({ params, response }) {
    await Persona.verifyEmail(decodeURIComponent(params.token))
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
  *                   id:
  *                     description: The id of the user type
  *                     example: 2
  *                     type: integer
  *                   name:
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

  /**
  * @swagger
  * /users/search:
  *   post:
  *     tags:
  *       - Users
  *     security:
  *       - JWT: []
  *     summary: >
  *         Searches for users by name
  *     consumes:
  *       - application/json
  *     parameters:
  *       - in: body
  *         name: term
  *         description: The search term; the name to search for.
  *         schema:
  *           type: object
  *           properties:
  *             term:
  *               type: string
  *               description: The name to search for
  *               example: John
  *               required: true
  *     responses:
  *       200:
  *         description: The users matching the query
  *         schema:
  *           properties:
  *             data:
  *               type: array
  *               items:
  *                 type: object
  *                 properties:
  *                   value:
  *                     type: integer
  *                     description: The ID of the user
  *                     example: 22
  *                   text:
  *                     type: string
  *                     description: The name of the user
  *                     example: John Doe
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
  async search ({ request }) {
    const term = request.input('term')
    if (!term || term.length < 2) {
      return { data: [] }
    }

    const data = await User.query()
      .where('name', 'LIKE', `%${term}%`)
      .where('account_status', 'active')
      .select('id as value', 'name as text')
      .limit(10)
      .fetch()

    return { data }
  }
}

module.exports = UserController
