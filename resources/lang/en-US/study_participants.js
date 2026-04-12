export default {
  stats: {
    title: 'Statistics'
  },
  participants: {
    title: 'Participants',
    perc_complete: '% complete',
    manage: 'Manage',
    clear_session_data: 'Clear session data',
    none: 'No participants assigned'
  },
  dialogs: {
    manage: {
      title: 'Manage participants',
      subtitle: 'Assign participants to this study by choosing one of the following options',
      no_available_ptcps: 'No more participants available',
      assign_random: 'Or randomly assign the following number of participants',
      manually_select: 'Or manually select the participants',
      provide: 'Please provide',
      buttons: {
        assign_all: 'Assign all participants',
        assign_remaining: 'Assign remaining participants',
        assign: 'Assign'
      },
      filter: {
        label: 'Filter',
        status: 'Status',
        all: 'All',
        assigned: 'Assigned',
        not_assigned: 'Not assigned'
      }
    },
    clear_session_data: {
      title: 'Clear session data',
      subtitle: 'Select participants with session data to delete',
      confirm: 'Are you sure you want to delete the session data for the selected participants? This action cannot be undone.'
    },
    data: {
      title: 'Download data',
      subtitle: 'Choose a file format below',
      explanation: `Generating data files can take some time and therefore they are cached. You can
                    download these cached versions by pressing the _cached_ buttons below the desired file format.
                    Beware that although the cached versions can be downloaded faster, they may not be up to date.`,
      buttons: {
        cached: 'Cached'
      }
    }
  }
}
