'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

/**
*  @swagger
*  definitions:
*    Session:
*      type: object
*      properties:
*        study_id:
*          type: integer
*          example: 42
*        participant_id:
*          type: string
*          example: pp12345
*        data:
*          type: json
*          example: {"count": 5}
*        created_at:
*          type: string
*          format: date-time
*        updated_at:
*          type: string
*          format: date-time
*      required:
*        - data
*    SessionWithRelations:
*      allOf:
*         - $ref: '#/definitions/Session'
*         - type: object
*           properties:
*             study:
*               $ref: '#/definitions/Study'
*             participant:
*               $ref: '#/definitions/Participant'
*/
class Session extends Model {
  study () {
    return this.belongsTo('App/Models/Study')
  }

  participant () {
    return this.belongsTo('App/Models/Participant')
  }
}

module.exports = Session
