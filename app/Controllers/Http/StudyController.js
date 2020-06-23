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
    console.log(studies)
    return { data: studies }
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
    await study.reload() // Refresh data otherwise some parameters are missing
    return { data: study }
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
      response.notFound({ error: { message: `Study with ID:${params.id} could not be found` } })
      return
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

  announce ({ params, request, response }) {
    response.send({ message: `Called announce with rfid ${params.rfid}` })
  }

  fetchJob ({ params, request, response }) {
    response.send({ message: `Called fetchJob with rfid ${params.rfid}` })
  }

  currentJobIndex ({ params, request, response }) {
    response.send({ message: `Called currentJobIndex with rfid ${params.rfid}` })
  }

  /**
   * CREATE jobs (insert)
   *
   * @param {*} { params, request, response }
   * @memberof StudyController
   */
  insertJobs ({ params, request, response }) {
    const studyID = params.id
    const index = parseInt(request.input('at'))
    const jobs = request.input('jobs', [])
    let message = `Called fetchJobs with studyID ${studyID}. Insert `
    if (index) {
      message += `at index ${index} `
    }

    response.send({ message, jobs })
  }

  /**
   * READ jobs
   *
   * @param {*} { params, request, response }
   * @memberof StudyController
   */
  fetchJobs ({ params, request, response }) {
    let message = `Called fetchJobs with studyID ${params.id}`
    message += ` with jobindex from ${request.input('from')} to ${request.input('to')}`

    response.send({ message })
  }

  /**
   * UPDATE jobs
   *
   * @param {*} { params, request, response }
   * @memberof StudyController
   */
  updateJobs ({ params, request, response }) {
    const message = `Called updateJobs with studyID ${params.id}`
    const jobs = request.input('jobs', [])
    response.send({ message, jobs })
  }

  /**
   * DELETE jobs
   *
   * @param {*} { params, request, response }
   * @memberof StudyController
   */
  deleteJobs ({ params, request, response }) {
    const studyID = params.id
    const jobStart = params.from
    const jobEnd = params.to

    let message = `Called deleteJobs with studyID ${studyID}`
    message += ` with jobindex from ${jobStart} to ${jobEnd}`
    response.send({ message })
  }
}

module.exports = StudyController
