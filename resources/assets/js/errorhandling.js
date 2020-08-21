import { isArray, isFunction } from 'lodash'

/**
 * Process errors returned by axios
 *
 * @param {object} e An object describing the error. Can be one returned by axios or a common
 * Javascript error object
 * @param {function} notify Optional notification function to call upon errors. The function should
 * expect and object with a message field (str) describing ther error message and a color field (str)
 * indicating the color of the notification to be shown
 * @returns {Object} the fields that errorred with their corresponding validation message
 */
export function processErrors (e, notify = null, print = false) {
  const errors = {}
  if (isArray(e?.response?.data)) {
    const validationErrors = e.response.data

    for (const err of validationErrors) {
      errors[err.field] = err.message
    }
    if (isFunction(notify)) {
      notify({
        message: 'There were some problems with your input. Please review the form.',
        color: 'error'
      })
    }
  } else if (isFunction(notify)) {
    notify({
      message: e?.response?.data?.error?.message || e?.response?.data?.message || e?.response?.data || e,
      color: 'error'
    })
  }
  if (print) {
    console.error(e)
  }
  return errors
}
