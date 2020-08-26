export default {
  signin: 'Log alstublieft in',
  fields: {
    email: {
      label: 'E-mailadres',
      validation: {
        empty: 'Vul uw emailadres in.',
        invalid: 'Dit emailadres is ongeldig.'
      }
    },
    password: {
      label: 'Wachtwoord',
      validation: {
        empty: 'Vul een wachtwoord in.'
      }
    }
  },
  buttons: {
    recover: 'Herstel wachtwoord',
    signin: 'Inloggen'
  }
}
