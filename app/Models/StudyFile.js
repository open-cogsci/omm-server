'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

/**
*  @swagger
*  definitions:
*    StudyFile:
*      type: object
*      properties:
*        id:
*          type: integer
*          example: 42
*        filename:
*          type: string
*          description: The filename the file was uploaded with.
*          example: attentional-capture.osexp
*        path:
*          type: string
*          description: The path to obtain the file from the server using a GET request
*          example: /files/asdjk232ka
*        created_at:
*          type: string
*          format: date-time
*        updated_at:
*          type: string
*          format: date-time
*      required:
*        - filename
*/

class StudyFile extends Model {
  static get table () {
    return 'files'
  }

  /**
   * The study to which the file belongs
   *
   * @method study
   *
   * @returns {Object}
   * @memberof File
   */
  study () {
    return this.belongsTo('App/Models/Study')
  }
}

module.exports = StudyFile
