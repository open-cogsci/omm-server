'use strict'

/*
|--------------------------------------------------------------------------
| UserSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

const Factory = use('Factory')
const Study = use('App/Models/Study')
const User = use('App/Models/User')

async function createCaptureJobs (study) {
  const distractorVariable = await study.variables().create({
    name: 'distractor',
    dtype_id: 1
  })

  for (const [key, value] of Object.entries([
    'present', 'absent'
  ])) {
    const job = await study.jobs().create({
      position: parseInt(key) + 1
    })

    await job.variables().attach([distractorVariable.id], (row) => {
      row.value = value
    })
  }
}

class StudySeeder {
  async run () {
    // Don't seed any studies if there already are some.
    if (await Study.getCount() > 0) { return }

    const daniel = await User.findOrFail(1)
    const sebastiaan = await User.findOrFail(2)

    const captureStudy = await daniel.studies().create({
      name: 'Attentional Capture',
      description: 'Basic attentional capture experiment'
    }, (row) => {
      row.is_owner = true
    })

    captureStudy.files().create({
      path: '/files/1/experiment.osexp',
      filename: 'attentional-capture.osexp',
      type: 'experiment'
    })

    await createCaptureJobs(captureStudy)


    let studies = await Factory.model('App/Models/Study').makeMany(4)
    await daniel.studies().saveMany(studies)
    await daniel.studies().pivotQuery().update({
      is_owner: true,
      access_permission_id: 2
    })

    studies = await Factory.model('App/Models/Study').makeMany(4)
    await sebastiaan.studies().saveMany(studies)
    await sebastiaan.studies().pivotQuery().update({
      is_owner: true,
      access_permission_id: 2
    })

    // Make Sebastiaan co-owner of the study
    await sebastiaan.studies().attach([captureStudy.id], (row) => {
      row.access_permission_id = 2
      row.is_owner = false
    })
  }
}

module.exports = StudySeeder
