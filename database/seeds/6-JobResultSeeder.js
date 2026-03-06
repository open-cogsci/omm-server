'use strict'

const Database = use('Database')

class JobResultSeeder {
  async run () {
    const CHUNK_SIZE = 500
    const now = new Date()
    const studies = await Database.table('studies').select('id')

    for (const study of studies) {
      // Find finished job states for this study
      const finishedStates = await Database
        .table('job_states')
        .where('job_states.status_id', 3)
        .innerJoin('jobs', 'job_states.job_id', 'jobs.id')
        .where('jobs.study_id', study.id)
        .select('job_states.participant_id', 'job_states.job_id', 'jobs.study_id')

      // Create a result with 26 variables (result_var_a through result_var_z)
      const jobResults = finishedStates.map(state => {
        const data = {}
        for (let i = 0; i < 26; i++) {
          data[`result_var_${String.fromCharCode(97 + i)}`] = Math.floor(Math.random() * 1000)
        }
        return {
          study_id: state.study_id,
          participant_id: state.participant_id,
          job_id: state.job_id,
          data: JSON.stringify(data),
          created_at: now,
          updated_at: now
        }
      })

      for (let i = 0; i < jobResults.length; i += CHUNK_SIZE) {
        await Database.table('job_results').insert(
          jobResults.slice(i, i + CHUNK_SIZE)
        )
      }
      console.log(`  Study ${study.id}: ${jobResults.length} job results`)
    }
  }
}

module.exports = JobResultSeeder