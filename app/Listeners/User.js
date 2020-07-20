'use strict'

const Mail = use('Mail')

const User = exports = module.exports = {}

User.registered = async ({ user, token }) => {
  await Mail.send('emails.newuser', { user, token }, (message) => {
    message.to(user.email)
    message.from('noreply@omm.com')
    message.subject('Your account at OMM')
  })
}
