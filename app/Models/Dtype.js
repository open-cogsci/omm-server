'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
/**
*  @swagger
*  definitions:
*    Dtype:
*      type: object
*      properties:
*        id:
*          type: integer
*          example: 1
*        name:
*          type: string
*          example: variable
*/
class Dtype extends Model {
  variables () {
    return this.hasMany('App/Models/Variable')
  }
}

module.exports = Dtype
