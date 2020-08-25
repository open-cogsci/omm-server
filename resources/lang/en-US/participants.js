export default {
  search: 'Search participants by name or identifier',
  identifier: 'Identifier',
  participations: 'Participations',
  status: 'Status',
  properties: 'Properties',
  name: 'Name',
  active: 'Active',
  inactive: 'Inactive',
  created_at: 'Created at',
  updated_at: 'Updated at',
  buttons: {
    edit: 'Edit',
    delete: 'Delete'
  },
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
        notEmpty: 'identifier cannot be empty'
      }
    }
  },
  dialogs: {
    new: {
      title: 'Add a new Participant',
      subtitle: 'Please enter the information below'
    }
  }
}
