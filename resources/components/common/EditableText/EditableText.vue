<template>
  <v-fade-transition mode="out-in">
    <v-col v-if="editing" key="editing" cols="12" lg="10" xl="8">
      <v-form v-model="validates" @submit.prevent="save('name')">
        <v-text-field
          :value="value"
          dense
          outlined
          label="Name"
          :counter="maxLength.name"
          :rules="rules"
          :error-messages="errorMessages"
          @keydown.esc="editing = false"
          @input="$emit('input', $event)"
        >
          <template v-slot:append-outer>
            <save-cancel-icon-buttons
              :save-disabled="!validates"
              @clicked-save="save('name')"
              @clicked-cancel="editing = false"
            />
          </template>
        </v-text-field>
      </v-form>
    </v-col>
    <v-col v-else key="viewing" cols="12">
      <v-hover v-slot:default="{ hover }">
        <p :class="classes">
          {{ value }}
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
</template>

<script>
export default {
  sync: ['editing', 'validates', 'errorMessages'],
  props: {
    value: {
      type: String,
      default: ''
    },
    rules: {
      type: Array,
      default: () => ([])
    },
    classes: {
      type: String,
      default: ''
    }
  }

}
</script>
