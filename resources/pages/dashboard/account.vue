<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="display-1 font-weight-light">
          Your account
        </h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            Your details
          </v-card-title>
          <v-card-text>
            <v-form>
              <v-container fluid>
                <v-row>
                  <v-col cols="12">
                    <v-text-field v-model="user.name" label="Name" />
                  </v-col>
                  <v-col cols="12">
                    <v-text-field v-model="user.email" label="Email" />
                  </v-col>
                </v-row>
              </v-container>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            Change your password
          </v-card-title>
          <v-card-text>
            <v-form>
              <v-container fluid>
                <v-row>
                  <v-col cols="12">
                    <v-text-field v-model="user.name" label="Name" />
                  </v-col>
                  <v-col cols="12">
                    <v-text-field v-model="user.email" label="Email" />
                  </v-col>
                </v-row>
              </v-container>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data () {
    return {
      user: { ...this.$auth.user }
    }
  }
}
</script>
