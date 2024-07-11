'use strict'

class SaveParticipant {
  get rules () {
    const ptcpId = this.ctx.params.id
    return {
      // validation rules
      name: 'required|max:50',
      identifier: `required|unique:participants,identifier,id,${ptcpId}|unique:participants,alternate_identifier,id,${ptcpId}`,
      alternate_identifier: `unique:participants,identifier,id,${ptcpId}|unique:participants,alternate_identifier,id,${ptcpId}`,
      meta: 'json'
    }
  }

  get messages () {
    return {
      'identifier.unique': 'This identifier is already used.',
      'alternate_identifier.unique': 'This identifier is already used.'
    }
  }
}

module.exports = SaveParticipant
