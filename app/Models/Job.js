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
*          example: 24
*        study_id:
*          type: integer
*          example: 42
*        position:
*          type: integer
*          example: 1
*        created_at:
*          type: string
*          format: date-time
*        updated_at:
*          type: string
*          format: date-time
*      required:
*        - id
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
*                 $ref: '#/definitions/VariableWithRelations'
*    JobWithRelationsAndPivot:
*      allOf:
*         - $ref: '#/definitions/JobWithRelations'
*         - type: object
*           properties:
*             pivot:
*               type: object
*               properties:
*                 job_id:
*                   type: integer
*                   example: 24
*                 participant_id:
*                   type: integer
*                   example: 3
*                 data:
*                   type: string
*                   example: {"rt": 200, "correct": false}
*                 status_id:
*                   type: integer
*                   example: 3
*                 status:
*                   type: object
*                   properties:
*                     id:
*                       type: integer
*                       example: 3
*                     name:
*                       type: string
*                       example: finished
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
      .withPivot(['data', 'status_id'])
  }
}

module.exports = Job
