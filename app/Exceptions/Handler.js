'use strict'

const BaseExceptionHandler = use('BaseExceptionHandler')

/**
 * This class handles all exceptions thrown during
 * the HTTP request lifecycle.
 *
 * @class ExceptionHandler
 */
class ExceptionHandler extends BaseExceptionHandler {
  /**
   * Handle exception thrown during the HTTP lifecycle
   *
   * @method handle
   *
   * @param  {Object} error
   * @param  {Object} options.request
   * @param  {Object} options.response
   *
   * @return {void}
   */
  handle (error, { request, response }) {
    // response.status(error.status).send(error.message)
    if (error.code === 'E_JWT_TOKEN_EXPIRED') {
      error.message = 'Session expired — please reload the page.'
    }
    return super.handle(error, { request, response })
  }

  /**
   * Report exception for logging or debugging.
   *
   * @method report
   *
   * @param  {Object} error
   * @param  {Object} options.request
   *
   * @return {void}
   */
  report (error, { request }) {
    // eslint-disable-next-line no-console
    console.error(error)
  }
}

module.exports = ExceptionHandler
