// Jest Snapshot v1, https://goo.gl/fbAQLP

exports[`Password wrapper matches its snapshot 1`] = `
<v-card-stub loaderheight="4" tag="div" width="475">
  <v-card-title-stub class="justify-center">
    <v-img-stub maxheight="40" maxwidth="40" contain="true" options="[object Object]" position="center center" src transition="fade-transition" class="mx-2"></v-img-stub>
    <span class="display-1 font-weight-light">Open Monkey Mind</span>
  </v-card-title-stub>
  <v-card-text-stub>
    <p class="text-center">
      password_recover.subheader
    </p>
    <v-form-stub lazyvalidation="true" value="true">
      <v-row-stub tag="div">
        <v-col-stub cols="12" tag="div">
          <v-text-field-stub errorcount="1" errormessages messages rules="v => {
            /* istanbul ignore next */
            cov_we1qd24j0().f[2]++;
            cov_we1qd24j0().s[8]++;
            return (
              /* istanbul ignore next */
              (cov_we1qd24j0().b[0][0]++, !(0, _validator.isEmpty)(\`\${v}\`)) ||
              /* istanbul ignore next */
              (cov_we1qd24j0().b[0][1]++, this.$t('password_recover.fields.email.validation.empty'))
            );
          },v => {
            /* istanbul ignore next */
            cov_we1qd24j0().f[3]++;
            cov_we1qd24j0().s[9]++;
            return (
              /* istanbul ignore next */
              (cov_we1qd24j0().b[1][0]++, (0, _validator.isEmail)(v)) ||
              /* istanbul ignore next */
              (cov_we1qd24j0().b[1][1]++, this.$t('password_recover.fields.email.validation.invalid'))
            );
          }" successmessages value backgroundcolor label="password_recover.fields.email.label" loaderheight="2" clearicon="$clear" type="text"></v-text-field-stub>
        </v-col-stub>
      </v-row-stub>
    </v-form-stub>
  </v-card-text-stub>
  <v-card-actions-stub>
    <v-spacer-stub></v-spacer-stub>
    <v-btn-stub color="primary" tag="button" activeclass to="[object Object]" nuxt="true" type="button">
      password_recover.buttons.signin
    </v-btn-stub>
    <v-btn-stub color="success" tag="button" activeclass type="button">
      password_recover.buttons.email
      <v-icon-stub right>
        mdi-send
      </v-icon-stub>
    </v-btn-stub>
  </v-card-actions-stub>
</v-card-stub>
`;
