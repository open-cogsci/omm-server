'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Database = use('Database')
const Study = use('App/Models/Study')
const Participant = use('App/Models/Participant')
const User = use('App/Models/User')
const Helpers = use('Helpers')
const Logger = use('Logger')
const pool = use('Workers/Sheets')

const fs = require('fs/promises')
const { isArray, isInteger } = require('lodash')
const { format } = require('date-fns')

const processTrend = require('../../Util/trend')

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
      .with('users')
      .where('active', active)
      .orderBy('created_at', 'desc')
      .fetch()
    return transform.include('users').collection(studies, 'StudyTransformer')
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
   * @param {Auth} ctx.auth
   * @param {Transform} ctx.transform
   */
  async store ({ request, response, auth, transform }) {
    const data = request.only(['name', 'description', 'information'])
    try {
      const study = await auth.user.studies().create(data, (row) => {
        row.is_owner = true
        row.access_permission_id = 2
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
  *       401:
  *         description: Unauthorized.
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
   * @param {Params} ctx.params
   * @param {Auth} ctx.auth
   * @param {Transform} ctx.transform
   */
  async show ({ params, auth, transform }) {
    const study = await auth.user
      .studies()
      .where('id', params.id)
      .with('variables.dtype')
      .with('users')
      .with('files')
      .withCount('participants')
      .withCount('jobs')
      .withCount('jobs as completed_jobs', (query) => {
        query.whereHas('participants', (q) => {
          q.wherePivot('status_id', 3) // participation status 'finished'
        })
      })
      .firstOrFail()

    return transform
      .include('variables,users,files,completed_jobs_count,jobs_count,participants_count')
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
  *       401:
  *         description: Unauthorized.
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
  *       401:
  *         description: Unauthorized.
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
   * @param {Params} ctx.params
   * @param {Auth} ctx.auth
   * @param {Request} ctx.request
   * @param {Transform} ctx.transform
   */
  async update ({ params, auth, request, response, transform }) {
    const study = await auth.user
      .studies()
      .where('id', params.id)
      .firstOrFail()

    if (!await study.isEditableBy(auth.user)) {
      return response.unauthorized({
        message: 'You have insufficient priviliges to change this study'
      })
    }

    study.merge(request.only(['name', 'description', 'information', 'active']))
    study.save()

    return transform.item(study, 'StudyTransformer')
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
  *       401:
  *         description: Unauthorized.
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
    const { id } = params
    const study = await auth.user.studies()
      .where('id', id)
      .firstOrFail()
    if (await study.isOwnedBy(auth.user)) {
      await study.delete()
    } else {
      await auth.user.studies().detach([id])
    }
    return response.noContent()
  }

  /**
  * @swagger
  * /studies/{id}/archive:
  *   patch:
  *     tags:
  *       - Studies
  *     security:
  *       - JWT: []
  *     summary: >
  *         Archives or unarchives the study designated by ID, depending on its current state.
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         type: integer
  *         description: The ID of the study to update
  *     responses:
  *       200:
  *         description: The updated study data.
  *         schema:
  *           properties:
  *             data:
  *               $ref: '#/definitions/Study'
  *       401:
  *         description: Unauthorized
  *       404:
  *         description: The study with the specified id was not found.
  *       default:
  *         description: Unexpected error
  */

  /**
   * (Un)archive the current study
   * PUT or PATCH studies/:id/archive
   *
   * @param {object} ctx
   * @param {Params} ctx.params
   * @param {Auth} ctx.auth
   * @param {Response} ctx.response
   * @param {Transform} ctx.transform
   */
  async archive ({ params, auth, response, transform }) {
    const study = await auth.user
      .studies()
      .where('id', params.id)
      .firstOrFail()

    if (!await study.isEditableBy(auth.user)) {
      return response.unauthorized({
        message: 'You have insufficient priviliges to change this study'
      })
    }
    study.active = !study.active
    study.save()
    return transform.item(study, 'StudyTransformer')
  }

  /**
   * Upload an experiment for the study
   * PUT or PATCH studies/:id/archive
   *
   * @param {object} ctx
   * @param {Params} ctx.params
   * @param {Auth} ctx.auth
   * @param {Response} ctx.response
   * @param {Response} ctx.response
   */
  async uploadFile ({ params, auth, request, response }) {
    const { id, type } = params
    const study = await auth.user.studies()
      .where('id', id)
      .with('files')
      .firstOrFail()

    if (!study.isEditableBy(auth.user)) {
      return response.unauthorized('Insufficient privileges to edit this study')
    }

    const uploadedFile = request.file('payload')
    const storagePath = Helpers.publicPath(`files/${study.id}`)
    const filename = `${type}.${uploadedFile.extname}`

    // Remove previous file(s) of this type
    for (const fl of study.getRelated('files').rows.filter(fl => fl.type === type)) {
      await fs.unlink(Helpers.publicPath(fl.path))
    }

    await uploadedFile.move(storagePath, {
      name: filename,
      overwrite: true
    })
    if (!uploadedFile.moved()) {
      return uploadedFile.error()
    }

    // Delete previous experiment file records
    await study.files().where({ type }).delete()

    const localPath = `${storagePath}/${uploadedFile.fileName}`
    if (type === 'jobs') {
      const jsonData = await pool.exec('readSheet', [localPath])
      await study.processJobs(jsonData)
      // Attach study participants (if any) to jobs
      await study.attachParticipantsToJobs()
      await study.resetParticipationStatuses()
    }

    await study.files().create({
      filename: uploadedFile.clientName,
      path: localPath.replace(Helpers.publicPath(), ''),
      size: uploadedFile.size,
      type
    })

    // Fetch all files to also account for potential deletions/overwrites
    const files = await study.files().fetch()
    return { data: { id: study.id, files } }
  }

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
  *           the key is the variable name and the value represents the variable's value. The 'at'
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

    let trx = null
    // SQLite engine hangs on transactions, so we need to work around this
    if (Database.connection().connectionClient !== 'sqlite3') {
      trx = await Database.beginTransaction()
    }

    try {
      // Walk through the list of jobs and transform them so that they can easily be stored in the
      // database. Additionally check if the supplied variable name exists for this study.
      jobs = await study.saveJobsFromInput(jobsData, trx)

      // Move the old jobs to new positions, by incrementing their order value with the new jobs' length.
      // await study.jobs().where('position', '>=', index).increment('position', jobsData.length)
      // Create a placeholder var db to account for SQlite not sufficiently supporting transactions.
      let db
      if (trx) {
        db = trx
      } else {
        db = Database
      }

      await db.table('jobs')
        .where('study_id', id)
        .where('position', '>=', index)
        .orderBy('position', 'desc')
        .increment('position', jobsData.length)
      // Get a list of IDS of participants associated with the study to associate these participants
      // with the new jobs too in the next step.
      const ptcpIDs = study.getRelated('participants').rows.map(ptcp => ptcp.id)

      // Assign positions to jobs and assign them to participants of study too.
      for (const [pos, job] of jobs.entries()) {
        job.position = index + pos
        if (ptcpIDs.length > 0) {
          await job.participants().attach(ptcpIDs, null, trx)
        }
      }
      await study.jobs().saveMany(jobs, trx)
      if (trx) {
        await trx.commit()
      }
    } catch (e) {
      let code = 500
      if (['ReferenceError'].includes(e.name)) {
        code = 400 // BadRequest
      }
      if (trx) {
        await trx.rollback()
      }
      return response.status(code).json({ message: e.toString() })
    }

    // Set participants with status 'finished' back started (since new jobs have been added)
    await study.participants()
      .pivotQuery()
      .where('status_id', 3) // participation status 'finished'
      .update({ status_id: 2 }) // participation status 'started'

    response.status(201)
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
  *         description: The ID of the study to retrieve the jobs from.
  *         example: 1
  *       - in: query
  *         name: from
  *         type: integer
  *         description: The start index position.
  *         example: 3
  *       - in: query
  *         name: to
  *         type: integer
  *         description: The end index position.
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
  *         description: The request was invalid (e.g. wrong parameters were passed).
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
    const { from, to } = request.all()

    if (to && from && to <= from) {
      return response.badRequest({ message: 'To cannot be smaller than or equal to From' })
    }

    // Fetch the study, or throw an error if it isn't found.
    const query = Study.query()
      .where('id', id)
      .with('jobs', (query) => {
        if (from) {
          query.where('position', '>=', from)
        }
        if (to) {
          query.where('position', '<', to)
        }
        query.orderBy('position', 'asc')
        query.with('variables.dtype')
        query.with('participants')
      })

    const study = await query.firstOrFail()
    const jobs = study.getRelated('jobs')
    return transform.include('participants').collection(jobs, 'JobTransformer')
  }

  /**
  * @swagger
  * /studies/{id}/jobs/count:
  *   get:
  *     tags:
  *       - Jobs
  *     summary: >
  *         Gets the number of jobs for the current study.
  *     consumes:
  *       - application/json
  *     parameters:
  *       - in: path
  *         name: id
  *         type: integer
  *         required: true
  *         description: The ID of the study to retrieve the jobs from.
  *         example: 1
  *     responses:
  *       200:
  *         description: The jobs count for the specified study
  *         schema:
  *           properties:
  *             data:
  *               type: object
  *               properties:
  *                 jobs_count:
  *                   type: integer
  *                   description: The number of jobs
  *                   example: 22
  *       400:
  *         description: The request was invalid (e.g. wrong parameters were passed).
  *       default:
  *         description: Unexpected error
  */

  /**
   * Count jobs
   *
   * @param {*} { params, request, response }
   * @memberof StudyController
   */
  async countJobs ({ params }) {
    const { id } = params

    // Fetch the study, or throw an error if it isn't found.
    const result = await Study.query()
      .where('id', id)
      .withCount('jobs')
      .firstOrFail()
    return { data: { jobs_count: result.jobs_count } }
  }

  /**
  * @swagger
  * /studies/{id}/jobs/state:
  *   put:
  *     tags:
  *       - Jobs
  *     summary: >
  *         Sets the state of jobs of the specified study.
  *     consumes:
  *       - application/json
  *     parameters:
  *       - in: path
  *         name: id
  *         type: integer
  *         required: true
  *         description: The ID of the study to which the jobs belong.
  *       - in: body
  *         name: data
  *         description: >
  *           The range of jobs to change the state for. The 'from'
  *           and 'to' properties specify the range (i.e. positions) of jobs to change the state for,
  *           and start counting at 1 (e.g. positions are 1-indexed).
  *         schema:
  *           type: object
  *           properties:
  *             from:
  *               type: integer
  *               minimum: 1
  *               description: The start position of the job range.
  *               example: 1
  *               required: true
  *             to:
  *               type: integer
  *               minimum: 2
  *               description: The end position of the job range (not inclusive).
  *               example: 3
  *               required: true
  *             state:
  *               type: integer
  *               description: The state to set where 1=pending, 2=started, and 3=finished.
  *               example: 2
  *               required: true
  *             participant:
  *               type: string
  *               description: The participant identifier to change the states for
  *               example: zxc123
  *     responses:
  *       200:
  *         description: The jobs states have been updated
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
   * Set job states
   *
   * @param {*} { params, request, response }
   * @memberof StudyController
   */
  async setJobStates ({ params, request, response }) {
    const { id } = params
    const { from, to, state, participant: ptcpID } = request.all()

    if (to && from && to <= from) {
      return response.badRequest({ message: 'To cannot be smaller than or equal to From' })
    }

    const study = await Study.findOrFail(id)
    const participant = await Participant.findByOrFail('identifier', ptcpID)

    let rowsUpdated = 0
    // SQLite doesn't support inner joins, therefore we need this ugly way:
    if (Database.connection().connectionClient === 'sqlite3') {
      const jobIDs = await participant.jobs()
        .where('study_id', id)
        .whereBetween('jobs.position', [from, (to - 1)])
        .ids()
      rowsUpdated = await participant.jobs()
        .pivotQuery()
        .whereIn('job_id', jobIDs)
        .update({ status_id: state })
    } else {
      await Database.transaction(async (trx) => {
        rowsUpdated = await trx.table('job_states')
          .leftJoin('jobs', 'job_states.job_id', 'jobs.id')
          .leftJoin('studies', 'jobs.study_id', 'studies.id')
          .where('studies.id', id)
          .whereBetween('jobs.position', [from, (to - 1)])
          .leftJoin('participants', 'job_states.participant_id', 'participants.id')
          .where('participants.identifier', `${ptcpID}`)
          .update({ status_id: state })
      })
    }

    // Check if the study if finished for this participant (i.e. there are not open jobs),
    // and set this status accordingly
    await study.checkIfFinished(participant.id)

    return response.json({
      data: { jobs_updated: rowsUpdated }
    })
  }

  /**
  * @swagger
  * /studies/{id}/jobs/{from}/{to}:
  *   delete:
  *     tags:
  *       - Jobs
  *     summary: >
  *         Deletes the jobs from the specified study.
  *     consumes:
  *       - application/json
  *     parameters:
  *       - in: path
  *         name: id
  *         type: integer
  *         required: true
  *         description: The ID of the study to which the jobs belong
  *       - in: path
  *         name: from
  *         type: integer
  *         required: true
  *         description: The start position of the range of jobs to delete
  *       - in: path
  *         name: to
  *         type: integer
  *         required: true
  *         description: The end position of the range of jobs to delete (not inclusive)
  *     responses:
  *       200:
  *         description: The jobs states have been updated
  *       400:
  *         description: The request was invalid (e.g. the passed data did not validate).
  *       default:
  *         description: Unexpected error
  */

  /**
   * DELETE jobs
   *
   * @param {*} { params, request, response }
   * @memberof StudyController
   */
  async deleteJobs ({ params, response }) {
    const { id } = params
    const from = parseInt(params.from)
    const to = parseInt(params.to)

    if (!isInteger(from) || !isInteger(to) || from <= 0 || to <= 0) {
      return response.badRequest({
        message: 'Provide from and to parameters as integers above 0'
      })
    }

    if (to <= from) {
      return response.badRequest({ message: 'To cannot be smaller than or equal to From' })
    }

    const study = await Study.findOrFail(id)
    const rowsDeleted = await study.jobs().whereBetween('position', [from, (to - 1)]).delete()

    // Shift the positions of any studies above the deleted range down the number of deleted items.
    await study.jobs().where('position', '>=', to).decrement('position', rowsDeleted)

    return {
      data: { jobs_deleted: rowsDeleted }
    }
  }

  /**
   * Add collaborator for this study
   *
   * @param {*} { params, request, response, auth, transform }
   * @returns
   * @memberof StudyController
   */
  async addCollaborator ({ params, request, response, auth, transform }) {
    const { id } = params
    const userID = request.input('userID')

    const study = await auth.user.studies().where('id', id).firstOrFail()
    if (!await study.isOwnedBy(auth.user)) {
      return response.unauthorized({ message: 'Only the study owner can add collaborators' })
    }

    const user = await User.findOrFail(userID)
    if (user.account_status !== 'active') {
      return response.badRequest({ message: 'User status does not allow collaboration' })
    }

    await study.users().attach([userID])
    await study.load('users', (query) => {
      query.where('id', userID)
    })
    return transform.include('users').item(study, 'StudyTransformer')
  }

  /**
   * Set access permissions for collaborator
   *
   * @param {*} { params, request, response, auth, transform }
   * @returns
   * @memberof StudyController
   */
  async updateCollaborator ({ params, request, response, auth, transform }) {
    const { id } = params
    const { userID, level } = request.all()

    const study = await auth.user.studies().where('id', id).firstOrFail()
    if (!await study.isOwnedBy(auth.user)) {
      return response.unauthorized({ message: 'Only the study owner can edit access levels' })
    }
    await study.users().pivotQuery()
      .where('user_id', userID)
      .update({ access_permission_id: level })

    await study.load('users', (query) => {
      query.where('id', userID)
    })
    return transform.include('users').item(study, 'StudyTransformer')
  }

  /**
   * Remove collaborator from study
   *
   * @param {*} { params, response, auth }
   * @returns
   * @memberof StudyController
   */
  async removeCollaborator ({ params, response, auth }) {
    const { id, userID } = params
    const study = await auth.user.studies().where('id', id).firstOrFail()
    if (!await study.isOwnedBy(auth.user)) {
      return response.unauthorized({ message: 'Only the study owner can remove collaborators' })
    }
    await study.users().detach([userID])
    return response.noContent()
  }

  /**
   * Download the study's data
   *
   * @param {*} { params, response, auth }
   * @returns
   * @memberof StudyController
   */
  async generateDatafile ({ params, auth, request, response }) {
    const { id } = params
    const filetype = request.input('format', 'csv')
    const allowedFormats = ['ods', 'xlsx', 'csv']
    if (!allowedFormats.includes(filetype)) {
      return response.badRequest(`Invalid file format, possible values are ${allowedFormats}`)
    }
    const study = await auth.user.studies().where('id', id).firstOrFail()
    const data = await study.getCollectedJobResultData()
    const destFolder = Helpers.publicPath(`files/${study.id}`)

    // Even though this rarely occurs, check if folder for the study has already been
    // created in the files folder.
    try {
      await fs.mkdir(destFolder, { recursive: true })
    } catch (e) {
      return response.internalServerError('Could not create data folder')
    }

    const timestamp = format(new Date(), 'yyyyMMddHHmmss')
    const filename = `data_${timestamp}.${filetype}`
    const path = `${destFolder}/${filename}`
    const type = `data-${filetype}`
    // Offload file creation to worker thread
    await pool.exec('writeSheet', [data, path, filetype])
    // Delete any previous occurrences of the file in the current format
    const previousFile = await study.files().where('type', type).first()
    if (previousFile) {
      try {
        await fs.unlink(Helpers.publicPath(previousFile.path))
        await previousFile.delete()
      } catch (e) {
        Logger.error('error while deleting previous data file: %s', e.toString())
      }
    }

    const newFile = await study.files().create({
      path: path.replace(Helpers.publicPath(), ''),
      filename,
      type
    })
    return { data: { id: study.id, files: [newFile] } }
  }

  /**
   * Fetch participants for a specific study
   *
   * @param {*} { params, request, auth, transform }
   * @returns
   * @memberof ParticipantController
   */
  async fetchParticipants ({ params, request, auth, transform }) {
    const { id } = params
    // Check if user has permission to view this study
    const study = await auth.user.studies()
      .where('study_id', id)
      .firstOrFail()

    const perPage = request.input('perPage', 10)
    const page = request.input('page', 1)

    const ptcps = await study.participants()
      .with('studies', (q) => {
        q.where('study_id', study.id).select('id')
      })
      .withCount('jobs as completed_jobs', (query) => {
        query.where('study_id', study.id).wherePivot('status_id', 3) // job state status 'finished'
      })
      .orderBy('name', 'asc')
      .paginate(page, perPage)

    const reply = await transform.paginate(ptcps, 'ParticipantTransformer.paginatedUnderStudy')
    // Transform the record making study the parent record, to assure fluent handling by
    // vuex-orm on the client-side
    reply.data = { id: parseInt(id), participants: reply.data }
    return reply
  }

  /**
   * Fetch participant IDS for the study
   *
   * @param {*} { params, auth }
   * @returns
   * @memberof StudyController
   */
  async fetchParticipantIDs ({ params, auth }) {
    const { id } = params
    // Check if user has permission to view this study
    const study = await auth.user.studies()
      .where('study_id', id)
      .firstOrFail()

    const assigned = await study.participants().where('active', 1).ids()
    const all = await Participant.query().where('active', 1).ids()
    const total = all.length
    return { data: { assigned, all, total } }
  }

  /**
   * Assign participants to a study
   *
   * @param {Object} { params, auth, request, response }
   * @returns {Response}
   * @memberof StudyController
   */
  async assignParticipants ({ params, auth, request, response }) {
    const { id } = params
    // Check if user has permission to view this study
    const study = await auth.user.studies()
      .where('study_id', id)
      .firstOrFail()

    if (!await study.isEditableBy(auth.user)) {
      return response.unauthorized({ message: 'You cannot edit this study' })
    }

    const ptcpIDs = request.input('participants')
    if (!ptcpIDs || !isArray(ptcpIDs)) {
      return response.badRequest({ message: 'No participants were specified' })
    }

    // Set priority for all new participants
    const ptcpPriority = request.input('priority')
    await study.participants().attach(ptcpIDs, (row) => {
      row.priority = ptcpPriority
    })

    // Also assign participants to study jobs
    const jobIDs = await study.jobs().ids()
    const ptcpJobs = []
    for (const jobID of jobIDs) {
      for (const ptcpID of ptcpIDs) {
        ptcpJobs.push({
          job_id: jobID,
          participant_id: ptcpID
        })
      }
    }
    await Database.table('job_states').insert(ptcpJobs)
    return response.noContent()
  }

  /**
   * Detach participant from a study
   *
   * @param {Object} { params, auth, request, response }
   * @returns {Response}
   * @memberof StudyController
   */
  async revokeParticipants ({ params, auth, request, response }) {
    const { id } = params
    // Check if user has permission to view this study
    const study = await auth.user.studies()
      .where('study_id', id)
      .firstOrFail()

    if (!await study.isEditableBy(auth.user)) {
      return response.unauthorized({ message: 'You cannot edit this study' })
    }

    const ptcpIDs = request.input('participants')
    if (!ptcpIDs) {
      return response.badRequest({ message: 'No participants were specified' })
    }

    let ptcpIdentifiers = await study.participants().pair('id', 'identifier')
    ptcpIdentifiers = Object.entries(ptcpIdentifiers).map(([_k, v]) => v)
    await study.participants().detach(ptcpIDs)
    // Clear any session data pertaining to revoked participants
    await study.sessions().whereIn('participant_id', ptcpIdentifiers).delete()

    const jobIDs = await study.jobs().ids()
    // Also clean up noncompleted jobs
    await Database.table('job_states')
      .whereIn('participant_id', ptcpIDs)
      .whereIn('job_id', jobIDs)
      .delete()
    return response.noContent()
  }

  /**
   * Provides stats about the current status of the study
   *
   * @param {Object} { params, auth }
   * @return {Object} JSON data with stats
   * @memberof StudyController
   */
  async participationStats ({ params, auth, request }) {
    const { id } = params
    const bins = request.input('bins', 20)
    // Check if user has permission to view this study
    const study = await auth.user.studies()
      .where('id', id)
      .withCount('participants')
      .withCount('participants as finished_participants', (query) => {
        query.wherePivot('status_id', 3) // participation status 'finished'
      })
      .withCount('participants as started_participants', (query) => {
        query.wherePivot('status_id', 2) // participation status 'started'
      })
      .withCount('participants as pending_participants', (query) => {
        query.wherePivot('status_id', 1) // participation status 'pending'
      })
      .firstOrFail()

    const ptcpTrend = (await Database.raw(`
      SELECT SUM(c) AS amount, bin, updated_at
      FROM (
        SELECT
          job_states.updated_at,
          count(*) AS c,
          FLOOR(
            PERCENT_RANK() OVER (
                ORDER BY job_states.updated_at ASC
            ) * ?) as bin
        FROM job_states
        LEFT JOIN jobs ON job_states.job_id = jobs.id
        WHERE status_id = 3 AND jobs.study_id = ?
        GROUP BY job_states.updated_at
      ) as bins
      GROUP BY bin, updated_at
      `, [bins, study.id]))[0]

    const trend = processTrend(bins, ptcpTrend)

    const data = {
      participants: {
        pending: study.$sideLoaded.pending_participants,
        in_progress: study.$sideLoaded.started_participants,
        finished: study.$sideLoaded.finished_participants,
        total: study.$sideLoaded.participants_count
      },
      trend
    }
    return { data }
  }

  /**
  * @swagger
  * /studies/{id}/queue/{ptcpid}:
  *   get:
  *     tags:
  *       - Studies
  *     security:
  *       - JWT: []
  *     summary: >
  *         Get queue positions of participants for the specified study.
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         type: integer
  *         description: The ID of the study to retrieve
  *       - in: path
  *         name: ptcpid
  *         required: false
  *         type: integer
  *         description: The ID of the participant
  *     responses:
  *       200:
  *         description: The study with its related data.
  *         schema:
  *           properties:
  *             data:
  *               $ref: '#/definitions/StudyWithRelations'
  *       400:
  *         description: The specified id is invalid (e.g. not the expected dtype).
  *       401:
  *         description: Unauthorized.
  *       404:
  *         description: The study with the specified id was not found.
  *       default:
  *         description: Unexpected error
  */
  async participantQueue ({ params, auth }) {
    const { id, ptcpid = null } = params
    const study = await auth.user.studies()
      .where('id', id)
      .first()
    const data = await study.getParticipantQueuePositions(ptcpid)
    return { data }
  }
}
module.exports = StudyController
