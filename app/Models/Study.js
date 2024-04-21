'use strict'
/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */

const fs = require('fs').promises
const { isArray } = require('lodash')
const { formatISO9075 } = require('date-fns')
const { isNumber } = require('lodash')

const Model = use('Model')
const Database = use('Database')
const Helpers = use('Helpers')

/**
*  @swagger
*  definitions:
*    Study:
*      type: object
*      properties:
*        id:
*          type: integer
*          example: 42
*        name:
*          type: string
*          example: Awesome task
*        description:
*          type: string
*          example: This task is awesome
*        information:
*          type: string
*          example: Some extra info about this study
*        active:
*          type: boolean
*        created_at:
*          type: string
*          format: date-time
*        updated_at:
*          type: string
*          format: date-time
*      required:
*        - name
*    StudyWithRelations:
*      allOf:
*         - $ref: '#/definitions/Study'
*         - type: object
*           properties:
*             jobs:
*               type: array
*               description: The jobs belonging to this study
*               items:
*                 $ref: '#/definitions/JobWithRelations'
*             participants:
*               type: array
*               description: Participants assigned to this study
*               items:
*                 $ref: '#/definitions/Participant'
*             variables:
*               type: array
*               description: The variables belonging to this study
*               items:
*                 $ref: '#/definitions/VariableWithRelations'
*             users:
*               type: array
*               description: The users associated with this study
*               items:
*                 $ref: '#/definitions/User'
*             files:
*               type: array
*               description: The experiment and job files for this study
*               items:
*                 $ref: '#/definitions/StudyFile'
*/
class Study extends Model {
  static boot () {
    super.boot()

    this.addHook('beforeDelete', async (study) => {
      try {
        // Remove the folder containing the study files
        await fs.rmdir(Helpers.publicPath(`files/${study.id}`), { recursive: true })
        return true
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
        return false
      }
    })
  }

  /**
   * The study's owners
   *
   * @method users
   *
   * @return {Object}
   */
  users () {
    return this
      .belongsToMany('App/Models/User')
      .pivotModel('App/Models/StudyUser')
      .withPivot(['is_owner', 'access_permission_id'])
  }

  /**
   * The jobs belonging to this study
   *
   * @method jobs
   *
   * @returns {Object}
   * @memberof Study
   */
  jobs () {
    return this.hasMany('App/Models/Job')
  }

  /**
   * The column headers of the job table (i.e. variable names per job)
   *
   * @method jobFields
   *
   * @returns {Object}
   * @memberof Study
   */
  variables () {
    return this.hasMany('App/Models/Variable')
  }

  /**
   * Participants of this study
   *
   * @method participants
   *
   * @returns {Object}
   * @memberof Study
   */
  participants () {
    return this
      .belongsToMany('App/Models/Participant')
      .pivotModel('App/Models/Participation')
      .withPivot(['status_id', 'priority', 'created_at', 'updated_at'])
  }

  /**
   * Files belonging to this study
   *
   * @method files
   *
   * @returns {Object}
   * @memberof Study
   */
  files () {
    return this.hasMany('App/Models/StudyFile')
  }

  /**
   * Session data
   *
   * @method sessions
   *
   * @returns {Object}
   * @memberof Study
   */
  sessions () {
    return this.hasMany('App/Models/Session')
  }

  /**
   * Study data
   * @method studyData
   * @returns {Object}
   * @memberof Study
   * */
  data () {
    return this.hasMany('App/Models/StudyData')
  }

  /**
   * Checks if the passed user has sufficient privileges to edit this study
   *
   * @param {User} user
   * @returns {Boolean}
   * @memberof Study
   */
  async isEditableBy (user) {
    return !!await this.users()
      .where('id', user.id)
      .where(function () {
        this
          .where('study_users.is_owner', true) // Either the user is the owner of the study
          .orWhere('study_users.access_permission_id', 2) // Or has write permissions
      })
      .getCount()
  }

  /**
   * Checks if the passed user is the owner of the study
   *
   * @param {User} user
   * @returns {Boolean}
   * @memberof Study
   */
  async isOwnedBy (user) {
    return !!await this.users()
      .where('id', user.id)
      .where('study_users.is_owner', true) // Either the user is the owner of the study
      .getCount()
  }

