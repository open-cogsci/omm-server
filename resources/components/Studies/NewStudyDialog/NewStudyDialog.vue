<template>
  <!-- eslint-disable vue/valid-v-on -->
  <v-dialog
    :value="value"
    max-width="750px"
    @input="(val) => $emit('input', val)"
  >
    <v-card>
      <v-card-title>Add new study</v-card-title>
      <v-card-text>
        <v-form>
          <v-text-field v-model="name" label="Title" />
          <v-text-field v-model="description" label="Description" />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn class="success">
          Save
        </v-btn>
        <v-btn @click="cancel">
          Cancel
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  sync: ['name', 'description'],
  props: {
    value: {
      type: Boolean,
      required: true
    }
  },
  methods: {
    cancel () {
      this.name = ''
      this.description = ''
      this.$emit('input', false)
    }
  }
}
</script>
