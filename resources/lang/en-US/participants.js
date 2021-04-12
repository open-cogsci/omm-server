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
  }
}
