'use strict'

const Model = use('Model')

/**
*  @swagger
*  definitions:
*    User:
*      type: object
*      properties:
*        id:
*          type: integer
*          example: 42
*        name:
*          type: string
*          example: John Doe
*          description: The user's name.
*        email:
*          type: string
*          example: john@doe.com
*          description: The user's email address (also used as username for login).
*        active:
*          type: boolean
*          description: Indicates whether a user is active (blocked) or not.
*        user_type_id:
*          type: integer
*          example: 1
*          description: The user type (i.e. access level).
*        user_type:
*          type: object
*          properties:
*             id:
*               type: integer
*             name:
*               type: string
*               enum: [administrator, standard]
*        studies_count:
*          type: integer
*          example: 5
*          description: The number of studies associated with the user.
*        created_at:
*          type: string
*          format: date-time
*        updated_at:
*          type: string
*          format: date-time
*      required:
*        - name
*        - email
*        - user_type_id
*    UserWithRelations:
*      allOf:
*        - $ref: '#/definitions/User'
*        - type: object
*          properties:
*            studies:
*              type: array
*              items:
*                 $ref: '#/definitions/StudyWithRelations'
*/
class User extends Model {
  static boot () {
    super.boot()

    /**
     * A hook to bash the user password before saving
     * it to the database.
     *
     * Look at `app/Models/Hooks/User.js` file to
     * check the hashPassword method
     */
    this.addHook('beforeSave', 'User.hashPassword')

    this.addGlobalScope(function (builder) {
      builder.with('userType')
    })
  }

  static get hidden () {
    return ['password']
  }

  get isAdmin () {
    return this.$attributes.user_type_id === 1
  }

  /**
   * A relationship on tokens is required for auth to
   * work. Since features like `refreshTokens` or
   * `rememberToken` will be saved inside the
   * tokens table.
   *
   * @method tokens
   *
   * @return {Object}
   */
  tokens () {
    return this.hasMany('App/Models/Token')
  }

  /**
   * The type of this user (i.e. standard/administrator)
   *
   * @method userType
   *
   * @return {Object}
   */
  userType () {
    return this.belongsTo('App/Models/UserType')
  }

  /**
   * A user can have many studies, but a study can also belong to more than one user
   * (i.e. a shared study)
   *
   * @method studies
   *
   * @return {Object}
   */
  studies () {
    return this
      .belongsToMany('App/Models/Study')
      .pivotModel('App/Models/StudyUser')
      .withPivot(['is_owner', 'access_permission_id'])
  }
}

module.exports = User
