<template>
  <v-skeleton-loader
    :loading="loading"
    type="heading"
    transition="fade-transition"
    height="294"
  >
    <v-row v-if="study" no-gutters>
      <v-col cols="12">
        <v-row no-gutters>
          <v-fade-transition mode="out-in">
            <v-col v-if="editing.name" key="editing" cols="12" lg="10" xl="8">
              <v-form v-model="valid.name">
                <v-text-field
                  v-model="localStudy.name"
                  dense
                  outlined
                  label="Name"
                  :counter="maxLength.name"
                  :rules="validation.name"
                  :error-messages="errors.name"
                >
                  <template v-slot:append-outer>
                    <save-cancel-icon-buttons
                      :save-disabled="!valid.name"
                      @clicked-save="$emit('editted', {name: localStudy.name}); editing.name=false"
                      @clicked-cancel="editing.name = false"
                    />
                  </template>
                </v-text-field>
              </v-form>
            </v-col>
            <v-col v-else key="viewing" cols="12">
              <v-hover v-slot:default="{ hover }">
                <p class="text-h5 text-md-h4 font-weight-light">
                  {{ study.name }}
                  <v-fab-transition>
                    <v-btn v-show="hover" icon @click="editName">
                      <v-icon color="primary">
                        mdi-pencil
                      </v-icon>
                    </v-btn>
                  </v-fab-transition>
                </p>
              </v-hover>
            </v-col>
          </v-fade-transition>
        </v-row>
        <v-row no-gutters>
          <v-fade-transition mode="out-in">
            <v-col v-if="editing.description" key="editing" cols="12" lg="10" xl="8">
              <v-form v-model="valid.description">
                <v-text-field
                  v-model="localStudy.description"
                  dense
                  :counter="maxLength.description"
                  :rules="validation.description"
                  :error-messages="errors.description"
                  outlined
                  label="Description"
                  @input="removeErrors('description')"
                >
                  <template v-slot:append-outer>
                    <save-cancel-icon-buttons
                      :save-disabled="!valid.description"
                      @clicked-save="$emit('editted', {description: localStudy.description}); editing.description=false"
                      @clicked-cancel="editing.description = false"
                    />
                  </template>
                </v-text-field>
              </v-form>
            </v-col>
            <v-col v-else cols="12">
              <v-hover v-slot:default="{ hover }">
                <h2
                  v-if="study.description"
                  class="text-h6 text-md-h5 font-weight-light grey--text"
                >
                  {{ study.description }}
                  <v-fab-transition>
                    <v-btn v-show="hover" icon @click="editDescription">
                      <v-icon color="primary">
                        mdi-pencil
                      </v-icon>
                    </v-btn>
                  </v-fab-transition>
                </h2>
              </v-hover>
            </v-col>
          </v-fade-transition>
        </v-row>
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
import { isEmpty, isLength } from 'validator'
export default {
  components: {
    SaveCancelIconButtons: () => import('@/components/common/SaveCancelIconButtons')
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
    }
  },
  data () {
    return {
      localStudy: { ...this.study },
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
