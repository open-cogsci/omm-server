'use strict'
const workerpool = require('workerpool')
const { ServiceProvider } = require('@adonisjs/fold')

class SheetProvider extends ServiceProvider {
  /**
   * Register namespaces to the IoC container
   *
   * @method register
   *
   * @return {void}
   */
  register () {
    this.app.singleton('Workers/Sheets', () => {
      const config = this.app.use('Config').get('workers')
      return workerpool.pool(`${__dirname}/../app/Workers/sheets.js`, config)
    })
  }

  /**
   * Attach context getter when all providers have
   * been registered
   *
   * @method boot
   *
   * @return {void}
   */
  boot () {
    //
  }
}

module.exports = SheetProvider
