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
    const study = await auth.user.studies().create(data)
    await study.reload() // Refresh data otherwise some parameters are missing
    response.status(201)
    return transform.item(study, 'StudyTransformer')
  }

  /**
  * @swagger
  * /studies/{id}:
  *   get:
  *     tags:
  *       - Studies
  *     security:
  *       - JWT: []
  *     summary: >
  *         Retrieves a single study along with all its relations.
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         type: string
  *         description: The ID of the study to retrieve
  *     responses:
  *       200:
  *         description: The study with its related data.
  *         schema:
  *           properties:
  *             data:
  *               $ref: '#/definitions/StudyWithRelations'
  *       400:
  *         description: The specified id is invalid (e.g. not the expected dtype).
  *       404:
  *         description: The study with the specified id was not found.
  *       default:
  *         description: Unexpected error
  */

  /**
   * Display a single study.
   * GET studies/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async show ({ params, auth, response, transform }) {
    const study = await auth.user.studies()
      .where('id', params.id)
      .with('jobs.variables.dtype')
      .with('participants')
      .first()

    if (study === null) {
      response.notFound({ error: { message: `Study with ID:${params.id} could not be found` } })
      return
    }

    return transform
      .include('jobs')
      .item(study, 'StudyTransformer')
  }

  /**
   * Update study details.
   * PUT or PATCH studies/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request }) {
  }

  /**
   * Delete a study with id.
   * DELETE studies/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request }) {
  }

  // async upload ({ params, request, response }) {
  //   const { id } = params
  //   const expense = await Expense.find(id)

  //   if (!expense) {
  //     return response.json({ success: false })
  //   }

  //   const receiptImage = request.file('receipt')
  //   const imageName = receiptImage.clientName

  //   const Helpers = use('Helpers')
  //   await receiptImage.move(Helpers.publicPath('uploads'), {
  //     name: imageName,
  //     overwrite: true
  //   })

  //   if (!receiptImage.moved()) {
  //     return receiptImage.error()
  //   }

  //   expense.image = imageName
  //   await expense.save()

  //   return response.json(expense)
  // }

  /**
   * CREATE jobs (insert)
   *
   * @param {*} { params, request, response }
   * @memberof StudyController
   */
  insertJobs ({ params, request }) {
    const studyID = params.id
    const index = parseInt(request.input('at'))
    const jobs = request.input('jobs', [])
    let message = `Called fetchJobs with studyID ${studyID}. Insert `
    if (index) {
      message += `at index ${index} `
    }

    return { message, jobs }
  }

  /**
   * READ jobs
   *
   * @param {*} { params, request, response }
   * @memberof StudyController
   */
  fetchJobs ({ params, request }) {
    let message = `Called fetchJobs with studyID ${params.id}`
    message += ` with jobindex from ${request.input('from')} to ${request.input('to')}`

    return { message }
  }

  /**
   * UPDATE jobs
   *
   * @param {*} { params, request, response }
   * @memberof StudyController
   */
  updateJobs ({ params, request }) {
    const message = `Called updateJobs with studyID ${params.id}`
    const jobs = request.input('jobs', [])
    return { message, jobs }
  }

  /**
   * DELETE jobs
   *
   * @param {*} { params, request, response }
   * @memberof StudyController
   */
  deleteJobs ({ params, request }) {
    const studyID = params.id
    const jobStart = params.from
    const jobEnd = params.to

    let message = `Called deleteJobs with studyID ${studyID}`
    message += ` with jobindex from ${jobStart} to ${jobEnd}`
    return { message }
  }
}

module.exports = StudyController
