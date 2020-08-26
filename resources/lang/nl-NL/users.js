export default {
  search: 'Zoek gebruikers op naam of emailadres',
  no_studies: 'Geen studies gevonden',
  types: {
    standard: 'standaard',
    administrator: 'administrator'
  },
  status: {
    pending: 'wacht op activatie',
    active: 'geactiveerd',
    inactive: 'gedeactiveerd'
  },
  messages: {
    saved: 'Gebruiker opgeslagen',
    deleted: 'Gebruiker verwijderd',
    activation_resent: 'Activatie email opnieuw verstuurd',
    account_info_resent: 'Account info opnieuw verstuurd'
  },
  labels: {
    name: 'Naam',
    email: 'Email',
    user_type: 'Type gebruiker',
    account_status: 'Status',
    created_at: 'Aangemaakt op',
    updated_at: 'Geüpdate op',
    last_login: 'Laatst gezien'
  },
  fields: {
    name: {
      label: 'Naam',
      errors: {
        notEmpty: 'Naam mag niet leeg zijn',
        maxLength: 'Dit veld heeft een maximumlengte van'
      }
    },
    email: {
      label: 'Emailadres',
      errors: {
        notEmpty: 'Email mag niet leeg zijn',
        invalid: 'Ongeldig emailadres'
      }
    },
    user_type: {
      label: 'Type gebruiker'
    }
  },
  buttons: {
    resend_activation_email: 'Stuur activatiemail opnieuw',
    resend_verification_email: 'Stuur verificatiemail opnieuw'
  },
  dialogs: {
    new: {
      title: 'Voeg nieuw gebruiker toe',
      subtitle: 'Vul de volgende velden in:'
    }
  },
  prevent_delete: `Een gebruiker kan niet meer gewist worden wanneer deze met een studie geassocieerd is.<br>
                   Deactiveer de gebruiker in plaats daarvan.`
}