  /**
   * Walks through the list of jobs specified as a collection of key:value pairs in an object
   * and transform them so that they can easily be stored in the
   * database. Additionally check if the supplied variable name exists for this study.
   *
   * @param {Array} jobsData The jobs to transform
   * @param {Database} trx The jobs to transform
   * @returns {Array}
   * @memberof Study
   */
  async saveJobsFromInput (jobsData, trx) {
    // Obtain the list of variables that are used for this study.
    const variables = await this.variables().pair('name', 'id')

    const jobs = await Promise.all(jobsData.map(async (jobData) => {
      if (trx) {
        return await this._trxSaveJobsFromInput(jobData, variables, trx)
      } else {
        return await this._noTrxSaveJobsFromInput(jobData, variables)
      }
    }))
    return jobs
  }

  /**
   * Process a json representation of a jobs file (csv/xls(x))
   *
   * @param {Object} jsonData
   * @memberof Study
   */
  async processJobs (jsonData) {
    const variables = Object.keys(jsonData[0]).map(varName => ({
      name: varName,
      dtype_id: 1
    }))

    // Delete old jobs data
    await this.jobs().delete()
    await this.variables().delete()

    // Create the variables in the database
    const variableRecords = await this.variables().createMany(variables)
    // Compose an object in which the key is the varname and value is its ID
    const varTable = variableRecords.reduce((result, current) => {
      result[current.id] = current.name
      return result
    }, {})

    for (const [i, row] of Object.entries(jsonData)) {
      const job = await this.jobs().create({
        position: parseInt(i) + 1
      })

      await job.variables().attach(Object.keys(varTable), (record) => {
        record.value = row[varTable[record.variable_id]]
      })
    }
  }

  /**
   * Attaches all participants of a study to the study's jobs
   *
   * @memberof Study
   */
  async attachParticipantsToJobs () {
    let ptcpIDs, jobIDs
    const loadedPtcps = this.getRelated('participants')
    const loadedJobs = this.getRelated('jobs')

    if (isArray(loadedPtcps?.rows)) {
      ptcpIDs = loadedPtcps.rows.map(ptcp => ptcp.id)
    } else {
      ptcpIDs = await this.participants().ids()
    }

    if (isArray(loadedJobs?.rows)) {
      jobIDs = loadedJobs.rows.map(ptcp => ptcp.id)
    } else {
      jobIDs = await this.jobs().ids()
    }
    // If there are no participants or jobs for the study, there is nothing left to do
    if (ptcpIDs.length === 0 || jobIDs.length === 0) {
      return
    }

    const records = []
    // eslint-disable-next-line camelcase
    for (const job_id of jobIDs) {
      // eslint-disable-next-line camelcase
      for (const participant_id of ptcpIDs) {
        records.push({
          job_id,
          participant_id,
          created_at: formatISO9075(Date.now()),
          updated_at: formatISO9075(Date.now())
        })
      }
    }
    await Database.table('job_states').insert(records)
  }

  /**
   * Exports the collected data of the study as json.
   *
   * @param {string} [db='mysql']
   * @returns Array
   * @memberof Study
   */
  async getCollectedData () {
    return await Database
      .select('study.name as name', 'participants.identifier as participant', 'participants.meta as meta', 'data')
      .from('study_data')
      .leftJoin('participants', 'study_data.participant_id', 'participants.id')
      .leftJoin('studies', 'study_data.study_id', 'studies.id')
  }

  async storeJobData (data, jobId, ptcpId) {
    const job = await this.jobs().with('variables').find(jobId)

    if (!job) {
      throw new Error('Job not found')
    }

    // Get the variables for the job and convert them to key:value pairs so that the variable name is the
    // key and the value is its value
    const vars = job.getRelated('variables')
    let varData = []
    if (vars && vars.length) {
      varData = vars.map(v => ({
        [v.name]: [v.pivot?.value]
      }))
    }

    return await this.data().create({
      participant_id: ptcpId,
      data: JSON.stringify({
        ...varData,
        ...data,
        job_id: job.id,
        job_position: job.position
      })
    })
  }

