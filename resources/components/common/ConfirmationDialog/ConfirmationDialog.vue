<template>
  <v-dialog :value="dialog" v-bind="$attrs" persistent max-width="600" v-on="$listeners">
    <template v-for="(_, slot) of $scopedSlots" #[slot]="scope">
      <slot :name="slot" v-bind="scope" />
    </template>
    <template #default>
      <v-card>
        <v-card-title>
          <slot name="title">
            {{ $t('common.dialogs.confirm') }}
          </slot>
        </v-card-title>
        <v-card-text>
          <slot />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="$emit('clicked-no')">
            {{ $t('buttons.reject') }}
          </v-btn>
          <v-btn text color="primary" @click="$emit('clicked-yes')">
            {{ $t('buttons.confirm') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      required: true
    }
  },
  computed: {
    dialog: {
      get () {
        return this.value
      },
      set (val) {
        this.$emit('input', val)
      }
    }
  }

}
</script>
