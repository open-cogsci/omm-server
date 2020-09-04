import { processErrors } from './errorhandling'

describe('Error handling', () => {
  test('Errors should be correctly processed', () => {
    const notify = jest.fn()
    expect(notify).not.toHaveBeenCalled()
    const err = new Error('Something')
    const errors = processErrors(err, notify)
    expect(notify).toHaveBeenCalledWith({ message: err, color: 'error' })
    expect(errors).toEqual({})
  })

  test('Json errors should be correctly processed', () => {
    const notify = jest.fn()
    expect(notify).not.toHaveBeenCalled()
    const message = 'I am an error'
    const err = { response: { data: { error: { message } } } }
    const errors = processErrors(err, notify)
    expect(notify).toHaveBeenCalledWith({ message, color: 'error' })
    expect(errors).toEqual({})
  })

  test('Http errors should be correctly processed', () => {
    const notify = jest.fn()
    expect(notify).not.toHaveBeenCalled()
    const message = 'I am an error'
    const err = { response: { data: message } }
    const errors = processErrors(err, notify)
    expect(notify).toHaveBeenCalledWith({ message, color: 'error' })
    expect(errors).toEqual({})
  })

  test('Validation errors should be correctly processed', () => {
    const notify = jest.fn()
    expect(notify).not.toHaveBeenCalled()
    const err = {
      response: {
        data: [
          { field: 'name', message: 'Required' },
          { field: 'email', message: 'Invalid email' }
        ]
      }
    }
    const errors = processErrors(err, notify)
    expect(notify).toHaveBeenCalled()
    expect(errors).toEqual({ name: 'Required', email: 'Invalid email' })
  })

  test('Should work without notify function', () => {
    let err = {
      response: {
        data: [
          { field: 'name', message: 'Required' },
          { field: 'email', message: 'Invalid email' }
        ]
      }
    }
    let errors = processErrors(err)
    expect(errors).toEqual({ name: 'Required', email: 'Invalid email' })

    err = new Error('Something')
    errors = processErrors(err)
    expect(errors).toEqual({})
  })
})
