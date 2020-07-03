'use strict'

class SaveParticipant {
  get rules () {
    const ptcpId = this.ctx.params.id
    return {
      // validation rules
      name: 'required|max:50',
      rfid: `required|unique:participants,rfid,id,${ptcpId}`
    }
  }

  get messages () {
    return {
      'rfid.unique': 'This RFID is already used.'
    }
  }
}

module.exports = SaveParticipant
