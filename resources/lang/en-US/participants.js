export default {
  search: 'Search participants by name or identifier',
  identifier: 'Identifier',
  alternate_identifier: 'Alt. identifier',
  participations: 'Participations',
  meta: 'Extra info',
  status: 'Status',
  name: 'Name',
  active: 'Active',
  inactive: 'Inactive',
  created_at: 'Created at',
  updated_at: 'Updated at',
  no_studies: 'Not assigned to any study',
  tooltips: {
    delete: `A participant can no longer be deleted when it is associated with a study.<br>
             Deactivate the participant instead.`
  },
  fields: {
    name: {
      label: 'Name',
      errors: {
        notEmpty: 'Name cannot be empty',
        maxLength: 'This field has a maximum length of '
      }
    },
    identifier: {
      label: 'Identifier',
      errors: {
        notEmpty: 'identifier cannot be empty',
        sameAsAlt: 'Must be different from alternate identifier'
      }
    },
    alternate_identifier: {
      label: 'Alternate identifier',
      errors: {
        notEmpty: 'identifier cannot be empty',
        sameAsPrimary: 'Must be different from identifier'
      }
    }
  },
  dialogs: {
    new: {
      title: 'Add a new Participant',
      subtitle: 'Please enter the information below'
    }
  },
  priority: {
    queued: 'Queued at position',
    first: 'First to run'
  },
  jobs: {
    reset: {
      title: 'Reset Jobs to Pending',
      description: 'Reset finished jobs to pending for participant {participant}.',
      button: 'Reset to Pending',
      no_finished: 'No finished jobs found for this participant.',
      select_all: 'Select All',
      success: '{count} job(s) reset to pending',
      tooltip: 'Reset finished jobs to pending',
      confirm_message: 'Are you sure you want to reset {count} job(s) to pending?',
      warning: 'This will allow the participant to redo these jobs.',
      confirm_button: 'Yes, Reset Jobs'
    }
  }
}
