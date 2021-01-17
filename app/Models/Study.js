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
   * @param {string} [engine='mysql']
   * @returns Array
   * @memberof Study
   */
  async getCollectedData (db = 'mysql2') {
    let aggVars
    if (db === 'sqlite3') {
      aggVars = Database.raw('json_group_object(variables.name, job_variable.value) as trial_vars')
    } else {
      aggVars = Database.raw('JSON_OBJECTAGG(variables.name, job_variable.value) as trial_vars')
    }

    return await Database
      .select('jobs.id as job_id', 'jobs.position', 'jobs.study_id', 'job_states.data',
        'job_statuses.name as status', 'participants.identifier as participant', 'participants.meta',
        aggVars)
      .from('jobs')
      .leftJoin('job_variable', 'jobs.id', 'job_variable.job_id')
      .leftJoin('variables', 'variables.id', 'job_variable.variable_id')
      .leftJoin('job_states', 'jobs.id', 'job_states.job_id')
      .leftJoin('participants', 'job_states.participant_id', 'participants.id')
      .leftJoin('job_statuses', 'job_states.status_id', 'job_statuses.id')
      .where('jobs.study_id', this.id)
      .whereNotNull('job_states.data')
      .groupBy('job_id')
      .groupBy('job_states.data')
      .groupBy('status')
      .groupBy('participant_id')
      .groupBy('participants.identifier')
      .groupBy('participants.meta')
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
    const query = this.participants()
    if (ptcpID) {
      query.where('participants.id', ptcpID)
    }
    query.whereHas('jobs', (q) => {
      q.whereInPivot('status_id', [1, 2])
    })

    const finished = !await query.getCount()

    // If the study is finished, update the participant's status
    if (ptcpID && updateStatus) {
      let statusID

      if (finished) {
        statusID = 3
      } else {
        statusID = 2
      }
      await this.participants()
        .pivotQuery()
        .where('participant_id', ptcpID)
        .update({ status_id: statusID })
    }
    return finished
  }

  async getParticipantQueues () {
    await Database.query(`
      select *
        from (select
            pp.id pp_id,
            studies.id study_id,
            pp.name participant,
            studies.name study,
            row_number() over (
              partition by
                pp.name
              order by
                ptcp.priority desc,
                ptcp.status_id desc,
                studies.created_at asc
              ) as ranking
          from participants as pp
          left join
            participations as ptcp on ptcp.participant_id = pp.id
          left join
            studies on studies.id = ptcp.study_id
          order by
            pp.name desc,
            ranking asc
          ) ranked
        where ranked.study_id = ?
      `)
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
