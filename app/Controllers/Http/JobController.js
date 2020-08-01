'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Job = use('App/Models/Job')

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
   * Update job details.
   * PUT or PATCH jobs/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {
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
    if (!parseInt(newPosition) || newPosition <= 0) {
      return response.badRequest({ message: 'Incorrect position specification' })
    }
    const job = await Job.query()
      .with('study', (q) => {
        q.withCount('jobs')
      })
      .where('id', id)
      .firstOrFail()

    const study = job.getRelated('study')
    const jobCount = study.$sideLoaded.jobs_count

    if (newPosition > jobCount) {
      return response.unprocessableEntity({ message: `Position can only be smaller than ${jobCount}` })
    }

    if (job.position !== newPosition) {
      const oldPosition = job.position
      // Set the position of the current job to 0 (so it isn't in way of other jobs regarding
      // the unique constraint of the position database field).
      job.position = 0
      await job.save()
      // First take care of the other jobs' positions
      if (newPosition < oldPosition) {
        // Move jobs following the new position up one position from the new position,
        // up to the old position of the current job.
        await Job.query()
          .where('study_id', study.id)
          .whereBetween('position', [newPosition, oldPosition - 1])
          .increment('position', 1)
      } else if (newPosition > oldPosition) {
        await Job.query()
          .where('study_id', study.id)
          .whereBetween('position', [oldPosition, newPosition])
          .decrement('position', 1)
        // Move the jobs from the new position up one space/position.
        await Job.query()
          .where('study_id', study.id)
          .where('position', '>', newPosition)
          .increment('position', 1)
      }
      // Change the position of the current job to its new position.
      job.position = newPosition
      await job.save()
    }

    const jobsList = await study.jobs().select('id', 'position').fetch()
    return { data: jobsList }
  }
}

module.exports = JobController
