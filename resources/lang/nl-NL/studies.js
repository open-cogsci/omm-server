export default {
  list: {
    add: 'Voeg nieuw experiment toe',
    current: 'Actueel',
    archived: 'Gearchiveerd'
  },
  notifications: {
    created: 'Het experiment is aangemaakt',
    deleted: 'Experiment verwijderd',
    archived: 'Status experiment is aangepast',
    refreshing_jobs: 'Taken opnieuw aan het laden',
    upload_canceled: 'Upload geannuleerd'
  },
  panel: {
    select: 'Kies een studie in het kader links'
  },
  tabs: {
    jobs: 'Taken',
    participants: 'Participanten'
  },
  actions: {
    upload_experiment: 'Experiment',
    upload_jobs: 'Taken',
    sharing: 'Delen',
    archive: 'Archiveren',
    reactivate: 'Reactiveren',
    delete: 'Verwijderen'
  },
  jobs_table: {
    no_jobs: 'Geen taken om te tonen. Is er al een takenbestand geüpload?'
  },
  dialogs: {
    confirmation: {
      archive: {
        title: 'Je staat op het punt dit experiment te archiveren',
        body: `<p>
          Nadat het experiment is gearchiveerd, is het niet meer beschikbaar voor participanten.
          Rapportages van het experiment worden ook niet meer getoond op he dashboard.
        </p>
        <p>Weet je zeker dat je deze studie wilt archiveren?</p>`
      },
      reactivate: {
        title: 'U staat op het punt dit experiment te reactiveren',
        body: `<p>
          Nadat het experiment is gereactiveerd, zal het direct beschikbaar zijn voor participanten.
          Rapportages van het experiment worden getoond op het dashboard.
        </p>
        <p>Weet u zeker dat u deze studie wilt reactiveren?</p>`
      },
      delete: {
        title: 'Je staat op het punt dit experiment te <span class="error--text">verwijderen</span>',
        body: `<p><strong>Als je dit experiment verwijdert, worden ook alle resultaten gewist.</strong></p>
              <p>
                Weet je zeker dat je dit experiment wilt verwijderen?
              </p>`,
        body_collaborator: `
              <p>Je bent niet de eigenaar van deze studie, dus je zal alleen worden verwijderd van de
              lijst van personen met wie deze studie is gedeeld.</p>
              <p>
                Weet je zeker dat je deze verbinding wilt verbreken?
              </p>`
      }
    },
    base_upload: {
      current_file: 'Huidig bestand',
      uploaded_at: 'Geüpload op',
      file_to_upload: 'Te uploaden bestand',
      upload_complete: 'Upload gereed',
      uploading_file: 'Bestand aan het uploaden',
      error_uploading: 'Fout tijdens uploaden'
    },
    upload_experiment: {
      title: 'Upload experiment',
      subtitle: `Je kunt een OpenSesame .osexp bestand uploaden via het veld hieronder. Als er al een
                 bestand aanwezig is, dan wordt deze door het nieuwe bestand overschreven.`
    },
    upload_jobs: {
      title: 'Upload taken',
      subtitle: 'Lever het bestand in tabelformaat aan (bijv. excel or csv).'
    },
    collaborators: {
      title: 'Bijdragers',
      subtitle: 'Deel dit experiment met anderen',
      currently_shared: 'Op het moment is deed experiment gedeeld met',
      no_collaborators: 'Er zijn geen bijdragers aan het experiment',
      add: 'Voeg bijdrager toe',
      can_view: 'Bekijken',
      can_view_short: 'Bekijken',
      can_edit: 'Wijzigen',
      can_edit_short: 'Wijzigen',
      search: 'Zoek gebruiker'
    }
  }
}
