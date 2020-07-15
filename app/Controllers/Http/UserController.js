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
      console.log(error)
      return response.status(400).json({
        message: 'There was a problem creating the user, please try again later.'
      })
    }
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
    try {
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
    } catch (error) {
      return response.status(404).json({
        message: 'User not found'
      })
    }
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
  * @swagger
  * /auth/login:
  *   post:
  *     tags:
  *       - Authentication
  *     summary: >
  *         Updates the profile of the currently loggedin user.
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
    try {
      // validate the user credentials and generate a JWT token
      const token = await auth
        .withRefreshToken()
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
  * @swagger
  * /auth/logout:
  *   post:
  *     tags:
  *       - Authentication
  *     security:
  *       - JWT: []
  *     summary: >
  *         Logs out the current user.
  *     responses:
  *       204:
  *         description: The user has been logged out.
  *       400:
  *         description: Unable to logout.
  *       default:
  *         description: Unexpected error.
  */

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
      response.status(204).json({
        message: 'User logged out.'
      })
    } catch (error) {
      response.status(400).json({
        message: 'Unable to logout user'
      })
    }
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
  *         description: The password information.
  *         schema:
  *           type: object
  *           properties:
  *             password:
  *               description: The user's current password.
  *               type: string
  *             newPassword:
  *               description: The user's new password.
  *               type: string
  *             newPassword2:
  *               description: The user's new password repeated.
  *               type: string
  *     responses:
  *       204:
  *         description: The password has been changed.
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
