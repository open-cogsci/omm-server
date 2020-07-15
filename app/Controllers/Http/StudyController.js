'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with studies
 */

const Study = use('App/Models/Study')

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
      response.status(400).json({ message: 'Could not create study' })
    }
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
  *         type: integer
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
  * @swagger
  * /studies/{id}:
  *   put:
  *     tags:
  *       - Studies
  *     security:
  *       - JWT: []
  *     summary: >
  *         Updates a single study
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         type: integer
  *         description: The ID of the study to update
  *       - in: body
  *         name: study
  *         description: The updated study data
  *         schema:
  *           $ref: '#/definitions/Study'
  *     responses:
  *       200:
  *         description: The updated study.
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
  *       404:
  *         description: The study with the specified id was not found.
  *       default:
  *         description: Unexpected error
  *   patch:
  *     tags:
  *       - Studies
  *     security:
  *       - JWT: []
  *     summary: >
  *         Updates a single study
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         type: integer
  *         description: The ID of the study to update
  *       - in: body
  *         name: study
  *         description: The updated study data
  *         schema:
  *           $ref: '#/definitions/Study'
  *     responses:
  *       200:
  *         description: The updated study.
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
  *       404:
  *         description: The study with the specified id was not found.
  *       default:
  *         description: Unexpected error
  */

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
  * @swagger
  * /studies/{id}:
  *   delete:
  *     tags:
  *       - Studies
  *     security:
  *       - JWT: []
  *     summary: >
  *         Deletes a single study.
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         type: integer
  *         description: The ID of the study to delete.
  *     responses:
  *       204:
  *         description: The study has been deleted.
  *       400:
  *         description: The specified id is invalid (e.g. not the expected dtype).
  *       404:
  *         description: The study with the specified id was not found.
  *       default:
  *         description: Unexpected error
  */

  /**
   * Delete a study with id.
   * DELETE studies/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, auth, response }) {
    const study = await await auth.user.studies()
      .where('id', params.id)
      .first()
    if (study === null) {
      response.notFound({ error: { message: `Study with ID:${params.id} could not be found` } })
      return
    }
    try {
      study.delete()
    } catch (e) {
      response.status(500).json({ message: 'The study could not be removed' })
    }
    return response.noContent()
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
  * @swagger
  * /studies/{id}/jobs:
  *   post:
  *     tags:
  *       - Jobs
  *     summary: >
  *         Inserts new jobs at the specified position in the job table.
  *     consumes:
  *       - application/json
  *     parameters:
  *       - in: path
  *         name: id
  *         type: integer
  *         required: true
  *         description: The ID of the study to insert the jobs for.
  *       - in: body
  *         name: data
  *         description: The jobs data to persist
  *         schema:
  *           type: object
  *           properties:
  *             at:
  *               type: integer
  *               minimum: 1
  *               description: The position in the table to insert the jobs at.
  *               example: 4
  *             jobs:
  *               type: array
  *               items:
  *                 type: object
  *                 properties:
  *                   field:
  *                     type: string
  *                     description: The variable field name (must exist in the variables table for the current study).
  *                     example: distractor
  *                   value:
  *                     type: string
  *                     description: The value of the variable for the current job.
  *                     example: present
  *     responses:
  *       201:
  *         description: OK
  *         schema:
  *           properties:
  *             data:
  *               type: array
  *               items:
  *                 $ref: '#/definitions/Job'
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
   * CREATE jobs (insert)
   *
   * @param {*} { params, request, response }
   * @memberof StudyController
   */
  async insertJobs ({ auth, params, request, response, transform }) {
    const { id } = params
    const index = parseInt(request.input('at'))
    const jobs = request.input('jobs')

    // Determine if the study exists and fetch it.
    let study, variables, jobRecords
    try {
      study = await Study.query().with('jobs').firstOrFail(id)
    } catch (e) {
      return response.notFound({ message: `Could not find study with ID ${id}` })
    }

    try {
      variables = await study.variables().pair('name', 'id')
    } catch (e) {
      return response.internalServerError({ message: 'Failed to fetch study variables' })
    }

    // Move over the old jobs, by incrementing their order value with the new jobs' length.
    try {
      await study.jobs().where('order', '>=', index).increment('order', jobs.length)
    } catch (e) {
      return response.badRequest('Unable to move previous jobs to new index: ' + e)
    }

    try {
      jobRecords = await study.jobs().createAll(jobs)
    } catch (e) {
      return response.internalServerError({ message: 'Unable to save jobs' })
    }

    return transform.collection(jobRecords, 'JobTransformer')
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
