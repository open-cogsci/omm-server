'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const Job = use('App/Models/Job')

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
*        osexp_path:
*          type: string
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
*               items:
*                 $ref: '#/definitions/JobWithRelations'
*/
class Study extends Model {
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
  }

  /**
   * Walks through the list of jobs specified as a collection of key:value pairs in an object
   * and transform them so that they can easily be stored in the
   * database. Additionally check if the supplied variable name exists for this study.
   *
   * @param {Array} jobsData The jobs to transform
   * @returns {Array}
   * @memberof Job
   */
  async saveJobsFromInput (jobsData) {
    // Obtain the list of variables that are used for this study.
    const variables = await this.variables().pair('name', 'id')
    const varsList = Object.keys(variables)

    // TODO: this procedure can undoubtedly be optimized by using a database transaction. This allows us
    // to create the job at the start of the map() function, and enable us to implement everything
    // in a single loop, instead of two.
    const jobs = await Promise.all(jobsData.map(async (jobData) => {
      // Check if all variables exists for this study
      for (const varName of Object.keys(jobData)) {
        if (!varsList.includes(varName)) {
          throw new Error(`Variable '${varName}' does not exist for this study.`)
        }
      }
      // Create the job
      const job = await this.jobs().create({})
      // Attach the job to the variables using the specified values
      for (const [varName, varValue] of Object.entries(jobData)) {
        await job.variables().attach(variables[varName], (row) => { row.value = varValue })
      }
      return job
    }))
    return jobs
  }
}

module.exports = Study
