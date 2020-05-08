<template>
  <v-dialog
    :value="value"
    max-width="750px"
    @input="$emit('input', val)"
  >
    <v-card>
      <v-card-title>Add a new study</v-card-title>
      <v-card-text class="body-1 font-weight-light">
        Please enter the information below
      </v-card-text>
      <v-card-text>
        <v-form ref="form">
          <v-text-field
            v-model="name"
            label="Title"
          />
          <v-text-field
            v-model="description"
            label="Description"
          />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn class="success" @click="save">
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
    },
    save () {
      if (this.$refs.form.validate()) {
        this.$emit('clicked-save')
      }
    }
  }
}
</script>
