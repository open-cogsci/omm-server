export default {
  search: 'Zoek participanten op naam of identifier',
  identifier: 'Identifier',
  participations: 'Deelnames',
  status: 'Status',
  meta: 'Extra info',
  name: 'Naam',
  active: 'Actief',
  inactive: 'Inactief',
  created_at: 'Aangemaakt op',
  updated_at: 'Gewijzigd op',
  no_studies: 'Geen toewijzingen aan studies',
  tooltips: {
    delete: `Een participant kan niet langer verwijderd worden wanneer deze met een studie is geassocieerd.<br>
             Deactiveer de participant in plaats hiervan.`
  },
  fields: {
    name: {
      label: 'Naam',
      errors: {
        notEmpty: 'Naam kan niet leeg zijn',
        maxLength: 'Dit veld heeft een maximumlengte van'
      }
    },
    identifier: {
      label: 'Identifier',
      errors: {
        notEmpty: 'Dit veld mag niet leeg zijn'
      }
    }
  },
  dialogs: {
    new: {
      title: 'Voeg participant toe',
      subtitle: 'Vul hieronder de informatie in'
    }
  }
}
