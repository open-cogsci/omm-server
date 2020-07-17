'use strict'

const Participant = use('App/Models/Participant')

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with participants
 */
class ParticipantController {
  /**
  * @swagger
  * /participants:
  *   get:
  *     tags:
  *       - Participants
  *     security:
  *       - JWT: []
  *     summary: >
  *         Retrieves a list of all participants currently present in the database.
  *     parameters:
  *       - in: query
  *         name: active
  *         required: false
  *         type: boolean
  *         description: Whether to retrieve active or archived studies.
  *     responses:
  *       200:
  *         description: An array of participants
  *         schema:
  *           properties:
  *             data:
  *               type: array
  *               items:
  *                 $ref: '#/definitions/Participant'
  *       default:
  *         description: Unexpected error
  */

  /**
   * Show a list of all participants.
   * GET participants
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async index ({ transform }) {
    const participants = await Participant
      .query()
      .withCount('studies')
      .orderBy('created_at', 'desc')
      .fetch()
    return transform.collection(participants, 'ParticipantTransformer.withStudiesCount')
  }

  /**
  * @swagger
  * /participants:
  *   post:
  *     tags:
  *       - Participants
  *     security:
  *       - JWT: []
  *     summary: >
  *         Stores a new participant in the database.
  *     consumes:
  *       - application/json
  *     parameters:
  *       - in: body
  *         name: participant
  *         description: The participant to create
  *         schema:
  *           $ref: '#/definitions/Participant'
  *     responses:
  *       201:
  *         description: OK
  *         schema:
  *           properties:
  *             data:
  *               $ref: '#/definitions/Participant'
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
   * Create/save a new participant.
   * POST participants
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response, transform }) {
    const data = request.only(['name', 'identifier', 'active'])
    const ptcp = await Participant.create(data)
    await ptcp.reload() // Refresh data otherwise some parameters are missing
    response.status(201)
    return transform.item(ptcp, 'ParticipantTransformer')
  }

  /**
  * @swagger
  * /participants/{id}:
  *   get:
  *     tags:
  *       - Participants
  *     security:
  *       - JWT: []
  *     summary: >
  *         Retrieves a single participant along with all its relations.
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         type: string
  *         description: The ID of the participant to retrieve
  *     responses:
  *       200:
  *         description: The participant with its related data.
  *         schema:
  *           properties:
  *             data:
  *               $ref: '#/definitions/ParticipantWithRelations'
  *       400:
  *         description: The specified id is invalid (e.g. not the expected dtype).
  *       404:
  *         description: The participant with the specified id was not found.
  *       default:
  *         description: Unexpected error
  */

  /**
   * Display a single participant.
   * GET participants/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async show ({ params, response, transform }) {
    const ptcp = await Participant
      .query()
      .where('id', params.id)
      .with('studies.jobs.variables.dtype')
      .first()

    if (ptcp === null) {
      response.notFound({ error: { message: `Participant with ID:${params.id} could not be found` } })
      return
    }

    return transform
      .include('studies.jobs.variables.dtype')
      .item(ptcp, 'ParticipantTransformer')
  }

  /**
  * @swagger
  * /participants/{id}:
  *   put:
  *     tags:
  *       - Participants
  *     security:
  *       - JWT: []
  *     summary: >
  *         Updates a single participant
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         type: string
  *         description: The ID of the participant to update
  *       - in: body
  *         name: participant
  *         description: The updated participant data
  *         schema:
  *           $ref: '#/definitions/Participant'
  *     responses:
  *       200:
  *         description: The updated participant.
  *         schema:
  *           properties:
  *             data:
  *               $ref: '#/definitions/Participant'
  *       400:
  *         description: The request was invalid (e.g. the passed data did not validate).
  *         schema:
  *           type: array
  *           items:
  *             $ref: '#/definitions/ValidationError'
  *       404:
  *         description: The participant with the specified id was not found.
  *       default:
  *         description: Unexpected error
  *   patch:
  *     tags:
  *       - Participants
  *     security:
  *       - JWT: []
  *     summary: >
  *         Updates a single participant
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         type: string
  *         description: The ID of the participant to update
  *       - in: body
  *         name: participant
  *         description: The updated participant data
  *         schema:
  *           $ref: '#/definitions/Participant'
  *     responses:
  *       200:
  *         description: The updated participant with its related data.
  *         schema:
  *           properties:
  *             data:
  *               $ref: '#/definitions/Participant'
  *       400:
  *         description: The request was invalid (e.g. the passed data did not validate).
  *         schema:
  *           type: array
  *           items:
  *             $ref: '#/definitions/ValidationError'
  *       404:
  *         description: The participant with the specified id was not found.
  *       default:
  *         description: Unexpected error
  */

