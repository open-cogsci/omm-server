export default {
  subheader: 'Stuur een resetlink naar het onderstaande emailadres.',
  fields: {
    email: {
      label: 'Emailadres',
      validation: {
        empty: 'Vul uw emailadres in.',
        invalid: 'Dit emailadres is ongeldig.'
      }
    }
  },
  buttons: {
    signin: 'Inloggen',
    email: 'Verstuur email'
  },
  messages: {
    received: 'Controleer je email voor de resetlink.'
  }
}
