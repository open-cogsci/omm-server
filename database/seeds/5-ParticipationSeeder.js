'use strict'

const Database = use('Database')
const Participant = use('App/Models/Participant')
const Study = use('App/Models/Study')

class ParticipationSeeder {
  async run () {
    if (await Participant.getCount() === 0 || await Study.getCount() === 0) return

    const now = new Date()
    const CHUNK_SIZE = 500

    const participants = await Database.table('participants').select('id')
    const studies = await Database.table('studies').select('id')
    const ptcpIds = participants.map(p => p.id)

    // Create participations
    const participations = []
    for (const study of studies) {
      for (const ptcpId of ptcpIds) {
        participations.push({
          participant_id: ptcpId,
          study_id: study.id,
          status_id: 1,
          created_at: now,
          updated_at: now
        })
      }
    }
    for (let i = 0; i < participations.length; i += CHUNK_SIZE) {
      await Database.table('participations').insert(
        participations.slice(i, i + CHUNK_SIZE)
      )
    }
    console.log(`  Created ${participations.length} participations`)

    // Create job_states per study
    for (const study of studies) {
      const jobs = await Database.table('jobs')
        .where('study_id', study.id)
        .orderBy('position')
        .select('id', 'position')

      const halfCount = Math.floor(jobs.length / 2)
      const jobStates = []
      for (const job of jobs) {
        const statusId = job.position <= halfCount ? 3 : 1
        for (const ptcpId of ptcpIds) {
          jobStates.push({
            participant_id: ptcpId,
            job_id: job.id,
            status_id: statusId,
            created_at: now,
            updated_at: now
          })
        }
      }
      for (let i = 0; i < jobStates.length; i += CHUNK_SIZE) {
        await Database.table('job_states').insert(
          jobStates.slice(i, i + CHUNK_SIZE)
        )
      }
      console.log(`  Study ${study.id}: ${jobStates.length} job_states`)
    }
  }
}

module.exports = ParticipationSeeder
