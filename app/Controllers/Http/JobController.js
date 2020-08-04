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
        // Move jobs following the new position up one position from the new position,
        // up to the old position of the current job.
          await Job.query()
            .where('study_id', study.id)
            .whereBetween('position', [newPosition, oldPosition - 1])
            .orderBy('position', 'desc')
            .increment('position', 1)
        } else if (newPosition > oldPosition) {
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
