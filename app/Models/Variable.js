'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
/**
*  @swagger
*  definitions:
*    Variable:
*      type: object
*      properties:
*        id:
*          type: integer
*          example: 38
*        study_id:
*          type: integer
*          example: 42
*        dtype_id:
*          type: integer
*          example: 1
*        name:
*          type: string
*        created_at:
*          type: string
*          format: date-time
*        updated_at:
*          type: string
*          format: date-time
*      required:
*        - id
*        - study_id
*        - dtype_id
*        - name
*        - value
*    VariableWithRelations:
*      allOf:
*         - $ref: '#/definitions/Variable'
*         - type: object
*           properties:
*             dtype:
*               $ref: '#/definitions/Dtype'
*             pivot:
*               type: object
*               properties:
*                 value:
*                   type: string
*                 job_id:
*                   type: integer
*                   example: 24
*                 variable_id:
*                   type: integer
*                   example: 38
*/
class Variable extends Model {
  study () {
    return this.belongsTo('App/Models/Study')
  }

  dtype () {
    return this.belongsTo('App/Models/Dtype')
  }

  jobs () {
    return this
      .belongsToMany('App/Models/Job')
      .withPivot(['value'])
      .withTimestamps()
  }
}

module.exports = Variable
