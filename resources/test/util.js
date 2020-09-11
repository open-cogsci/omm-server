// Fragment needs a parent to function correctly so wrap the component
export const FragmentWrapper = Wrapped => ({
  components: { Wrapped },
  // props: Wrapped.props,
  template: '<div><Wrapped v-bind="$attrs" v-on="$listeners"></Wrapped></div>'
})