  /**
   * Update participant details.
   * PUT or PATCH participants/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response, transform }) {
    const ptcp = await Participant.findOrFail(params.id)
    const data = request.only(['name', 'identifier', 'active'])
    ptcp.merge(data)
    try {
      await ptcp.save()
    } catch (e) {
      return response.status(400).json({
        message: 'There was a problem updating the participant, please try again later.'
      })
    }
    return transform.item(ptcp, 'ParticipantTransformer')
  }

  /**
  * @swagger
  * /participants/{id}:
  *   delete:
  *     tags:
  *       - Participants
  *     security:
  *       - JWT: []
  *     summary: >
  *         Deletes a single participant.
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         type: string
  *         description: The ID of the participant to delete.
  *     responses:
  *       204:
  *         description: The participant has been deleted.
  *       400:
  *         description: The specified id is invalid (e.g. not the expected dtype).
  *       404:
  *         description: The participant with the specified id was not found.
  *       default:
  *         description: Unexpected error
  */

  /**
   * Delete a participant with id.
   * DELETE participants/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, response }) {
    const ptcp = await Participant.findOrFail(params.id)
    try {
      await ptcp.delete()
    } catch (e) {
      response.status(500).json({ message: 'The participant could not be removed' })
    }
    return response.noContent()
  }

  /**
  * @swagger
  * /participants/{identifier}/announce:
  *   get:
  *     tags:
  *       - Studies
  *     summary: >
  *         When a participant enters a cubicle, the omm client announces this to the server, and the server replies by
  *         sending the study information.
  *     parameters:
  *       - in: path
  *         name: identifier
  *         required: true
  *         type: string
  *         description: The identifier code of the participant transmitted by its chip.
  *     responses:
  *       200:
  *         description: Sends the study to perform, including a download link for the osexp file.
  *         schema:
  *           properties:
  *             data:
  *               $ref: '#/definitions/Study'
  *       400:
  *         description: The specified identifier is invalid (e.g. not the expected dtype).
  *       404:
  *         description: The participant with the specified identifier was not found.
  *       412:
  *         description: The specified participant is marked as inactive.
  *       default:
  *         description: Unexpected error
  */
  async announce ({ params, transform, response }) {
    const { identifier } = params
    let ptcp
    try {
      ptcp = await Participant.findByOrFail('identifier', identifier)
    } catch (e) {
      return response.notFound({ message: `No participant found for identifier ${identifier}.` })
    }

    if (!ptcp.active) {
      return response.preconditionFailed({ message: 'Participant is not active' })
    }

    let study
    try {
      // First find studies that are in progress, then select pending studies.
      study = await ptcp.studies()
        .whereInPivot('status_id', [1, 2])
        .orderBy('status_id', 'desc')
        .orderBy('created_at', 'asc')
        .withPivot(['status_id'])
        .firstOrFail()
    } catch (e) {
      return response.requestedRangeNotSatisfiable({
        message: `No study available to perform for participant with identifier ${identifier}`
      })
    }

    // Set studies status from pending to in progress
    if (study.pivot_status_id === 1) {
      try {
        await ptcp.studies().pivotQuery()
          .where('study_id', study.id)
          .update({ status_id: 2 })
      } catch (e) {
        return response.internalServerError({ message: 'Could not update study status' })
      }
    }

    return transform.item(study, 'StudyTransformer')
  }

  /**
  * @swagger
  * /participants/{identifier}/{studyID}/currentjob:
  *   get:
  *     tags:
  *       - Jobs
  *     summary: >
  *         The client asks the server the next job in line.
  *     parameters:
  *       - in: path
  *         name: identifier
  *         description: the identifier code of the participant.
  *         required: true
  *         type: string
  *       - in: path
  *         name: studyID
  *         description: the study ID from which to fetch a job.
  *         required: true
  *         type: integer
  *     responses:
  *       200:
  *         description: The current job in line
  *         schema:
  *           properties:
  *             data:
  *               $ref: '#/definitions/JobWithRelations'
  *       404:
  *         description: The participant with the specified identifier was not found or there is no
  *                      job in line for the participant.
  *       412:
  *         description: The specified participant is marked as inactive.
  */
  async fetchJob ({ params, transform, response }) {
    const { identifier, studyID } = params
    let ptcp
    try {
      ptcp = await Participant.findByOrFail('identifier', identifier)
    } catch (e) {
      return response.notFound({ message: `No participant found for identifier ${identifier}.` })
    }

    if (!ptcp.active) {
      return response.preconditionFailed({ message: 'Participant is not active.' })
    }

    let study
    try {
      study = await ptcp.studies().where('studies.id', studyID).firstOrFail()
    } catch (e) {
      return response.notFound({ message: `The study with ${studyID} could not be found.` })
    }

    let job
    try {
      job = await ptcp.jobs()
        .where('study_id', study.id)
        .whereInPivot('status_id', [1, 2])
        .withPivot(['status_id'])
        .with('variables.dtype')
        .orderBy('pivot_status_id', 'desc')
        .orderBy('position', 'asc')
        .firstOrFail()
    } catch (e) {
      return response.requestedRangeNotSatisfiable({
        message: `No job could be fetched for participant with identifier ${identifier}.`
      })
    }

    // Change the status of the job from pending to started
    if (job.pivot_status_id === 1) {
      try {
        await ptcp.jobs().pivotQuery()
          .where('job_id', job.id)
          .update({ status_id: 2 })
      } catch (e) {
        return response.internalServerError({
          message: 'Could not update status of the job.'
        })
      }
    }

    return transform.item(job, 'JobTransformer')
  }

