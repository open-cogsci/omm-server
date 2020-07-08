'use strict'

const Model = use('Model')

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
  }

  static get hidden () {
    return ['password']
  }

  static get computed () {
    return ['admin']
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
      .withPivot(['is_owner'])
  }

  getAdmin () {
    return this.user_type_id === 1
  }
}

module.exports = User