  /**
   * Checks if a study is finished. If ptcpID is supplied, it will check if that
   * particular participant has done all jobs for the study. If this parameter is ommitted
   * it will check if there are open jobs for any participant.
   *
   * @param {Number} [ptcpID=null]
   * @param {boolean} [updateStatus=true]
   * @return {Boolean} Whether the study is finished or not
   * @memberof Study
   */
  async checkIfFinished (ptcpID = null, updateStatus = true) {
    if (ptcpID && !isNumber(ptcpID)) {
      throw new Error('Participant ID should be null or number')
    }

    // Count the number of open jobs
    const query = Study.query()
      .select('job_states.status_id', 'job_states.participant_id')
      .leftJoin('jobs', 'studies.id', 'jobs.study_id')
      .leftJoin('job_states', 'jobs.id', 'job_states.job_id')
      .where('studies.id', this.id)
      .whereIn('job_states.status_id', [1, 2])

    if (ptcpID) {
      query.where('job_states.participant_id', ptcpID)
    }
    // If the number of open jobs is 0, the study is finished
    const finished = !await query.getCount()

    // If the study is finished, update the participant's status
    if (ptcpID && updateStatus) {
      let statusID

      if (finished) {
        statusID = 3 // Finished
      } else {
        statusID = 2 // In progress
      }

      await this.participants()
        .pivotQuery()
        .where('participant_id', ptcpID)
        .whereNot('status_id', statusID)
        .update({ status_id: statusID })
    }
    return finished
  }

  /**
   * Gets the participant queue positions for the current study
   *
   * @param {*} [ptcpID=null]
   * @return {*}
   * @memberof Study
   */
  async getParticipantQueuePositions (ptcpID = null) {
    let query = `
      select ranked.participant_id, ranked.queue_position
        from (select
            pp.id participant_id,
            studies.id study_id,
            row_number() over (
              partition by
                pp.id
              order by
                ptcp.priority asc,
                ptcp.status_id desc,
                studies.created_at asc
              ) as queue_position
          from participants as pp
          left join
            participations as ptcp on ptcp.participant_id = pp.id
          left join
            studies on studies.id = ptcp.study_id
          order by
            participant_id asc,
            queue_position asc
          ) ranked
        where ranked.study_id = ?`

    const args = [this.id]
    if (ptcpID !== null) {
      const id = parseFloat(ptcpID)
      if (!isNaN(id)) {
        args.push(id)
        query += ' and ranked.participant_id = ?'
      }
    }
    const results = await Database.raw(query, args)
    return results.length ? results[0] : results
  }

  /**
   * Reset the participation status of each assigned participant to 'pending'
   *
   * @memberof Study
   */
  async resetParticipationStatuses () {
    await this.participants()
      .pivotQuery()
      .update({ status_id: 1 })
  }

  /* Private functions */

  /**
   * Save Jobs using transaction (for DB other than )
   *
   * @param {*} jobData
   * @param {*} variables
   * @param {*} trx
   * @returns
   * @memberof Study
   */
  async _trxSaveJobsFromInput (jobData, variables, trx) {
    const varsList = Object.keys(variables)
    // Create the job
    const job = await this.jobs().create({}, trx)

    for (const [varName, varValue] of Object.entries(jobData)) {
      // Check if all variables exists for this study
      if (!varsList.includes(varName)) {
        throw new ReferenceError(`Variable '${varName}' does not exist for this study.`)
      }
      await job.variables().attach(variables[varName], (row) => { row.value = varValue }, trx)
    }
    return job
  }

  async _noTrxSaveJobsFromInput (jobData, variables) {
    const varsList = Object.keys(variables)

    for (const varName of Object.keys(jobData)) {
      // Check if all variables exists for this study
      if (!varsList.includes(varName)) {
        throw new ReferenceError(`Variable '${varName}' does not exist for this study.`)
      }
    }
    // Create the job
    const job = await this.jobs().create({})

    for (const [varName, varValue] of Object.entries(jobData)) {
      await job.variables().attach(variables[varName], (row) => { row.value = varValue })
    }
    return job
  }
}

module.exports = Study
