'use strict'

const Database = use('Database')
const Study = use('App/Models/Study')
const Job = use('App/Models/Job')

class JobStateHelper {
  static async updateJobState (participantId, jobId, statusId) {
    await Database.table('job_states')
      .where('participant_id', participantId)
      .where('job_id', jobId)
      .update({
        status_id: statusId,
        updated_at: new Date()
      })

    const job = await Job.find(jobId)
    if (!job) return

    const study = await job.study().first()
    if (!study) return

    await study.checkIfFinished(participantId)
    await Study.resetLoopingStudiesForParticipant(participantId)
  }
}

module.exports = JobStateHelper
