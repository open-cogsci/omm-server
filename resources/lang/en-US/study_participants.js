export default {
  stats: {
    title: 'Statistics'
  },
  participants: {
    title: 'Participants',
    perc_complete: '% complete',
    data: 'Data',
    manage: 'Manage'
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
    data: {
      title: 'Download data',
      subtitle: 'Choose a file format below',
      explanation: `Exporting data can take some time and therefore generated data files are cached. The next time
                    the same data file is downloaded, the cached version is served to allow faster download speeds.<br>Click
                    on <strong>regenerate</strong> to refresh the cached data if it is no longer up-to-date
                    (e.g. after new data has been collected).`,
      buttons: {
        regenerate: 'Regenerate'
      }
    }
  }
}
