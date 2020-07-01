'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
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
      .withPivot(['is_owner'])
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
}

module.exports = Study
