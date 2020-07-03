'use strict'

const Study = use('App/Models/Study')
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
    const data = request.only(['name', 'rfid', 'active'])
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
  async update ({ params, request, transform }) {
    const ptcp = await Participant.findOrFail(params.id)
    const data = request.only(['name', 'rfid', 'active'])
    ptcp.merge(data)
    await ptcp.save()
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
  async destroy ({ params, request, response }) {
    const ptcp = await Participant.findOrFail(params.id)
    ptcp.delete()
    return response.noContent()
  }

  /**
  * @swagger
  * /participants/{rfid}/announce:
  *   get:
  *     tags:
  *       - Studies
  *     summary: >
  *         When a participant enters a cubicle, the omm client announces this to the server, and the server replies by
  *         sending the study information.
  *     parameters:
  *       - in: path
  *         name: rfid
  *         required: true
  *         type: string
  *         description: The RFID code of the participant transmitted by its chip.
  *     responses:
  *       200:
  *         description: Sends the study to perform, including a download link for the osexp file.
  *         schema:
  *           properties:
  *             data:
  *               $ref: '#/definitions/Study'
  *       400:
  *         description: The specified rfid is invalid (e.g. not the expected dtype).
  *       404:
  *         description: The participant with the specified rfid was not found.
  *       default:
  *         description: Unexpected error
  */
  async announce ({ transform }) {
    const study = await Study.firstOrFail()
    return transform.item(study, 'StudyTransformer')
  }

  /**
  * @swagger
  * /participants/{rfid}/fetchjob:
  *   get:
  *     tags:
  *       - Jobs
  *     summary: >
  *         The client asks for a job, and the server replies by sending job data. The current job is always
  *         the first job in the table with a ready state.
  *     parameters:
  *       - in: path
  *         name: rfid
  *         description: the RFID code of the participant transmitted by its chip.
  *         required: true
  *         type: string
  *     responses:
  *       200:
  *         description: Sends the current job in line for the participant with the specified RFID.
  *         schema:
  *           properties:
  *             data:
  *               $ref: '#/definitions/Job'
  *       404:
  *         description: The participant with the specified rfid was not found.
  */
  async fetchJob ({ transform }) {
    const study = await Study.firstOrFail()
    const jobs = study.jobs().fetch()
    return transform.item(jobs, 'JobTransformer')
  }

  /**
  * @swagger
  * /participants/{rfid}/jobindex:
  *   get:
  *     tags:
  *       - Jobs
  *     summary: >
  *       The client asks the server the current job index, i.e. the row of the job table.
  *     parameters:
  *       - in: path
  *         name: rfid
  *         description: the RFID code of the participant transmitted by its chip.
  *         required: true
  *         type: string
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
  *         description: The participant with the specified rfid was not found.
  */
  fetchJobIndex ({ params, request }) {
    return { message: `Called currentJobIndex with rfid ${params.rfid}` }
  }
}

module.exports = ParticipantController
