'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with studies
 */
class StudyController {
  /**
   * Show a list of all studies.
   * GET studies
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Auth} ctx.auth
   * @param {Response} ctx.response
   */
  async index ({ request, auth }) {
    const active = request.input('active') !== 'false'
    const studies = await auth.user
      .studies()
      .where('active', active)
      .orderBy('created_at', 'desc')
      .fetch()
    return studies
  }

  /**
   * Create/save a new study.
   * POST studies
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, auth }) {
    const data = request.only(['name', 'description'])
    const study = await auth.user.studies().create(data)
    return study
  }

  /**
   * Display a single study.
   * GET studies/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async show ({ params, auth, response }) {
    const data = await auth.user.studies().where('id', params.id).first()
    if (data === null) {
      return response.notFound().send({ message: 'Study could not be found' })
    }
    return { data }
  }

  /**
   * Update study details.
   * PUT or PATCH studies/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {
  }

  /**
   * Delete a study with id.
   * DELETE studies/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response }) {
  }
}

module.exports = StudyController
