export default {
  list: {
    add: 'Add new study',
    current: 'Current',
    archived: 'Archived',
    shared_by: 'Shared by',
    search: 'Search'
  },
  notifications: {
    created: 'The study has been created',
    deleted: 'Study deleted',
    archived: 'Study status changed',
    refreshing_jobs: 'Refreshing jobs',
    upload_canceled: 'Upload canceled'
  },
  panel: {
    select: 'Select a study in the left panel'
  },
  tabs: {
    jobs: 'Jobs',
    participants: 'Participants',
    information: 'Info',
    stats: 'Statistics'
  },
  actions: {
    upload_experiment: 'Experiment',
    upload_jobs: 'Jobs',
    download_result_data: 'Data',
    sharing: 'Sharing',
    archive: 'Archive',
    reactivate: 'Reactivate',
    delete: 'Delete'
  },
  jobs_table: {
    no_jobs: 'No jobs to show. Have you already uploaded a jobs file?'
  },
  dialogs: {
    confirmation: {
      archive: {
        title: 'You are about to archive this study',
        body: `<p>
          After you have archived this study, it is no longer is available for participants.
          Any reports about the study will also be removed from your dashboard.
        </p>
        <p>Are you sure you want to archive this study?</p>`
      },
      reactivate: {
        title: 'You are about to reactivate this study',
        body: `<p>
          After you have reactivated this study, it will be discoverable for participants again.
          Any reports about the study will added to your dashboard.
        </p>
        <p>Are you sure you want to reactivate this study?</p>`
      },
      delete: {
        title: 'You are about to <span class="error--text">delete</span> this study',
        body: `<p><strong>Deleting this study will also erase all its participations and associated data entries.</strong></p>
              <p>
                Are you sure you want <span class="error--text">delete</span> the experiment?
              </p>`,
        body_collaborator: `
              <p>Since you are not the owner of this study, this action will only remove you from its list of collaborators.</p>
              <p>
                Are you sure you want to break the link?
              </p>`

      }
    },
    base_upload: {
      current_file: 'File currently on server',
      uploaded_at: 'Uploaded at',
      file_to_upload: 'File to Upload',
      upload_complete: 'Upload complete',
      uploading_file: 'Uploading file',
      error_uploading: 'Error uploading file'

    },
    upload_experiment: {
      title: 'Upload experiment file',
      subtitle: `You can upload an OpenSesame osexp file using the box below. If you upload a file while one
        is already present on the server, the previous file will be overwritten.`
    },
    upload_jobs: {
      title: 'Upload jobs',
      subtitle: 'Supply your jobs in a tabular format (e.g excel or csv).'
    },
    collaborators: {
      title: 'Collaborators',
      subtitle: 'Share this experiment with other users',
      currently_shared: 'This experiment is currently shared with',
      no_collaborators: 'There are no collaborators for this experiment',
      add: 'Add colloborator',
      can_view: 'Can view',
      can_view_short: 'View',
      can_edit: 'Can edit',
      can_edit_short: 'Edit',
      search: 'Search user'
    }
  }
}
