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
        </div>
        <div v-else key="view">
          <div class="d-flex justify-end">
            <v-btn color="primary" @click="editMode=true">
              <v-icon left>
                mdi-pencil
              </v-icon>
              {{ $t('common.edit') }}
            </v-btn>
          </div>
          <!--  eslint-disable-next-line vue/no-v-html -->
          <div class="black--text study-info-content" v-html="$md.render(study.information)" />
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
    }
  },
  data () {
    return {
      editMode: false,
      buffer: this.study?.information ?? ''
    }
  },
  watch: {
    study (newData, oldData) {
      if (newData?.information === oldData?.information) { return }
      this.buffer = newData.information
    }
  },
  methods: {
    cancel () {
      this.buffer = this.study?.information ?? ''
      this.editMode = false
    },
    save () {
      this.$emit('editted', { information: this.buffer })
      this.editMode = false
    }
  }
}
</script>
