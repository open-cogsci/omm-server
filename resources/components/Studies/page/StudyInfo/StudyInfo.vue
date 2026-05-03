<template>
  <div>
    <v-skeleton-loader v-if="loading" type="text@15" />
    <div v-else>
      <v-fade-transition mode="out-in">
        <div v-if="editMode" key="edit">
          <div class="d-flex justify-end">
            <v-btn @click="cancel">
              <v-icon left>
                mdi-cancel
              </v-icon>
              {{ $t('buttons.cancel') }}
            </v-btn>
            <v-btn color="primary" class="ml-2" @click="save">
              <v-icon left>
                mdi-check
              </v-icon>
              {{ $t('buttons.save') }}
            </v-btn>
          </div>
          <v-textarea
            v-model="buffer"
            auto-grow
            label="Information"
          />
          <v-switch
            v-model="loopEnabled"
            :label="$t('studies.loop_enabled')"
            :hint="$t('studies.loop_enabled_hint')"
            persistent-hint
          />
        </div>
        <div v-else key="view">
          <div class="d-flex justify-end">
            <v-btn v-if="userCanEdit" @click="$emit('edit-study-data')">
              <v-icon left>
                mdi-database
              </v-icon>
              Edit Study Data
            </v-btn>
            <v-btn v-if="userCanEdit" color="primary" @click="editMode=true">
              <v-icon left>
                mdi-pencil
              </v-icon>
              {{ $t('common.edit') }}
            </v-btn>
          </div>
          <!--  eslint-disable-next-line vue/no-v-html -->
          <div class="black--text study-info-content" v-html="$md.render(study.information)" />
          <v-divider class="my-4" />
          <div class="d-flex align-center">
            <v-icon :color="study.loop_enabled ? 'primary' : 'grey'" class="mr-2">
              {{ study.loop_enabled ? 'mdi-repeat' : 'mdi-repeat-off' }}
            </v-icon>
            <span :class="study.loop_enabled ? 'black--text' : 'grey--text'">
              {{ study.loop_enabled ? $t('studies.loop_enabled') : $t('studies.loop_disabled') }}
            </span>
          </div>
        </div>
      </v-fade-transition>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    study: {
      type: Object,
      default: () => ({})
    },
    userCanEdit: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      editMode: false,
      buffer: this.study?.information ?? '',
      loopEnabled: this.study?.loop_enabled ?? false
    }
  },
  watch: {
    study (newData, oldData) {
      if (newData?.information === oldData?.information) { return }
      this.buffer = newData.information
      this.loopEnabled = newData?.loop_enabled ?? false
    }
  },
  methods: {
    cancel () {
      this.buffer = this.study?.information ?? ''
      this.loopEnabled = this.study?.loop_enabled ?? false
      this.editMode = false
    },
    save () {
      this.$emit('editted', {
        information: this.buffer,
        loop_enabled: this.loopEnabled
      })
      this.editMode = false
    }
  }
}
</script>
