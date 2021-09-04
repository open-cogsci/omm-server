/* eslint-disable camelcase */
'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Session = use('App/Models/Session')

/**
 * Resourceful controller for interacting with sessions
 */
class SessionController {
  /**
  * @swagger
  * /sessions:
  *   get:
  *     tags:
  *       - Sessions
  *     summary: >
  *         Retrieves a single session
  *     parameters:
  *       - in: query
  *         name: study_id
  *         type: integer
  *         description: The ID of the study to retrieve
  *       - in: query
  *         name: participant_id
  *         type: string
  *         description: The identifier of the participant to retrieve
  *     responses:
  *       200:
  *         description: The session data.
  *         schema:
  *           properties:
  *             data:
  *               $ref: '#/definitions/Session'
  *       404:
  *         description: The session with the specified parameters was not found.
  *       default:
  *         description: Unexpected error
  */

  /**
   * Display a single session.
   * GET sessions/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ request, response }) {
    const studyID = request.input('study_id', null)
    const participantID = request.input('participant_id', null)
    const result = await Session.query()
      .where('study_id', studyID)
      .where('participant_id', participantID)
      .firstOrFail()
    return response.json({ data: result })
  }

  /**
  * @swagger
  * /sessions:
  *   put:
  *     tags:
  *       - Sessions
  *     summary: >
  *         Sets session data.
  *     parameters:
  *       - in: body
  *         name: data
  *         description: The data to update
  *         schema:
  *           type: object
  *           properties:
  *             study_id:
  *               type: integer
  *               description: The study id to set the data for
  *               example: 23
  *             participanty_id:
  *               type: string
  *               description: The participant identifier to set the data for
  *               example: pp12345
  *             data:
  *               type: json
  *               description: The data to set
  *               example: {"rt": 500}
  *     responses:
  *       204:
  *         description: OK. The data has been saved.
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
   * Update session details.
   * PUT sessions/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ request, response }) {
    const study_id = request.input('study_id', null)
    const participant_id = request.input('participant_id', null)
    const data = request.input('data', {})
    const session = new Session()
    session.fill({ study_id, participant_id, data: JSON.stringify(data) })
    await session.save()
    return response.noContent()
  }

  /**
   * Delete a session with id.
   * DELETE sessions/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ request, response }) {
    const studyID = request.input('study_id', null)
    const participantID = request.input('participant_id', null)
    await Session.query()
      .where('study_id', studyID)
      .where('participant_id', participantID)
      .delete()
    return response.noContent()
  }
}

module.exports = SessionController
