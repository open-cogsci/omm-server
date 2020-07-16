'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Study = use('App/Models/Study')
const isInteger = require('lodash/isInteger')

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
    let study
    try {
      study = await auth.user.studies()
        .where('id', params.id)
        .with('jobs.variables.dtype')
        .with('participants')
        .firstOrFail()
    } catch (e) {
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
    let study
    try {
      study = await await auth.user.studies()
        .where('id', params.id)
        .firstOrFail()
    } catch (e) {
      return response.notFound({ error: { message: `Study with ID:${params.id} could not be found` } })
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
  *         description: >
  *           The jobs data to persist. Each job consists of a collection of key:value pairs, of which
  *           the key is the variable name and the value represents the variables value. The 'at'
  *           property specifies the position in the table at which to insert the jobs, and starts
  *           counting from 1.
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
  *                 example: {"distractor": "present", "target": "blue"}
  *                 additionalProperties:
  *                   type: string
  *     responses:
  *       201:
  *         description: The jobs have been created.
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
  async insertJobs ({ params, request, response, transform }) {
    const { id } = params
    const index = parseInt(request.input('at'))
    const jobsData = request.input('jobs')

    // Fetch the study, or throw an error if it isn't found.
    let study, jobs
    try {
      study = await Study.query().where('id', id).with('jobs').with('participants').firstOrFail()
    } catch (e) {
      return response.notFound({ message: `Could not find study with ID ${id}` })
    }

    const currentJobs = study.getRelated('jobs')
    if (index > currentJobs.size() + 1) {
      return response.badRequest({
        message: `'at' position out of range. Received ${index}, largest possible is ${currentJobs.size() + 1}`
      })
    }

    // Walk through the list of jobs and transform them so that they can easily be stored in the
    // database. Additionally check if the supplied variable name exists for this study.
    try {
      jobs = await study.saveJobsFromInput(jobsData)
    } catch (e) {
      return response.badRequest({ message: e.toString() })
    }

    // Move the old jobs to new positions, by incrementing their order value with the new jobs' length.
    try {
      await study.jobs().where('order', '>=', index).increment('order', jobsData.length)
    } catch (e) {
      return response.internalServerError('Unable to move previous jobs to new index: ' + e)
    }
    // Get a list of IDS of participants associated with the study to associate these participants
    // with the new jobs too in the next step.
    const ptcpIDs = study.getRelated('participants').rows.map(ptcp => ptcp.id)

    // Assign positions to jobs and assign them to participants of study too.
    for (const [pos, job] of jobs.entries()) {
      job.order = index + pos
      if (ptcpIDs.length > 0) {
        job.participants().attach(ptcpIDs)
      }
    }
    await study.jobs().saveMany(jobs)

    return transform.collection(jobs, 'JobTransformer')
  }

  /**
  * @swagger
  * /studies/{id}/jobs:
  *   get:
  *     tags:
  *       - Jobs
  *     summary: >
  *         Gets the jobs for the current study. The range of jobs returned can be limited by
  *         specifying the start and stop index in the query string.
  *     consumes:
  *       - application/json
  *     parameters:
  *       - in: path
  *         name: id
  *         type: integer
  *         required: true
  *         description: The ID of the study to insert the jobs for.
  *         example: 1
  *       - in: query
  *         name: from
  *         type: integer
  *         description: The start index position
  *         example: 3
  *       - in: query
  *         name: to
  *         type: integer
  *         description: The end index position
  *         example: 6
  *     responses:
  *       200:
  *         description: The requested jobs
  *         schema:
  *           properties:
  *             data:
  *               type: array
  *               items:
  *                 $ref: '#/definitions/JobWithRelations'
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
   * READ jobs
   *
   * @param {*} { params, request, response }
   * @memberof StudyController
   */
  async fetchJobs ({ params, request, response, transform }) {
    const { id } = params
    const from = request.input('from')
    const to = request.input('to')
    // Fetch the study, or throw an error if it isn't found.

    if (to && from && to <= from) {
      return response.badRequest({ message: 'To cannot be smaller than or equal to From' })
    }

    const query = Study.query().where('id', id).with('participants').with('jobs', (query) => {
      if (from) {
        query.where('order', '>=', from)
      }
      if (to) {
        query.where('order', '<', to)
      }
      query.orderBy('order', 'asc')
      query.with('variables')
    })

    let study
    try {
      study = await query.firstOrFail()
    } catch (e) {
      return response.notFound({ message: e.toString() })
    }

    const jobs = study.getRelated('jobs')
    return transform.collection(jobs, 'JobTransformer')
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
