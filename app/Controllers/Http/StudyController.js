'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with studies
 */
class StudyController {
  /**
  * @swagger
  * /studies:
  *   get:
  *     tags:
  *       - Studies
  *     security:
  *       - JWT: []
  *     summary: >
  *         Retrieves a list of all studies currently present in the database.
  *     parameters:
  *       - in: query
  *         name: active
  *         required: false
  *         type: boolean
  *         description: Whether to retrieve active or archived studies.
  *     responses:
  *       200:
  *         description: An array of studies
  *         schema:
  *           properties:
  *             data:
  *               type: array
  *               items:
  *                 $ref: '#/definitions/Study'
  *       default:
  *         description: Unexpected error
  */

  /**
   * Show a list of all studies.
   * GET studies
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Auth} ctx.auth
   * @param {Response} ctx.response
   */
  async index ({ request, auth, transform }) {
    const active = request.input('active') !== 'false'
    const studies = await auth.user
      .studies()
      .where('active', active)
      .orderBy('created_at', 'desc')
      .fetch()
    return transform.collection(studies, 'StudyTransformer')
  }

  /**
  * @swagger
  * /studies:
  *   post:
  *     tags:
  *       - Studies
  *     security:
  *       - JWT: []
  *     summary: >
  *         Stores a new study in the database.
  *     consumes:
  *       - application/json
  *     parameters:
  *       - in: body
  *         name: study
  *         description: The study to create
  *         schema:
  *           $ref: '#/definitions/Study'
  *     responses:
  *       201:
  *         description: OK
  *         schema:
  *           properties:
  *             data:
  *               $ref: '#/definitions/Study'
  *       400:
  *         description: The request was invalid (e.g. the passed data did not validate).
  *         schema:
  *           type: array
  *           items:
  *             $ref: '#/definitions/ValidationError'
  *       default:
  *         description: Unexpected error
  */

  /**
   * Create/save a new study.
   * POST studies
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response, auth, transform }) {
    const data = request.only(['name', 'description'])
    try {
      const study = await auth.user.studies().create(data, (row) => {
        row.is_owner = true
      })
      await study.reload() // Refresh data otherwise some parameters are missing
      await study.load('users.userType')
      response.status(201)
      return transform.include('users').item(study, 'StudyTransformer')
    } catch (e) {
      return response.status(400).json({ message: 'Could not create study' })
    }
  }
}

module.exports = StudyController
