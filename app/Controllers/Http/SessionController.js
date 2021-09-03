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
   * Update session details.
   * PUT or PATCH sessions/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ request, response }) {
    const studyID = request.input('study_id', null)
    const participantID = request.input('participant_id', null)
    const data = request.input('data', {})
    const session = await Session.query()
      .where('study_id', studyID)
      .where('participant_id', participantID)
      .firstOrFail()
    session.data = data
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
  async destroy ({ params, request, response }) {
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
