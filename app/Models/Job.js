'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
/**
*  @swagger
*  definitions:
*    Job:
*      type: object
*      properties:
*        id:
*          type: integer
*        study_id:
*          type: integer
*        order:
*          type: integer
*        created_at:
*          type: string
*          format: date-time
*        updated_at:
*          type: string
*          format: date-time
*      required:
*        - study_id
*        - order
*    JobWithRelations:
*      allOf:
*         - $ref: '#/definitions/Job'
*         - type: object
*           properties:
*             study:
*               $ref: '#/definitions/Study'
*             variables:
*               type: array
*               items:
*                 $ref: '#/definitions/Variable'
*/

class Job extends Model {
  study () {
    return this.belongsTo('App/Models/Study')
  }

  variables () {
    return this
      .belongsToMany('App/Models/Variable')
      .withPivot(['value'])
      .withTimestamps()
  }

  participants () {
    return this
      .belongsToMany('App/Models/Participant')
      .pivotModel('App/Models/JobState')
  }
}

module.exports = Job
