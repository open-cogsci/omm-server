export default {
  stats: {
    title: 'Statistieken'
  },
  participants: {
    title: 'Participanten',
    perc_complete: '% compleet',
    data: 'Data',
    manage: 'Beheren',
    none: 'Geen participanten toegewezen'
  },
  dialogs: {
    manage: {
      title: 'Beheer participanten',
      subtitle: 'Wijs participanten toe aan deze studie door een van de volgende opties',
      no_available_ptcps: 'Geen andere participanten beschikbaar',
      assign_random: 'Of wijs willekeurid dit aantal participanten toe',
      manually_select: 'Of selecteer de participanten handmatig',
      provide: 'Vul in aub',
      buttons: {
        assign_all: 'Wijs alle participanten toe',
        assign_remaining: 'Wijs overgebleven participanten toe',
        assign: 'Wijs toe'
      },
      filter: {
        label: 'Filter',
        status: 'Status',
        all: 'Alles',
        assigned: 'Toegewezen',
        not_assigned: 'Niet toegewezen'
      }
    },
    data: {
      title: 'Download data',
      subtitle: 'Kies een bestandsformaat',
      explanation: `Het genereren van de databestanden kan tijd kosten, en daarom worden deze
                    gecached. Je kunt de gecachede versies downloadend door de _gecached_ knop te
                    klikken onder het gewenste bestandsformaat. Let op dat gecachede versies
                    sneller downloaden, maar mogelijk niet altijd up-to-date zijn.`,
      buttons: {
        cached: 'gecached'
      }
    }
  }
}