  /**
  * @swagger
  * /participants/{identifier}/{studyID}/currentjob_idx:
  *   get:
  *     tags:
  *       - Jobs
  *     summary: >
  *       The client asks the server the current job index, i.e. the row of the job table.
  *     parameters:
  *       - in: path
  *         name: identifier
  *         description: the identifier code of the participant transmitted by its chip.
  *         required: true
  *         type: string
  *       - in: path
  *         name: studyID
  *         description: the study ID from which to fetch a job.
  *         required: true
  *         type: integer
  *     responses:
  *       200:
  *         description: Sends the current job index in line
  *         schema:
  *           properties:
  *             data:
  *               type: object
  *               properties:
  *                 study_id:
  *                   type: integer
  *                   description: ID of the study to which the job belongs to.
  *                   example: 10
  *                 current_job_index:
  *                   type: integer
  *                   description: The position of the job in the jobs table of the study
  *                   example: 33
  *       404:
  *         description: The participant with the specified identifier was not found or there is no
  *                      job in line for the participant.
  *       412:
  *         description: The specified participant is marked as inactive.
  */
  async fetchJobIndex ({ params, response }) {
    const { identifier, studyID } = params
    const ptcp = await Participant.findByOrFail('identifier', identifier)

    if (!ptcp.active) {
      return response.preconditionFailed({ message: 'Participant is not active' })
    }

    const study = await ptcp.studies().where('studies.id', studyID).first()
    if (study === null) {
      return response.notFound({ message: `The study with ${studyID} could not be found` })
    }

    const job = await ptcp.jobs()
      .where('study_id', study.id)
      .whereInPivot('status_id', [1, 2])
      .withPivot(['status_id'])
      .with('variables.dtype')
      .orderBy('pivot_status_id', 'desc')
      .orderBy('position', 'asc')
      .first()

    if (job === null) {
      return response.notFound({
        message: `There are no jobs available for participant with identifier ${identifier}.`
      })
    }

    return {
      data: {
        study_id: job.study_id,
        current_job_index: job.position
      }
    }
  }

  /**
  * @swagger
  * /participants/{identifier}/{id}/result:
  *   patch:
  *     tags:
  *       - Jobs
  *     summary: >
  *         Once a job has been completed, the client sends the resulting data to the server.
  *     parameters:
  *       - in: path
  *         name: identifier
  *         required: true
  *         type: string
  *         description: The identifier of the participant for which the result is submitted.
  *       - in: path
  *         name: id
  *         required: true
  *         type: integer
  *         description: The ID of the job which the results belong to.
  *       - in: body
  *         name: job data
  *         required: true
  *         description: The job result data
  *         schema:
  *           type: object
  *           properties:
  *             data:
  *               type: string
  *               description: The result data to store for the job as a valid json string.
  *               example: {"correct": false, "rt": 200}
  *     responses:
  *       204:
  *         description: The job has been updated sucessfully
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
  async processJobResult ({ params, request, response }) {
    const { jobID, identifier } = params

    let ptcp
    try {
      ptcp = await Participant.findByOrFail('identifier', identifier)
    } catch (e) {
      return response.notFound({ message: `Could not find participant with identifier ${identifier}` })
    }

    let data = request.input('data')

    // Try to convert the data to json string
    try {
      data = JSON.stringify(data)
    } catch (e) {
      return response.unprocessableEntity({ message: 'Data cannot be converted to JSON' })
    }

    try {
      await ptcp.jobs().pivotQuery()
        .where('job_id', jobID)
        .update({ data, status_id: 3 })
    } catch (e) {
      return response.badRequest({ message: 'Unable to persist data' })
    }
    return response.noContent()
  }
}

module.exports = ParticipantController
