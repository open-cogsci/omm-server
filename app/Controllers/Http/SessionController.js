/* eslint-disable camelcase */
'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Session = use('App/Models/Session')
const { validate } = use('Validator')
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
  *         Retrieves session data
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
  *             participant_id:
  *               type: string
  *               description: The participant identifier to set the data for
  *               example: pp12345
  *             data:
  *               type: string
  *               description: The data to set
  *               example: "{\"rt\": 500}"
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
    const validation = await validate(request.all(), {
      study_id: 'integer',
      participant_id: 'string',
      data: 'required|json'
    })
    if (validation.fails()) {
      return response.status(422).json(validation.messages())
    }
    const studyID = request.input('study_id', null)
    const participantID = request.input('participant_id', null)
    const data = request.input('data', {})
    const record = await Session.query()
      .where('study_id', studyID)
      .where('participant_id', participantID)
      .first()
    if (record === null) {
      await Session.create({
        study_id: studyID,
        participant_id: participantID,
        data
      })
    } else {
      record.data = data
      await record.save()
    }
    return response.noContent()
  }

  /**
  * @swagger
  * /sessions:
  *   delete:
  *     tags:
  *       - Sessions
  *     summary: >
  *         Deletes session data.
  *     parameters:
  *       - in: query
  *         name: study_id
  *         type: integer
  *         description: The ID of the study
  *       - in: query
  *         name: participant_id
  *         type: string
  *         description: The identifier of the participant
  *     responses:
  *       204:
  *         description: The session data has been deleted.
  *       404:
  *         description: The session with the specified parameters was not found.
  *       default:
  *         description: Unexpected error
  */

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
