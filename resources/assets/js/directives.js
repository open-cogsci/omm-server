import Sortable from 'sortablejs'
export const sortableTable = {
  bind (el, binding, vnode) {
    const options = {
      handle: '.sortHandle',
      animation: 150,
      onUpdate (event) {
        vnode.child.$emit('sorted', event)
      }
    }
    Sortable.create(el.getElementsByTagName('tbody')[0], options)
  }
}
