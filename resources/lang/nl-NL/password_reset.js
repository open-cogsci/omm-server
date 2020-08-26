export default {
  subheader: 'Hallo! Stel je wachtwoord in:',
  fields: {
    old_password: {
      label: 'Je oude wachtwoord',
      validation: {
        empty: 'Voer je huidige wachtwoord in.'
      }
    },
    password: {
      label: 'Je nieuwe wachtwoord',
      validation: {
        empty: 'Voer je nieuwe wachtwoord in.'
      }
    },
    password_confirmation: {
      label: 'Herhaal je nieuwe wachtwoord',
      validation: {
        empty: 'Bevestig je wachtwoord',
        mismatch: 'Wachtwoorden komen niet overeen'
      }
    }
  },
  buttons: {
    change: 'Wijzig wachtwoord'
  }
}
