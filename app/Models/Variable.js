'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
/**
*  @swagger
*  definitions:
*    Variable:
*      type: object
*      properties:
*        study_id:
*          type: integer
*        dtype_id:
*          type: integer
*        name:
*          type: string
*        value:
*          type: string
*        created_at:
*          type: string
*          format: date-time
*        updated_at:
*          type: string
*          format: date-time
*      required:
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
*             study:
*               $ref: '#/definitions/StudyWithRelations'
*
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
