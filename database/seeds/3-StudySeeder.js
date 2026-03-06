'use strict'

const Database = use('Database')
const Study = use('App/Models/Study')

class StudySeeder {
  async run () {
    if (await Study.getCount() > 0) return

    const now = new Date()
    const NUM_STUDIES = 10
    const NUM_JOBS = 100
    const NUM_VARS = 26
    const CHUNK_SIZE = 500

    // Create studies
    const studies = Array.from({ length: NUM_STUDIES }, (_, i) => ({
      name: `Study ${i + 1}`,
      description: `Test study ${i + 1}`,
      active: true,
      created_at: now,
      updated_at: now
    }))
    const [firstStudyId] = await Database.table('studies').insert(studies)
    console.log(`  Created ${NUM_STUDIES} studies`)

    // Link all studies to user 1
    const studyUsers = Array.from({ length: NUM_STUDIES }, (_, i) => ({
      user_id: 1,
      study_id: firstStudyId + i,
      is_owner: true,
      access_permission_id: 2,
      created_at: now,
      updated_at: now
    }))
    await Database.table('study_users').insert(studyUsers)

    // Create 26 variables per study (job_var_a through job_var_z)
    const allVariables = []
    for (let s = 0; s < NUM_STUDIES; s++) {
      for (let v = 0; v < NUM_VARS; v++) {
        allVariables.push({
          study_id: firstStudyId + s,
          dtype_id: 1,
          name: `job_var_${String.fromCharCode(97 + v)}`,
          created_at: now,
          updated_at: now
        })
      }
    }
    const [firstVarId] = await Database.table('variables').insert(allVariables)
    console.log(`  Created ${allVariables.length} variables`)

    // Create jobs and job_variable pivot per study
    let firstJobId = null
    for (let s = 0; s < NUM_STUDIES; s++) {
      // Insert jobs for this study
      const jobs = Array.from({ length: NUM_JOBS }, (_, j) => ({
        study_id: firstStudyId + s,
        position: j + 1,
        created_at: now,
        updated_at: now
      }))
      for (let i = 0; i < jobs.length; i += CHUNK_SIZE) {
        const [insertedId] = await Database.table('jobs').insert(
          jobs.slice(i, i + CHUNK_SIZE)
        )
        if (s === 0 && i === 0) firstJobId = insertedId
      }

      // Insert job_variable pivot records (26 per job)
      const studyFirstJobId = firstJobId + s * NUM_JOBS
      const studyFirstVarId = firstVarId + s * NUM_VARS
      const jobVars = []
      for (let j = 0; j < NUM_JOBS; j++) {
        for (let v = 0; v < NUM_VARS; v++) {
          jobVars.push({
            job_id: studyFirstJobId + j,
            variable_id: studyFirstVarId + v,
            value: String(Math.floor(Math.random() * 100)),
            created_at: now,
            updated_at: now
          })
        }
      }
      for (let i = 0; i < jobVars.length; i += CHUNK_SIZE) {
        await Database.table('job_variable').insert(
          jobVars.slice(i, i + CHUNK_SIZE)
        )
      }
      console.log(`  Study ${s + 1}: ${NUM_JOBS} jobs, ${jobVars.length} job_variable rows`)
    }
  }
}

module.exports = StudySeeder
