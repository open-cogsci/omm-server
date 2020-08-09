'use strict'

const { formatISO9075 } = require('date-fns')

const Job = use('App/Models/Job')
const Database = use('Database')

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with jobs
 */
class JobController {
  /**
   * Display a single job.
   * GET jobs/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, request, response, view }) {
  }

  /**
  * @swagger
  * /jobs/study/{study_id}:
  *   get:
  *     tags:
  *       - Jobs
  *     security:
  *       - JWT: []
  *     summary: >
  *         Retrieves a paginated list of jobs for the specifiied study.
  *     parameters:
  *       - in: path
  *         name: study_id
  *         required: true
  *         type: integer
  *         description: The study to fetch jobs for.
  *       - in: query
  *         name: active
  *         required: false
  *         type: boolean
  *         description: Whether to retrieve active or archived studies.
  *     responses:
  *       200:
  *         description: An array of jobs
  *         schema:
  *           properties:
  *             data:
  *               type: array
  *               items:
  *                 $ref: '#/definitions/JobWithRelations'
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
  async index ({ params, request, auth, transform }) {
    const { study_id: studyID } = params
    // Check if user has permission to view this study
    await auth.user.studies()
      .where('study_id', studyID)
      .firstOrFail()

    const jobs = await Job.query()
      .where('study_id', studyID)
      .orderBy('position', 'asc')
      .paginate(1)

    return transform.paginate(jobs, 'JobTransformer')
  }

  /**
  * @swagger
  * /jobs/{id}:
  *   put:
  *     tags:
  *       - Jobs
  *     security:
  *       - JWT: []
  *     summary: >
  *         Updates a job by setting a variable value.
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         type: integer
  *         description: The ID of the job to update.
  *       - in: body
  *         name: data
  *         description: The data to update
  *         schema:
  *           type: object
  *           properties:
  *             variable_id:
  *               type: integer
  *               required: true
  *               description: The variable's value to change.
  *               example: 23
  *             value:
  *               type: any
  *               required: true
  *               description: The new value to set for the variable.
  *               example: blue
  *     responses:
  *       200:
  *         description: The updated Job and variable record.
  *         schema:
  *           properties:
  *             data:
  *               $ref: '#/definitions/JobWithRelations'
  *       400:
  *         description: The request was invalid (e.g. the passed data did not validate).
  *         schema:
  *           type: array
  *           items:
  *             $ref: '#/definitions/ValidationError'
  *       404:
  *         description: The job with the specified id was not found.
  *       default:
  *         description: Unexpected error
  *   patch:
  *     tags:
  *       - Jobs
  *     security:
  *       - JWT: []
  *     summary: >
  *         Updates a job by setting a variable value.
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         type: integer
  *         description: The ID of the job to update.
  *       - in: body
  *         name: data
  *         description: The data to update.
  *         schema:
  *           type: object
  *           properties:
  *             variable_id:
  *               type: integer
  *               required: true
  *               description: The variable's value to change.
  *               example: 23
  *             value:
  *               type: any
  *               required: true
  *               description: The new value to set for the variable.
  *               example: blue
  *     responses:
  *       200:
  *         description: The updated Job and variable record.
  *         schema:
  *           properties:
  *             data:
  *               $ref: '#/definitions/JobWithRelations'
  *       400:
  *         description: The request was invalid (e.g. the passed data did not validate).
  *         schema:
  *           type: array
  *           items:
  *             $ref: '#/definitions/ValidationError'
  *       404:
  *         description: The job with the specified id was not found.
  *       default:
  *         description: Unexpected error
  */

  /**
   * Update job details.
   * PUT or PATCH jobs/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, auth, transform }) {
    const { id } = params
    const { variable_id: variableID, value } = request.all()
    const job = await Job.query()
      .with('study')
      .where('id', id)
      .firstOrFail()
    const study = job.getRelated('study')
    if (!study.isEditableBy(auth.user)) {
      throw new Error('Insufficient privileges')
    }

    const rowsUpdated = await Database.table('job_variable')
      .where('job_id', id)
      .where('variable_id', variableID)
      .update({
        value,
        updated_at: formatISO9075(Date.now())
      })

    if (rowsUpdated === 0) {
      throw new Error('Failed to update variable')
    }

    await job.load('variables')
    return transform.item(job, 'JobTransformer')
  }

  /**
   * Delete a job with id.
   * DELETE jobs/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response }) {
  }

  /**
   * Movejob with id to new position.
   * DELETE jobs/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async moveToPosition ({ params, response }) {
    const { id, position: newPosition } = params
    const job = await Job.query()
      .with('study', (q) => {
        q.withCount('jobs')
      })
      .where('id', id)
      .firstOrFail()

    const study = job.getRelated('study')
    const jobCount = study.$sideLoaded.jobs_count
    let oldPosition

    try {
      if (!parseInt(newPosition) || newPosition <= 0) {
        throw new Error('Incorrect position specification')
      }

      if (newPosition > jobCount) {
        throw new Error(`Position can only be smaller than ${jobCount}`)
      }

      if (job.position !== newPosition) {
        oldPosition = job.position
        // Set the position of the current job to 0 (so it isn't in way of other jobs regarding
        // the unique constraint of the position database field).
        job.position = 0
        await job.save()
        // First take care of the other jobs' positions
        if (newPosition < oldPosition) {
        // Move jobs following the new position up one position,
        // up to the old position of the current job.
          await Job.query()
            .where('study_id', study.id)
            .whereBetween('position', [newPosition, oldPosition - 1])
            .orderBy('position', 'desc')
            .increment('position', 1)
        } else if (newPosition > oldPosition) {
        // Move jobs following the old position down one position
        // up to the old position of the current job.
          await Job.query()
            .where('study_id', study.id)
            .whereBetween('position', [oldPosition, newPosition])
            .orderBy('position', 'asc')
            .decrement('position', 1)
        }
        // Change the position of the current job to its new position.
        job.position = newPosition
        await job.save()
      }
      const jobsList = await study.jobs().select('id', 'position').fetch()
      return { data: jobsList }
    } catch (e) {
      if (oldPosition) {
        job.position = oldPosition
        await job.save()
      }
      const jobsList = await study.jobs().select('id', 'position').fetch()
      return response.badRequest({ message: e.toString(), data: jobsList })
    }
  }
}

module.exports = JobController
