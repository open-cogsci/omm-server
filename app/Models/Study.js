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
*        name:
*          type: string
*        description:
*          type: string
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

  jobs () {
    return this.hasMany('App/Models/Job')
  }

  jobFields () {
    return this.hasMany('App/Models/JobField')
  }

  participations () {
    return this.hasMany('App/Models/Participation')
  }

  participants () {
    return this.manyThrough('App/Models/Participations', 'participant')
  }
}

module.exports = Study
