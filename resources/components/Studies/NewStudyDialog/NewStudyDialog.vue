<template>
  <v-dialog
    :value="value"
    max-width="750px"
    @input="$emit('input', $event)"
  >
    <v-card>
      <v-card-title>Add a new study</v-card-title>
      <v-card-text class="body-1 font-weight-light">
        Please enter the information below
      </v-card-text>
      <v-card-text>
        <v-form ref="form" v-model="formValid" @submit.prevent="save">
          <v-text-field
            v-model="study.name"
            label="Title"
            :counter="maxNameLength"
            :rules="validation.name"
            :error-messages="errors.name"
            @input="removeErrors('name')"
          />
          <v-textarea
            v-model="study.description"
            rows="2"
            label="Description"
            :counter="maxDescLength"
            :rules="validation.description"
            :error-messages="errors.description"
            @input="removeErrors('description')"
          />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          class="success"
          :disabled="!formValid"
          :loading="saving"
          @click="save"
        >
          Save
        </v-btn>
        <v-btn class="cancel" @click="cancel">
          Cancel
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { notEmpty, maxLength } from '@/assets/js/validationrules'

export default {
  props: {
    value: {
      type: Boolean,
      required: true
    },
    saving: {
      type: Boolean,
      default: false
    },
    errors: {
      type: Object,
      default: () => ({ name: '', description: '' })
    }
  },
  data () {
    return {
      study: {
        name: '',
        description: ''
      },
      formValid: true,
      maxNameLength: 50,
      maxDescLength: 100,
      validation: {
        name: [
          v => notEmpty(v) || 'Please give your study a name',
          v => maxLength(v, this.maxNameLength) ||
          `This field has a maximum of ${this.maxNameLength} characters`
        ],
        description: [
          v => maxLength(v, this.maxDescLength) ||
          `This field has a maximum of ${this.maxDescLength} characters`
        ]
      }
    }
  },
  watch: {
    value (val) {
      if (!val) {
        this.clear()
      }
    }
  },
  methods: {
    cancel () {
      this.$emit('input', false)
    },
    save () {
      if (this.$refs.form.validate()) {
        this.$emit('clicked-save', this.study)
      }
    },
    clear () {
      this.study.name = ''
      this.study.description = ''
      this.$refs.form.resetValidation()
    },
    removeErrors (field) {
      const errors = {
        ...this.errors,
        [field]: ''
      }
      this.$emit('update:errors', errors)
    }
  }
}
</script>
