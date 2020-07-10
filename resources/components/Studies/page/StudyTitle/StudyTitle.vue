<template>
  <v-skeleton-loader
    :loading="loading"
    type="heading"
    transition="fade-transition"
    height="294"
  >
    <v-row v-if="study">
      <v-col v-if="editing" cols="12" md="6">
        <v-form>
          <v-text-field v-model="localStudy.name" label="Name" />
          <v-text-field v-model="localStudy.description" label="Description" />
        </v-form>
      </v-col>
      <v-col v-else cols="12">
        <p class="text-h5 text-md-h4 font-weight-light" v-text="study.name" />
        <h2
          v-if="study.description"
          class="text-h6 text-md-h6 font-weight-light grey--text"
          v-text="study.description"
        />
      </v-col>
    </v-row>
    <div v-else>
      <p class="display-1 font-weight-light red--text">
        Study could not be found.
      </p>
    </div>
  </v-skeleton-loader>
</template>

<script>
export default {
  props: {
    study: {
      type: Object,
      default: () => {}
    },
    loading: {
      type: Boolean,
      required: true
    }
  },
  data () {
    return {
      editing: false,
      localStudy: { ...this.study }
    }
  }
}
</script>
