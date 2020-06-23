// Jest Snapshot v1, https://goo.gl/fbAQLP

exports[`Password wrapper matches its snapshot 1`] = `
<v-card-stub loaderheight="4" tag="div">
  <v-card-title-stub>
    <v-img-stub maxheight="40" maxwidth="40" contain="true" options="[object Object]" position="center center" src="" transition="fade-transition" class="mx-2"></v-img-stub> <span class="display-1 font-weight-light">Open Monkey Mind</span>
  </v-card-title-stub>
  <v-card-text-stub>
    <p>password.subheader</p>
    <v-form-stub lazyvalidation="true" value="true">
      <v-row-stub tag="div">
        <v-col-stub cols="12" tag="div">
          <v-text-field-stub errorcount="1" errormessages="" messages="" rules="v => {
            /* istanbul ignore next */
            cov_1ufdabfevv().f[2]++;
            cov_1ufdabfevv().s[6]++;
            return (
              /* istanbul ignore next */
              (cov_1ufdabfevv().b[0][0]++, !(0, _validator.isEmpty)(\`\${v}\`)) ||
              /* istanbul ignore next */
              (cov_1ufdabfevv().b[0][1]++, this.$t('password.fields.email.validation.empty'))
            );
          },v => {
            /* istanbul ignore next */
            cov_1ufdabfevv().f[3]++;
            cov_1ufdabfevv().s[7]++;
            return (
              /* istanbul ignore next */
              (cov_1ufdabfevv().b[1][0]++, (0, _validator.isEmail)(v)) ||
              /* istanbul ignore next */
              (cov_1ufdabfevv().b[1][1]++, this.$t('password.fields.email.validation.invalid'))
            );
          }" successmessages="" validateonblur="true" value="" backgroundcolor="" label="password.fields.email.label" loaderheight="2" clearicon="$clear" type="text"></v-text-field-stub>
        </v-col-stub>
      </v-row-stub>
    </v-form-stub>
  </v-card-text-stub>
  <v-card-actions-stub>
    <v-spacer-stub></v-spacer-stub>
    <v-btn-stub color="primary" tag="button" activeclass="" to="[object Object]" nuxt="true" type="button">
      password.buttons.signin
    </v-btn-stub>
    <v-btn-stub color="success" tag="button" activeclass="" type="button">
      password.buttons.email
      <v-icon-stub right="">
        mdi-send
      </v-icon-stub>
    </v-btn-stub>
  </v-card-actions-stub>
</v-card-stub>
`;
