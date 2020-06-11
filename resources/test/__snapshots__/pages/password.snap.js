// Jest Snapshot v1, https://goo.gl/fbAQLP

exports[`Password wrapper Should match snapshot 1`] = `
<v-card-stub loaderheight="4" tag="div">
  <v-card-title-stub>
    <v-img-stub maxheight="40" maxwidth="40" contain="true" options="[object Object]" position="center center" src="" transition="fade-transition" class="mx-2"></v-img-stub> <span class="display-1 font-weight-light">Open Monkey Mind</span>
  </v-card-title-stub>
  <v-card-text-stub>
    <p>Send a password reset link to the provided e-mail address.</p>
    <v-form-stub lazyvalidation="true" value="true">
      <v-row-stub tag="div">
        <v-col-stub cols="12" tag="div">
          <v-text-field-stub errorcount="1" errormessages="" messages="" rules="v => {
            /* istanbul ignore next */
            cov_2o0u0gd9re().f[2]++;
            cov_2o0u0gd9re().s[6]++;
            return (
              /* istanbul ignore next */
              (cov_2o0u0gd9re().b[0][0]++, !!v) ||
              /* istanbul ignore next */
              (cov_2o0u0gd9re().b[0][1]++, 'Please provide your email address')
            );
          },v => {
            /* istanbul ignore next */
            cov_2o0u0gd9re().f[3]++;
            cov_2o0u0gd9re().s[7]++;
            return (
              /* istanbul ignore next */
              (cov_2o0u0gd9re().b[1][0]++, (0, _validationrules.emailRule)(v)) ||
              /* istanbul ignore next */
              (cov_2o0u0gd9re().b[1][1]++, 'This e-mail address is invalid')
            );
          }" successmessages="" validateonblur="true" backgroundcolor="" label="Email address" loaderheight="2" clearicon="$clear" type="text"></v-text-field-stub>
        </v-col-stub>
      </v-row-stub>
    </v-form-stub>
  </v-card-text-stub>
  <v-card-actions-stub>
    <v-spacer-stub></v-spacer-stub>
    <v-btn-stub color="primary" tag="button" activeclass="" to="/login" nuxt="true" type="button">
      Sign in
    </v-btn-stub>
    <v-btn-stub color="success" tag="button" activeclass="" type="button">
      Send e-mail
      <v-icon-stub right="">
        mdi-send
      </v-icon-stub>
    </v-btn-stub>
  </v-card-actions-stub>
</v-card-stub>
`;
