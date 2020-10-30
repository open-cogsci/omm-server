/* eslint-disable no-console */
'use strict'

const Mail = use('Mail')
const Persona = use('Persona')
const Env = use('Env')
const querystring = require('querystring')

const User = exports = module.exports = {}
const sender = `${Env.get('MAIL_SENDER_NAME')} <${Env.get('MAIL_SENDER_EMAIL')}>`

User.created = async ({ user, token }) => {
  const pwtoken = await Persona.generateToken(user, 'password')
  const tokenString = querystring.encode({ token: pwtoken, etoken: token })
  const baseURL = Env.get('BASE_URL')

  try {
    const mailer = await Mail.send('emails.newuser', { baseURL, user, tokenString }, (message) => {
      message.to(user.email)
      message.from(sender)
      message.subject('Your account at OMM')
    })
    if (Env.get('MAIL_CONNECTION') === 'ethereal') {
      console.log(mailer)
    }
  } catch (e) {
    console.error('Failed to send registration email', e)
  }
}

User.emailChanged = async ({ user, token }) => {
  const tokenString = querystring.encode({ token })
  const baseURL = Env.get('BASE_URL')

  try {
    const mailer = await Mail.send('emails.emailchanged', { baseURL, user, tokenString }, (message) => {
      message.to(user.email)
      message.from(sender)
      message.subject('Please verify your e-mail address at OMM')
    })
    if (Env.get('MAIL_CONNECTION') === 'ethereal') {
      console.log(mailer)
    }
  } catch (e) {
    console.error('Failed to send email verification email', e)
  }
}

User.passwordChanged = async ({ user }) => {
  try {
    const mailer = await Mail.send('emails.passwordchanged', { user }, (message) => {
      message.to(user.email)
      message.from(sender)
      message.subject('Your OMM password was changed')
    })
    if (Env.get('MAIL_CONNECTION') === 'ethereal') {
      console.log(mailer)
    }
  } catch (e) {
    console.error('Failed to send password changed email', e)
  }
}

User.forgotPassword = async ({ user, token }) => {
  const tokenString = querystring.encode({ token })
  const baseURL = Env.get('BASE_URL')

  try {
    const mailer = await Mail.send('emails.resetPassword', { baseURL, user, tokenString }, (message) => {
      message.to(user.email)
      message.from(sender)
      message.subject('Reset your password')
    })
    if (Env.get('MAIL_CONNECTION') === 'ethereal') {
      console.log(mailer)
    }
  } catch (e) {
    console.error('Failed to send password reset email', e)
  }
}
