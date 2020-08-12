<template>
  <v-skeleton-loader
    :loading="loading"
    type="list-item-two-line"
    transition="fade-transition"
    height="115"
  >
    <v-row v-if="study" key="study" no-gutters>
      <v-col cols="12">
        <v-row no-gutters>
          <editable-text
            :editable="editable"
            label="Name"
            :value="study.name"
            :max-length="maxLength.name"
            :rules="validation.name"
            :errors="errors.name"
            classes="text-h5 text-md-h4 font-weight-light mb-4"
            @update:error="removeErrors('name')"
            @save="(val) => $emit('editted', { name: val })"
          />
        </v-row>
        <v-row no-gutters>
          <editable-text
            :editable="editable"
            label="Description"
            :value="study.description"
            :max-length="maxLength.description"
            :rules="validation.description"
            :errors.sync="errors.description"
            classes="text-h6 text-md-h5 font-weight-light grey--text mb-6"
            @update:error="removeErrors('description')"
            @save="(val) => $emit('editted', { description: val })"
          />
        </v-row>
      </v-col>
    </v-row>
    <div v-else key="no-study">
      <p class="display-1 font-weight-light red--text">
        Study could not be found.
      </p>
    </div>
  </v-skeleton-loader>
</template>

<script>
import { isEmpty, isLength } from 'validator'
export default {
  components: {
    EditableText: () => import('@/components/common/EditableText')
  },
  props: {
    study: {
      type: Object,
      default: () => {}
    },
    loading: {
      type: Boolean,
      required: true
    },
    errors: {
      type: Object,
      default: () => ({ name: '', description: '' })
    },
    editable: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      editing: {
        name: false,
        description: false
      },
      valid: {
        name: true,
        description: true
      },
      maxLength: {
        name: 50,
        description: 100
      },
      validation: {
        name: [
          v => !isEmpty(v) || 'Please give your study a name',
          v => isLength(v, { max: this.maxLength.name }) ||
          `This field has a maximum of ${this.maxLength.name} characters`
        ],
        description: [
          v => isLength(v, { max: this.maxLength.description }) ||
          `This field has a maximum of ${this.maxLength.description} characters`
        ]
      }
    }
  },
  methods: {
    editName () {
      this.localStudy.name = this.study.name
      this.editing.name = true
    },
    editDescription () {
      this.localStudy.description = this.study.description
      this.editing.description = true
    },
    removeErrors (field) {
      if (!this.errors[field]) { return }
      const errors = {
        ...this.errors,
        [field]: ''
      }
      this.$emit('update:errors', errors)
    }
  }
}
</script>
