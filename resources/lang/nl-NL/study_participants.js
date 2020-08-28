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
      explanation: `Het exporteren van de data kan tijdsintensief zijn en daarom worden gegenereerde
                    bestanden in de cache opgeslagen. The volgende keer dat hetzelfde bestand wordt gedownload wordt
                    de gecachte versie geserveerd om downloads sneller te laten verlopen.<br>Klik op
                    <strong>Regenereer</strong> om de gecachte versie te verversen als deze niet langer
                    actueel is (bijv. omdat er extra data is verzameld)`,
      buttons: {
        regenerate: 'Regenereer'
      }
    }
  }
}
